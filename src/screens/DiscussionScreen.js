import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Subtitle } from '../components/ui';
import { FadeIn, PopIn, Pulse } from '../components/anim';
import { aliveIndices } from '../state/gameReducer';

export default function DiscussionScreen({ state, dispatch }) {
  const { round, players, timerMin } = state;
  const starter = players[round.starterIndex];
  const alive = aliveIndices(round, players);
  const [secondsLeft, setSecondsLeft] = useState(timerMin * 60);

  useEffect(() => {
    if (timerMin === 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timerMin]);

  const timeUp = timerMin > 0 && secondsLeft === 0;
  const low = timerMin > 0 && secondsLeft <= 30 && !timeUp;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={styles.wrap}>
      <FadeIn>
        <Text style={styles.phase}>
          🗣️ DISCUSSION{round.cycle > 1 ? `  ·  ROUND ${round.cycle}` : ''}
        </Text>
        {round.cycle > 1 && (
          <Subtitle style={{ textAlign: 'center', marginTop: 6 }}>
            {alive.length} players remain
          </Subtitle>
        )}
      </FadeIn>
      <View style={styles.center}>
        <Subtitle style={{ textAlign: 'center' }}>Discussion starts with</Subtitle>
        <PopIn delay={200}>
          <View
            style={[styles.starterBadge, { backgroundColor: playerColor(starter.colorIndex) }]}
          >
            <Text style={styles.starterText}>{starter.name}</Text>
          </View>
        </PopIn>
        <FadeIn delay={400}>
          <Subtitle style={{ textAlign: 'center', marginTop: 20, paddingHorizontal: 10 }}>
            Everyone describes the secret word without saying it.{'\n'}
            Imposters: fake it. Crew: sniff them out.
          </Subtitle>
        </FadeIn>

        {timerMin > 0 && (
          <Pulse active={low || timeUp} style={styles.timerBox}>
            <Text
              style={[
                styles.timer,
                low && { color: COLORS.warn },
                timeUp && { color: COLORS.danger, fontSize: 40 },
              ]}
            >
              {timeUp ? "TIME'S UP!" : `${mm}:${ss}`}
            </Text>
            {low && <Text style={styles.timerWarn}>Wrap it up…</Text>}
          </Pulse>
        )}
      </View>
      <Button title="🗳️  GO TO VOTING" onPress={() => dispatch({ type: 'START_VOTING' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'space-between' },
  phase: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  starterBadge: {
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginTop: 14,
  },
  starterText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  timerBox: { marginTop: 34, alignItems: 'center' },
  timer: {
    color: COLORS.text,
    fontSize: 56,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  timerWarn: { color: COLORS.warn, fontSize: 14, fontWeight: '700', marginTop: 4 },
});
