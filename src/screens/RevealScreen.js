import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Subtitle } from '../components/ui';
import { FadeIn, PopIn, Pulse } from '../components/anim';

// Pass-the-phone card reveal. Each player in turn:
//  1. sees "Pass the phone to <name>"
//  2. taps "I'm <name>" to get their card
//  3. HOLDS the card down to see the word (or the imposter hint)
//  4. releases, taps "Done — next player"
export default function RevealScreen({ state, dispatch }) {
  const { round, players } = state;
  const idx = round.revealIndex;
  const player = players[idx];
  const isImposter = round.imposters.includes(idx);
  const color = playerColor(player.colorIndex);

  const [claimed, setClaimed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    setHolding(true);
    setPeeked(true);
    Animated.spring(scale, { toValue: 1.03, friction: 6, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    setHolding(false);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  };

  if (!claimed) {
    return (
      <View style={styles.wrap}>
        <FadeIn>
          <Text style={styles.step}>
            PLAYER {idx + 1} OF {players.length}
          </Text>
        </FadeIn>
        <View style={styles.center}>
          <Subtitle style={{ textAlign: 'center', marginBottom: 16, fontSize: 18 }}>
            Pass the phone to
          </Subtitle>
          <PopIn delay={150}>
            <View style={[styles.nameBadge, { backgroundColor: color }]}>
              <Text style={styles.nameBadgeText}>{player.name}</Text>
            </View>
          </PopIn>
          <FadeIn delay={350}>
            <Subtitle style={{ textAlign: 'center', marginTop: 18 }}>
              No peeking, everyone else! 👀
            </Subtitle>
          </FadeIn>
        </View>
        <Button title={`I'm ${player.name} — show my card`} onPress={() => setClaimed(true)} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>{player.name.toUpperCase()} — YOUR SECRET CARD</Text>
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={[
              styles.card,
              { borderColor: color },
              holding && { backgroundColor: COLORS.surfaceHi },
            ]}
          >
            {holding ? (
              isImposter ? (
                <>
                  <Text style={styles.imposterLabel}>🕵️ YOU ARE THE IMPOSTER</Text>
                  <Text style={styles.hintLabel}>Your only hint:</Text>
                  <Text style={styles.word}>{round.word.h}</Text>
                  <Text style={styles.tip}>Blend in. Don't get caught.</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.crewLabel, { color }]}>THE SECRET WORD IS</Text>
                  <Text style={styles.word}>{round.word.w}</Text>
                  <Text style={styles.category}>{round.word.category}</Text>
                </>
              )
            ) : (
              <Pulse style={{ alignItems: 'center' }}>
                <Text style={styles.holdIcon}>🤫</Text>
                <Text style={styles.holdText}>HOLD TO REVEAL</Text>
                <Text style={styles.tip}>Word shows only while pressed</Text>
              </Pulse>
            )}
          </Pressable>
        </Animated.View>
      </View>
      <Button
        title={idx + 1 < players.length ? 'Done — next player' : 'Done — start discussion'}
        disabled={!peeked}
        onPress={() => dispatch({ type: 'NEXT_REVEAL' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'space-between' },
  step: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
  center: { flex: 1, justifyContent: 'center' },
  nameBadge: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
  nameBadgeText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  card: {
    minHeight: 300,
    borderRadius: 24,
    borderWidth: 3,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  holdIcon: { fontSize: 44, marginBottom: 12 },
  holdText: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  tip: { color: COLORS.textDim, fontSize: 13, marginTop: 12, textAlign: 'center' },
  imposterLabel: { color: COLORS.accent, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  hintLabel: { color: COLORS.textDim, fontSize: 14, marginTop: 18 },
  crewLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  word: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },
  category: { color: COLORS.textDim, fontSize: 14, marginTop: 10 },
});
