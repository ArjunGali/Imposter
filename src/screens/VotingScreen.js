import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Subtitle } from '../components/ui';
import { FadeIn, PopIn } from '../components/anim';

// Secret ballot, pass-the-phone. Only surviving players vote, and only
// surviving players can be voted for. Each voter confirms identity,
// picks a suspect (not themselves), locks it in, then hands the phone on.
export default function VotingScreen({ state, dispatch }) {
  const { round, players } = state;
  const voterIdx = round.voteOrder[round.votePos];
  const voter = players[voterIdx];
  const color = playerColor(voter.colorIndex);

  const [claimed, setClaimed] = useState(false);
  const [choice, setChoice] = useState(null);

  if (!claimed) {
    return (
      <View style={styles.wrap}>
        <FadeIn>
          <Text style={styles.step}>
            SECRET BALLOT · {round.votePos + 1} OF {round.voteOrder.length}
          </Text>
        </FadeIn>
        <View style={styles.center}>
          <Subtitle style={{ textAlign: 'center' }}>Pass the phone to</Subtitle>
          <PopIn delay={150}>
            <View style={[styles.nameBadge, { backgroundColor: color }]}>
              <Text style={styles.nameBadgeText}>{voter.name}</Text>
            </View>
          </PopIn>
        </View>
        <Button title={`I'm ${voter.name} — vote now`} onPress={() => setClaimed(true)} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>{voter.name.toUpperCase()}, WHO IS THE IMPOSTER?</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {round.voteOrder.map((i, pos) => {
          if (i === voterIdx) return null;
          const p = players[i];
          const selected = choice === i;
          const pc = playerColor(p.colorIndex);
          return (
            <FadeIn key={p.name} delay={pos * 60} style={styles.voteCardWrap}>
              <Pressable
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
            </FadeIn>
          );
        })}
      </ScrollView>
      <Button
        title={choice != null ? `Lock in vote for ${players[choice].name}` : 'Pick a suspect'}
        disabled={choice == null}
        onPress={() => dispatch({ type: 'CAST_VOTE', votedIndex: choice })}
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
  voteCardWrap: { width: '47%' },
  voteCard: {
    borderWidth: 2.5,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  voteName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  voteMark: { color: '#fff', fontSize: 11, fontWeight: '800', marginTop: 4 },
});
