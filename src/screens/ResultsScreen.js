import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Card, Subtitle } from '../components/ui';

export default function ResultsScreen({ state, dispatch }) {
  const { round, players } = state;
  const o = round.outcome;
  const imposterNames = round.imposters.map((i) => players[i].name).join(', ');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.banner}>{o.crewWins ? '🎉' : '😈'}</Text>
        <Text style={[styles.verdict, { color: o.crewWins ? COLORS.good : COLORS.accent }]}>
          {o.crewWins ? 'IMPOSTER CAUGHT!' : 'THE IMPOSTER ESCAPED!'}
        </Text>
        <Subtitle style={{ textAlign: 'center', marginTop: 6 }}>
          {o.tie
            ? 'The vote was a tie — imposters slip away…'
            : o.crewWins
            ? `${players[o.accusedIndex].name} was voted out — and WAS an imposter. Crew +2 each.`
            : `${players[o.accusedIndex].name} was voted out — but was innocent! Imposters +3 each.`}
        </Subtitle>

        <Card style={{ marginTop: 20 }}>
          <Text style={styles.label}>THE WORD WAS</Text>
          <Text style={styles.word}>{round.word.w}</Text>
          <Text style={styles.label2}>
            Imposter hint: “{round.word.h}”
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.label}>
            {round.imposters.length > 1 ? 'THE IMPOSTERS WERE' : 'THE IMPOSTER WAS'}
          </Text>
          <Text style={[styles.word, { color: COLORS.accent }]}>{imposterNames}</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.label}>VOTES</Text>
          {players.map((p, i) => {
            const count = o.counts[i] || 0;
            if (count === 0) return null;
            return (
              <View key={p.name} style={styles.voteRow}>
                <View style={[styles.dot, { backgroundColor: playerColor(p.colorIndex) }]} />
                <Text style={styles.voteRowName}>
                  {p.name}
                  {round.imposters.includes(i) ? ' 🕵️' : ''}
                </Text>
                <Text style={styles.voteRowCount}>
                  {count} vote{count > 1 ? 's' : ''}
                </Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="End game"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => dispatch({ type: 'END_GAME' })}
        />
        <Button
          title="▶ NEXT ROUND"
          style={{ flex: 2 }}
          onPress={() => dispatch({ type: 'PLAY_AGAIN' })}
        />
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 14, backgroundColor: COLORS.bg }}>
        <Button
          title="🏆 View scoreboard"
          variant="ghost"
          onPress={() => dispatch({ type: 'GO', phase: 'scoreboard' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 24 },
  banner: { fontSize: 54, textAlign: 'center', marginTop: 8 },
  verdict: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 6,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  label2: { color: COLORS.textDim, fontSize: 13, marginTop: 8 },
  word: { color: COLORS.text, fontSize: 26, fontWeight: '900', marginTop: 6 },
  voteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  voteRowName: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  voteRowCount: { color: COLORS.textDim, fontSize: 14, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
