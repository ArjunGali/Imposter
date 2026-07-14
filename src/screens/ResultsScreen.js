import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Card, Subtitle } from '../components/ui';
import { FadeIn, PopIn } from '../components/anim';

export default function ResultsScreen({ state, dispatch }) {
  const { round, players } = state;
  const crewWins = round.outcome.winner === 'crew';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PopIn>
          <Text style={styles.banner}>{crewWins ? '🎉' : '😈'}</Text>
          <Text style={[styles.verdict, { color: crewWins ? COLORS.good : COLORS.accent }]}>
            {crewWins ? 'CREW WINS!' : 'IMPOSTERS WIN!'}
          </Text>
          <Subtitle style={{ textAlign: 'center', marginTop: 6 }}>
            {crewWins
              ? 'Every imposter was ejected. Crew +2 points each.'
              : 'The imposters reached the crew’s numbers. Imposters +3 points each.'}
          </Subtitle>
        </PopIn>

        <FadeIn delay={200}>
          <Card style={{ marginTop: 20 }}>
            <Text style={styles.label}>THE WORD WAS</Text>
            <Text style={styles.word}>{round.word.w}</Text>
            <Text style={styles.label2}>Imposter hint: “{round.word.h}”</Text>
          </Card>
        </FadeIn>

        <FadeIn delay={340}>
          <Card style={{ marginTop: 12 }}>
            <Text style={styles.label}>
              {round.imposters.length > 1 ? 'THE IMPOSTERS WERE' : 'THE IMPOSTER WAS'}
            </Text>
            <View style={styles.impRow}>
              {round.imposters.map((i) => (
                <View
                  key={i}
                  style={[styles.impTag, { backgroundColor: playerColor(players[i].colorIndex) }]}
                >
                  <Text style={styles.impTagText}>🕵️ {players[i].name}</Text>
                </View>
              ))}
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={480}>
          <Card style={{ marginTop: 12 }}>
            <Text style={styles.label}>THIS ROUND</Text>
            {players.map((p, i) => {
              const isImposter = round.imposters.includes(i);
              const won = crewWins ? !isImposter : isImposter;
              const pts = won ? (crewWins ? 2 : 3) : 0;
              const wasEjected = round.ejected.includes(i);
              return (
                <View key={p.name} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: playerColor(p.colorIndex) }]} />
                  <Text style={styles.rowName}>
                    {p.name}
                    {isImposter ? ' 🕵️' : ''}
                    {wasEjected ? '  (ejected)' : ''}
                  </Text>
                  <Text style={[styles.rowPts, pts > 0 && { color: COLORS.good }]}>
                    {pts > 0 ? `+${pts}` : '—'}
                  </Text>
                </View>
              );
            })}
          </Card>
        </FadeIn>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
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
        <Button
          title="🏆 View scoreboard"
          variant="ghost"
          style={{ marginTop: 10 }}
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
    fontSize: 28,
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
  impRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  impTag: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  impTagText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  rowName: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  rowPts: { color: COLORS.textDim, fontSize: 16, fontWeight: '900' },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
