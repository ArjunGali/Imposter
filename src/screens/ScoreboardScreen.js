import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, PLAYER_COLORS } from '../theme';
import { Button, Title, Subtitle, Card } from '../components/ui';
import { clearScores } from '../storage';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ScoreboardScreen({ state, dispatch }) {
  const entries = Object.entries(state.scores).sort(
    (a, b) => b[1].points - a[1].points || b[1].wins - a[1].wins
  );

  const reset = () => {
    Alert.alert('Reset scoreboard?', 'All saved points will be erased.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          clearScores();
          dispatch({ type: 'SET_SCORES', scores: {} });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title>🏆 Scoreboard</Title>
        <Subtitle style={{ marginTop: 6 }}>
          Saved on this phone across game nights
        </Subtitle>

        {entries.length === 0 ? (
          <Card style={{ marginTop: 24, alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>🫥</Text>
            <Subtitle style={{ marginTop: 10 }}>No scores yet — play a round!</Subtitle>
          </Card>
        ) : (
          entries.map(([name, s], rank) => (
            <Card key={name} style={styles.row}>
              <Text style={styles.rank}>{MEDALS[rank] || `${rank + 1}.`}</Text>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: PLAYER_COLORS[rank % PLAYER_COLORS.length] },
                ]}
              >
                <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.meta}>
                  {s.wins} win{s.wins !== 1 ? 's' : ''} · {s.games} round
                  {s.games !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.points}>{s.points}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        {entries.length > 0 && (
          <Button title="Reset" variant="danger" style={{ flex: 1 }} onPress={reset} />
        )}
        <Button
          title="Back"
          variant="ghost"
          style={{ flex: 2 }}
          onPress={() =>
            dispatch({ type: 'GO', phase: state.round ? 'results' : 'home' })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 30 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
  },
  rank: { fontSize: 20, width: 40, color: COLORS.textDim, fontWeight: '800' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  name: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  meta: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  points: { color: COLORS.accent, fontSize: 26, fontWeight: '900' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
