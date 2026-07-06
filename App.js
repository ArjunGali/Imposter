import React, { useEffect, useReducer } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { COLORS } from './src/theme';
import { gameReducer, initialState } from './src/state/gameReducer';
import { loadScores, saveScores, loadPacks, loadSettings, saveSettings } from './src/storage';

import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import RevealScreen from './src/screens/RevealScreen';
import DiscussionScreen from './src/screens/DiscussionScreen';
import VotingScreen from './src/screens/VotingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import PacksScreen from './src/screens/PacksScreen';
import HowToScreen from './src/screens/HowToScreen';

const SCREENS = {
  home: HomeScreen,
  setup: SetupScreen,
  reveal: RevealScreen,
  discussion: DiscussionScreen,
  voting: VotingScreen,
  results: ResultsScreen,
  scoreboard: ScoreboardScreen,
  packs: PacksScreen,
  howto: HowToScreen,
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Hydrate persisted data on launch.
  useEffect(() => {
    (async () => {
      const [scores, packs, settings] = await Promise.all([
        loadScores(),
        loadPacks(),
        loadSettings(),
      ]);
      dispatch({ type: 'HYDRATE', scores, packs, settings });
    })();
  }, []);

  // Persist scoreboard whenever it changes.
  useEffect(() => {
    saveScores(state.scores);
  }, [state.scores]);

  // Remember setup choices for next launch.
  useEffect(() => {
    saveSettings({
      players: state.players.map((p) => p.name),
      imposters: state.imposterCount,
      timerMin: state.timerMin,
      categoryIds: state.selectedCategoryIds,
    });
  }, [state.players, state.imposterCount, state.timerMin, state.selectedCategoryIds]);

  const Screen = SCREENS[state.phase] || HomeScreen;

  // key forces remount per reveal/vote turn so per-turn local state resets.
  const screenKey =
    state.phase === 'reveal'
      ? `reveal-${state.round?.revealIndex}`
      : state.phase === 'voting'
      ? `vote-${state.round?.voteIndex}`
      : state.phase;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <Screen key={screenKey} state={state} dispatch={dispatch} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
});
