// Game state machine driven by useReducer.
//
// Screens/phases:
//   home -> setup -> reveal -> discussion -> voting -> results -> (reveal | setup | home)
//   home -> scoreboard / packs / howto
//
// A "round" deals one secret word; imposters get only the hint.

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

function dealRound(state) {
  const word = pickWord(state);
  const n = state.players.length;
  const count = Math.min(state.imposterCount, maxImposters(n));
  const imposterIdx = shuffle(state.players.map((_, i) => i)).slice(0, count);
  return {
    word,
    imposters: imposterIdx, // player indices
    revealIndex: 0, // whose turn to see their card
    revealDone: false,
    starterIndex: Math.floor(Math.random() * n), // who opens discussion
    votes: {}, // { voterIndex: votedIndex }
    voteIndex: 0, // whose turn to vote
    outcome: null, // computed at results
  };
}

function tallyOutcome(round, players) {
  const counts = {};
  Object.values(round.votes).forEach((v) => {
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
  const caught = !tie && round.imposters.includes(top);
  return {
    counts,
    accusedIndex: tie ? null : top,
    tie,
    crewWins: caught,
    // Crew catches an imposter: +2 to every crew member.
    // Tie or wrong accusation: every imposter escapes with +3.
    pointsPerWinner: caught ? 2 : 3,
  };
}

function applyScores(scores, players, round) {
  const next = { ...scores };
  const { crewWins } = round.outcome;
  players.forEach((p, i) => {
    const isImposter = round.imposters.includes(i);
    const prev = next[p.name] || { points: 0, wins: 0, games: 0 };
    const won = crewWins ? !isImposter : isImposter;
    next[p.name] = {
      points: prev.points + (won ? round.outcome.pointsPerWinner : 0),
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
        return {
          ...state,
          phase: 'discussion',
          round: { ...state.round, revealDone: true },
        };
      }
      return { ...state, round: { ...state.round, revealIndex: next } };
    }

    case 'START_VOTING':
      return { ...state, phase: 'voting' };

    case 'CAST_VOTE': {
      const votes = { ...state.round.votes, [state.round.voteIndex]: action.votedIndex };
      const next = state.round.voteIndex + 1;
      if (next >= state.players.length) {
        const round = { ...state.round, votes };
        round.outcome = tallyOutcome(round, state.players);
        return {
          ...state,
          phase: 'results',
          round,
          scores: applyScores(state.scores, state.players, round),
          roundsPlayed: state.roundsPlayed + 1,
        };
      }
      return { ...state, round: { ...state.round, votes, voteIndex: next } };
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

    default:
      return state;
  }
}
