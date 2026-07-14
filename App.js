import React, { useEffect, useReducer, useRef } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/theme';
import { gameReducer, initialState } from './src/state/gameReducer';
import { loadScores, saveScores, loadPacks, loadSettings, saveSettings } from './src/storage';

import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import RevealScreen from './src/screens/RevealScreen';
import DiscussionScreen from './src/screens/DiscussionScreen';
import VotingScreen from './src/screens/VotingScreen';
import EjectionScreen from './src/screens/EjectionScreen';
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
  ejection: EjectionScreen,
  results: ResultsScreen,
  scoreboard: ScoreboardScreen,
  packs: PacksScreen,
  howto: HowToScreen,
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

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

  // Android back gesture/button: navigate back in-app; only exit from home.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phaseRef.current === 'home') return false; // let Android exit
      dispatch({ type: 'BACK' });
      return true;
    });
    return () => sub.remove();
  }, []);

  const Screen = SCREENS[state.phase] || HomeScreen;

  // key forces remount per phase/turn/cycle so per-turn local state and
  // entrance animations reset.
  const screenKey =
    state.phase === 'reveal'
      ? `reveal-${state.round?.revealIndex}`
      : state.phase === 'voting'
      ? `vote-${state.round?.cycle}-${state.round?.votePos}`
      : state.phase === 'discussion'
      ? `discussion-${state.round?.cycle}`
      : state.phase === 'ejection'
      ? `ejection-${state.round?.cycle}`
      : state.phase;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <PhaseTransition screenKey={screenKey}>
          <Screen key={screenKey} state={state} dispatch={dispatch} />
        </PhaseTransition>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Cross-fade + slide between phases for a smooth, app-wide transition.
function PhaseTransition({ screenKey, children }) {
  const v = useRef(new Animated.Value(1)).current;
  const prevKey = useRef(screenKey);

  useEffect(() => {
    if (prevKey.current !== screenKey) {
      prevKey.current = screenKey;
      v.setValue(0);
      Animated.spring(v, {
        toValue: 1,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }).start();
    }
  }, [screenKey, v]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
});
