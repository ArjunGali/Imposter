// Game state machine driven by useReducer.
//
// Phases:
//   home -> setup -> reveal -> discussion -> voting -> ejection
//                       ^                                 |
//                       |   (imposters remain, no winner) |
//                       +---------- discussion <----------+
//                                                          \
//                                        (winner decided) -> results
//   home -> scoreboard / packs / howto
//
// A round deals one secret word; imposters get only the hint. After each
// vote the most-voted player is ejected and ONLY their own role is
// revealed. Crew wins when every imposter is ejected; imposters win when
// they equal/outnumber the remaining crew. Ties eject nobody.

import { CATEGORIES } from '../data/words';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function maxImposters(playerCount) {
  // Imposters must stay a strict minority.
  return Math.max(1, Math.ceil(playerCount / 2) - 1);
}

export const initialState = {
  phase: 'home',
  players: [], // [{ name, colorIndex }]
  imposterCount: 1,
  timerMin: 0, // 0 = off, otherwise 1..10 minutes
  selectedCategoryIds: [], // empty = all
  customPacks: [],
  scores: {}, // { name: { points, wins, games } }
  round: null,
  usedWords: [], // words already dealt this session, to avoid repeats
  roundsPlayed: 0,
};

function pickWord(state) {
  const custom = state.customPacks.filter((p) => p.words.length > 0);
  const all = [...CATEGORIES, ...custom];
  const chosen =
    state.selectedCategoryIds.length > 0
      ? all.filter((c) => state.selectedCategoryIds.includes(c.id))
      : all;
  const pool = chosen.length > 0 ? chosen : CATEGORIES;

  let entries = [];
  for (const cat of pool) {
    for (const word of cat.words) {
      entries.push({ ...word, category: cat.name });
    }
  }
  let fresh = entries.filter((e) => !state.usedWords.includes(e.w));
  if (fresh.length === 0) fresh = entries; // everything used: recycle
  return fresh[Math.floor(Math.random() * fresh.length)];
}

export function aliveIndices(round, players) {
  return players.map((_, i) => i).filter((i) => !round.ejected.includes(i));
}

export function aliveImposters(round) {
  return round.imposters.filter((i) => !round.ejected.includes(i));
}

function dealRound(state) {
  const n = state.players.length;
  const word = pickWord(state);
  const count = Math.min(state.imposterCount, maxImposters(n));
  const imposterIdx = shuffle(state.players.map((_, i) => i)).slice(0, count);
  return {
    word,
    imposters: imposterIdx, // player indices
    ejected: [], // player indices voted out, in order
    revealIndex: 0, // whose turn to see their card
    cycle: 1, // discussion/vote cycle within this round
    starterIndex: Math.floor(Math.random() * n), // who opens discussion
    voteOrder: [], // alive player indices, voting order
    votePos: 0, // position within voteOrder
    votes: {}, // { voterIndex: votedIndex }
    lastEjection: null, // { counts, tie, ejectedIndex, wasImposter }
    outcome: null, // { winner: 'crew' | 'imposters' } once decided
  };
}

function pickStarter(round, players) {
  const alive = aliveIndices(round, players);
  return alive[Math.floor(Math.random() * alive.length)];
}

function tallyVotes(votes) {
  const counts = {};
  Object.values(votes).forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });
  let top = -1;
  let topVotes = 0;
  let tie = false;
  Object.entries(counts).forEach(([idx, c]) => {
    if (c > topVotes) {
      top = Number(idx);
      topVotes = c;
      tie = false;
    } else if (c === topVotes) {
      tie = true;
    }
  });
  return { counts, top, tie };
}

// Crew catches every imposter: +2 to each crew member.
// Imposters survive to parity: +3 to each imposter.
function applyScores(scores, players, round) {
  const next = { ...scores };
  const crewWins = round.outcome.winner === 'crew';
  players.forEach((p, i) => {
    const isImposter = round.imposters.includes(i);
    const prev = next[p.name] || { points: 0, wins: 0, games: 0 };
    const won = crewWins ? !isImposter : isImposter;
    next[p.name] = {
      points: prev.points + (won ? (crewWins ? 2 : 3) : 0),
      wins: prev.wins + (won ? 1 : 0),
      games: prev.games + 1,
    };
  });
  return next;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        scores: action.scores ?? state.scores,
        customPacks: action.packs ?? state.customPacks,
        ...(action.settings
          ? {
              players: (action.settings.players || []).map((name, i) => ({
                name,
                colorIndex: i,
              })),
              imposterCount: action.settings.imposters || 1,
              timerMin: action.settings.timerMin || 0,
              selectedCategoryIds: action.settings.categoryIds || [],
            }
          : {}),
      };

    case 'GO':
      return { ...state, phase: action.phase };

    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name || state.players.length >= MAX_PLAYERS) return state;
      if (state.players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
        return state;
      const used = state.players.map((p) => p.colorIndex);
      let colorIndex = 0;
      while (used.includes(colorIndex) && colorIndex < 11) colorIndex++;
      return { ...state, players: [...state.players, { name, colorIndex }] };
    }

    case 'REMOVE_PLAYER': {
      const players = state.players.filter((_, i) => i !== action.index);
      return {
        ...state,
        players,
        imposterCount: Math.min(state.imposterCount, maxImposters(players.length)),
      };
    }

    case 'SET_IMPOSTERS':
      return { ...state, imposterCount: action.count };

    case 'SET_TIMER':
      return { ...state, timerMin: action.minutes };

    case 'TOGGLE_CATEGORY': {
      const ids = state.selectedCategoryIds.includes(action.id)
        ? state.selectedCategoryIds.filter((c) => c !== action.id)
        : [...state.selectedCategoryIds, action.id];
      return { ...state, selectedCategoryIds: ids };
    }

    case 'SET_ALL_CATEGORIES':
      return { ...state, selectedCategoryIds: [] };

    case 'START_ROUND': {
      if (state.players.length < MIN_PLAYERS) return state;
      const round = dealRound(state);
      return {
        ...state,
        phase: 'reveal',
        round,
        usedWords: [...state.usedWords, round.word.w],
      };
    }

    case 'NEXT_REVEAL': {
      const next = state.round.revealIndex + 1;
      if (next >= state.players.length) {
        return { ...state, phase: 'discussion' };
      }
      return { ...state, round: { ...state.round, revealIndex: next } };
    }

    case 'START_VOTING': {
      const order = aliveIndices(state.round, state.players);
      return {
        ...state,
        phase: 'voting',
        round: { ...state.round, voteOrder: order, votePos: 0, votes: {} },
      };
    }

    case 'CAST_VOTE': {
      const r = state.round;
      const voter = r.voteOrder[r.votePos];
      const votes = { ...r.votes, [voter]: action.votedIndex };
      const nextPos = r.votePos + 1;
      if (nextPos < r.voteOrder.length) {
        return { ...state, round: { ...r, votes, votePos: nextPos } };
      }

      // Everyone voted: tally and eject.
      const { counts, top, tie } = tallyVotes(votes);
      let round = { ...r, votes };
      if (tie) {
        round.lastEjection = { counts, tie: true, ejectedIndex: null, wasImposter: false };
      } else {
        const wasImposter = round.imposters.includes(top);
        round.ejected = [...round.ejected, top];
        round.lastEjection = { counts, tie: false, ejectedIndex: top, wasImposter };
      }

      // Win check.
      const impsLeft = aliveImposters(round).length;
      const crewLeft =
        aliveIndices(round, state.players).length - impsLeft;
      let scores = state.scores;
      let roundsPlayed = state.roundsPlayed;
      if (impsLeft === 0) {
        round.outcome = { winner: 'crew' };
      } else if (impsLeft >= crewLeft) {
        round.outcome = { winner: 'imposters' };
      }
      if (round.outcome) {
        scores = applyScores(state.scores, state.players, round);
        roundsPlayed += 1;
      }
      return { ...state, phase: 'ejection', round, scores, roundsPlayed };
    }

    case 'CONTINUE_AFTER_EJECTION': {
      const r = state.round;
      if (r.outcome) {
        return { ...state, phase: 'results' };
      }
      const round = {
        ...r,
        cycle: r.cycle + 1,
        starterIndex: pickStarter(r, state.players),
      };
      return { ...state, phase: 'discussion', round };
    }

    case 'PLAY_AGAIN': {
      const round = dealRound(state);
      return {
        ...state,
        phase: 'reveal',
        round,
        usedWords: [...state.usedWords, round.word.w],
      };
    }

    case 'END_GAME':
      return { ...state, phase: 'home', round: null };

    case 'SET_PACKS':
      return { ...state, customPacks: action.packs };

    case 'SET_SCORES':
      return { ...state, scores: action.scores };

    // Android back gesture: step back one screen instead of closing.
    case 'BACK': {
      const p = state.phase;
      if (p === 'setup' || p === 'howto' || p === 'packs') {
        return { ...state, phase: 'home' };
      }
      if (p === 'scoreboard') {
        return { ...state, phase: state.round?.outcome ? 'results' : 'home' };
      }
      if (p === 'results') {
        return { ...state, phase: 'home', round: null };
      }
      // Mid-round screens: ignore (deliberate — no accidental round aborts).
      return state;
    }

    default:
      return state;
  }
}
