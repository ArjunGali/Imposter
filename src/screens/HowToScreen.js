import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme';
import { Button, Title, Card } from '../components/ui';

const STEPS = [
  ['📱', 'One phone, 3–20 players. Add everyone in setup.'],
  ['🤫', 'Pass the phone around. Each player HOLDS their card to see the secret word.'],
  ['🕵️', 'Imposters don’t get the word — only a vague hint. They must blend in.'],
  ['🗣️', 'Discuss! Everyone describes the word without saying it. A random player starts.'],
  ['🗳️', 'Vote by secret ballot for who you think is faking it.'],
  ['🎯', 'Most-voted player is an imposter? Crew wins +2 points each.'],
  ['😈', 'Tie or wrong pick? The imposters escape with +3 points each.'],
  ['🏆', 'Points stack on the scoreboard across rounds and game nights.'],
];

export default function HowToScreen({ dispatch }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title>❓ How to Play</Title>
        {STEPS.map(([emoji, text], i) => (
          <Card key={i} style={styles.row}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.text}>{text}</Text>
          </Card>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Got it!" onPress={() => dispatch({ type: 'GO', phase: 'home' })} />
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
    gap: 14,
  },
  emoji: { fontSize: 26 },
  text: { color: COLORS.text, fontSize: 15, lineHeight: 21, flex: 1 },
  footer: { padding: 16, backgroundColor: COLORS.bg },
});
