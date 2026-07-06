import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Subtitle } from '../components/ui';

// Secret ballot, pass-the-phone. Each voter confirms identity, picks a
// suspect (not themselves), confirms, then hands the phone on.
export default function VotingScreen({ state, dispatch }) {
  const { round, players } = state;
  const idx = round.voteIndex;
  const voter = players[idx];
  const color = playerColor(voter.colorIndex);

  const [claimed, setClaimed] = useState(false);
  const [choice, setChoice] = useState(null);

  const cast = () => {
    const votedIndex = choice;
    setClaimed(false);
    setChoice(null);
    dispatch({ type: 'CAST_VOTE', votedIndex });
  };

  if (!claimed) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.step}>
          SECRET BALLOT · {idx + 1} OF {players.length}
        </Text>
        <View style={styles.center}>
          <Subtitle style={{ textAlign: 'center' }}>Pass the phone to</Subtitle>
          <View style={[styles.nameBadge, { backgroundColor: color }]}>
            <Text style={styles.nameBadgeText}>{voter.name}</Text>
          </View>
        </View>
        <Button title={`I'm ${voter.name} — vote now`} onPress={() => setClaimed(true)} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>{voter.name.toUpperCase()}, WHO IS THE IMPOSTER?</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {players.map((p, i) => {
          if (i === idx) return null;
          const selected = choice === i;
          const pc = playerColor(p.colorIndex);
          return (
            <Pressable
              key={p.name}
              onPress={() => setChoice(i)}
              style={[
                styles.voteCard,
                { borderColor: pc },
                selected && { backgroundColor: pc },
              ]}
            >
              <Text style={[styles.voteName, !selected && { color: pc }]}>{p.name}</Text>
              {selected && <Text style={styles.voteMark}>✔ SUSPECT</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
      <Button
        title={choice != null ? `Lock in vote for ${players[choice].name}` : 'Pick a suspect'}
        disabled={choice == null}
        onPress={cast}
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
    letterSpacing: 1.5,
    textAlign: 'center',
    marginVertical: 10,
  },
  center: { flex: 1, justifyContent: 'center' },
  nameBadge: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 18,
    marginTop: 14,
  },
  nameBadgeText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  voteCard: {
    width: '47%',
    borderWidth: 2.5,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  voteName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  voteMark: { color: '#fff', fontSize: 11, fontWeight: '800', marginTop: 4 },
});
