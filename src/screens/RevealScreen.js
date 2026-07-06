import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Subtitle } from '../components/ui';

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

  const next = () => {
    setClaimed(false);
    setHolding(false);
    setPeeked(false);
    dispatch({ type: 'NEXT_REVEAL' });
  };

  if (!claimed) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.step}>
          PLAYER {idx + 1} OF {players.length}
        </Text>
        <View style={styles.center}>
          <Text style={styles.passLabel}>Pass the phone to</Text>
          <View style={[styles.nameBadge, { backgroundColor: color }]}>
            <Text style={styles.nameBadgeText}>{player.name}</Text>
          </View>
          <Subtitle style={{ textAlign: 'center', marginTop: 18 }}>
            No peeking, everyone else! 👀
          </Subtitle>
        </View>
        <Button title={`I'm ${player.name} — show my card`} onPress={() => setClaimed(true)} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>
        {player.name.toUpperCase()} — YOUR SECRET CARD
      </Text>
      <View style={styles.center}>
        <Pressable
          onPressIn={() => {
            setHolding(true);
            setPeeked(true);
          }}
          onPressOut={() => setHolding(false)}
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
            <>
              <Text style={styles.holdIcon}>🤫</Text>
              <Text style={styles.holdText}>HOLD TO REVEAL</Text>
              <Text style={styles.tip}>Word shows only while pressed</Text>
            </>
          )}
        </Pressable>
      </View>
      <Button
        title={idx + 1 < players.length ? 'Done — next player' : 'Done — start discussion'}
        disabled={!peeked}
        onPress={next}
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
  passLabel: { color: COLORS.textDim, fontSize: 18, textAlign: 'center', marginBottom: 16 },
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
