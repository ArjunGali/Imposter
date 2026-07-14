import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Card, Subtitle } from '../components/ui';
import { FadeIn, PopIn, GrowBar } from '../components/anim';
import { aliveImposters } from '../state/gameReducer';

// Post-vote reveal: animated tally, then the ejected player's role —
// and ONLY theirs. Remaining imposters stay hidden.
export default function EjectionScreen({ state, dispatch }) {
  const { round, players } = state;
  const e = round.lastEjection;
  const totalVotes = Object.values(e.counts).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(e.counts));
  const [revealed, setRevealed] = useState(false);

  // Hold the verdict back briefly so the tally lands first.
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const ejected = e.ejectedIndex != null ? players[e.ejectedIndex] : null;
  const impsLeft = aliveImposters(round).length;

  const ranked = Object.entries(e.counts)
    .map(([idx, count]) => ({ idx: Number(idx), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn>
          <Text style={styles.phase}>🗳️ THE VOTES ARE IN</Text>
        </FadeIn>

        <Card style={{ marginTop: 16 }}>
          {ranked.map(({ idx, count }, i) => {
            const p = players[idx];
            const pc = playerColor(p.colorIndex);
            return (
              <FadeIn key={idx} delay={i * 120}>
                <View style={styles.tallyRow}>
                  <Text style={[styles.tallyName, { color: pc }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <GrowBar pct={count / maxVotes} color={pc} delay={200 + i * 120} />
                  </View>
                  <Text style={styles.tallyCount}>{count}</Text>
                </View>
              </FadeIn>
            );
          })}
          <Subtitle style={{ marginTop: 10, fontSize: 12 }}>
            {totalVotes} secret ballot{totalVotes !== 1 ? 's' : ''} cast
          </Subtitle>
        </Card>

        {revealed && (
          <PopIn delay={100}>
            {e.tie ? (
              <Card style={[styles.verdictCard, { borderColor: COLORS.warn }]}>
                <Text style={styles.verdictEmoji}>🤝</Text>
                <Text style={[styles.verdictTitle, { color: COLORS.warn }]}>
                  IT'S A TIE
                </Text>
                <Subtitle style={{ textAlign: 'center', marginTop: 6 }}>
                  Nobody gets ejected. Keep talking — someone is lying…
                </Subtitle>
              </Card>
            ) : (
              <Card
                style={[
                  styles.verdictCard,
                  { borderColor: e.wasImposter ? COLORS.accent : COLORS.good },
                ]}
              >
                <Text style={styles.verdictEmoji}>{e.wasImposter ? '🕵️' : '😇'}</Text>
                <Text
                  style={[
                    styles.verdictName,
                    { color: playerColor(ejected.colorIndex) },
                  ]}
                >
                  {ejected.name}
                </Text>
                <Text
                  style={[
                    styles.verdictTitle,
                    { color: e.wasImposter ? COLORS.accent : COLORS.good },
                  ]}
                >
                  {e.wasImposter ? 'WAS AN IMPOSTER!' : 'was innocent'}
                </Text>
                {!round.outcome && (
                  <Subtitle style={{ textAlign: 'center', marginTop: 8 }}>
                    {e.wasImposter
                      ? impsLeft > 0
                        ? 'But the deception isn’t over — keep playing!'
                        : ''
                      : 'The imposter is still among you. They sit out; the game goes on.'}
                  </Subtitle>
                )}
              </Card>
            )}
          </PopIn>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            !revealed
              ? '…'
              : round.outcome
              ? 'SEE THE RESULTS'
              : '🗣️ KEEP DISCUSSING'
          }
          disabled={!revealed}
          onPress={() => dispatch({ type: 'CONTINUE_AFTER_EJECTION' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 24 },
  phase: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
  tallyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 7 },
  tallyName: { width: 90, fontSize: 15, fontWeight: '800' },
  barTrack: { flex: 1, marginHorizontal: 10, justifyContent: 'center' },
  tallyCount: { color: COLORS.text, fontSize: 16, fontWeight: '900', width: 24, textAlign: 'right' },
  verdictCard: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 28,
    borderWidth: 2,
  },
  verdictEmoji: { fontSize: 48 },
  verdictName: { fontSize: 30, fontWeight: '900', marginTop: 10 },
  verdictTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  footer: { padding: 16, backgroundColor: COLORS.bg },
});
