import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  scores: 'iw.scores.v1',
  packs: 'iw.customPacks.v1',
  settings: 'iw.settings.v1',
};

async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage failures are non-fatal for gameplay.
  }
}

// Scoreboard: { [playerName]: { points, wins, games } }
export const loadScores = () => loadJSON(KEYS.scores, {});
export const saveScores = (scores) => saveJSON(KEYS.scores, scores);
export const clearScores = () => saveJSON(KEYS.scores, {});

// Custom packs: [{ id, name, emoji, words: [{w, h}] }]
export const loadPacks = () => loadJSON(KEYS.packs, []);
export const savePacks = (packs) => saveJSON(KEYS.packs, packs);

// Settings: { players: [names], imposters, timerMin, categoryIds }
export const loadSettings = () => loadJSON(KEYS.settings, null);
export const saveSettings = (s) => saveJSON(KEYS.settings, s);
