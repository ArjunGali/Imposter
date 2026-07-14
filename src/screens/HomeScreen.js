import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { Button, Subtitle } from '../components/ui';
import { FadeIn, PopIn } from '../components/anim';
import { totalWordCount, CATEGORIES } from '../data/words';

export default function HomeScreen({ dispatch, state }) {
  const customWords = state.customPacks.reduce((n, p) => n + p.words.length, 0);
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <PopIn>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>IW?</Text>
          </View>
        </PopIn>
        <FadeIn delay={150}>
          <Text style={styles.gameTitle}>IMPOSTER</Text>
          <Text style={styles.gameTitleAccent}>WHO?</Text>
        </FadeIn>
        <FadeIn delay={300}>
          <Subtitle style={{ textAlign: 'center', marginTop: 10 }}>
            Pass-the-phone social deduction{'\n'}
            {CATEGORIES.length + state.customPacks.length} categories ·{' '}
            {totalWordCount() + customWords} words · 3–20 players
          </Subtitle>
        </FadeIn>
      </View>

      <View style={styles.menu}>
        <Button title="▶  PLAY" onPress={() => dispatch({ type: 'GO', phase: 'setup' })} />
        <Button
          title="🏆  Scoreboard"
          variant="ghost"
          onPress={() => dispatch({ type: 'GO', phase: 'scoreboard' })}
        />
        <Button
          title="📦  Custom Word Packs"
          variant="ghost"
          onPress={() => dispatch({ type: 'GO', phase: 'packs' })}
        />
        <Button
          title="❓  How to Play"
          variant="ghost"
          onPress={() => dispatch({ type: 'GO', phase: 'howto' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 40 },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    transform: [{ rotate: '-6deg' }],
  },
  logoText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  gameTitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 4,
  },
  gameTitleAccent: {
    textAlign: 'center',
    color: COLORS.accent,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: -8,
  },
  menu: { gap: 12, marginBottom: 12 },
});
