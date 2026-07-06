import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { COLORS, playerColor } from '../theme';
import { Button, Title, Subtitle, Card } from '../components/ui';
import { CATEGORIES } from '../data/words';
import { MIN_PLAYERS, MAX_PLAYERS, maxImposters } from '../state/gameReducer';

function Chip({ label, active, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color || COLORS.accent, borderColor: color || COLORS.accent },
      ]}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export default function SetupScreen({ state, dispatch }) {
  const [name, setName] = useState('');
  const players = state.players;
  const maxImp = maxImposters(Math.max(players.length, MIN_PLAYERS));
  const allCats = [...CATEGORIES, ...state.customPacks];
  const allSelected = state.selectedCategoryIds.length === 0;

  const add = () => {
    if (name.trim()) {
      dispatch({ type: 'ADD_PLAYER', name });
      setName('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Title>Game Setup</Title>

        {/* Players */}
        <Card style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>
            PLAYERS ({players.length}/{MAX_PLAYERS})
          </Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Player name…"
              placeholderTextColor={COLORS.textDim}
              value={name}
              onChangeText={setName}
              onSubmitEditing={add}
              maxLength={16}
              returnKeyType="done"
            />
            <Button title="+" onPress={add} style={{ paddingHorizontal: 20 }} />
          </View>
          <View style={styles.playerWrap}>
            {players.map((p, i) => (
              <Pressable
                key={p.name}
                onLongPress={() => dispatch({ type: 'REMOVE_PLAYER', index: i })}
                style={[styles.playerTag, { backgroundColor: playerColor(p.colorIndex) }]}
              >
                <Text style={styles.playerTagText}>{p.name}  ✕</Text>
              </Pressable>
            ))}
          </View>
          {players.length > 0 && (
            <Subtitle style={{ marginTop: 8, fontSize: 12 }}>
              Long-press a player to remove
            </Subtitle>
          )}
          {players.length < MIN_PLAYERS && (
            <Subtitle style={{ marginTop: 8, color: COLORS.warn }}>
              Add at least {MIN_PLAYERS} players to start
            </Subtitle>
          )}
        </Card>

        {/* Imposters */}
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>IMPOSTERS</Text>
          <View style={styles.chipRow}>
            {Array.from({ length: maxImp }, (_, i) => i + 1).map((n) => (
              <Chip
                key={n}
                label={`${n}`}
                active={state.imposterCount === n}
                onPress={() => dispatch({ type: 'SET_IMPOSTERS', count: n })}
              />
            ))}
          </View>
          <Subtitle style={{ marginTop: 8, fontSize: 12 }}>
            Imposters only see a vague hint — never the word
          </Subtitle>
        </Card>

        {/* Timer */}
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>DISCUSSION TIMER</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Off"
              active={state.timerMin === 0}
              onPress={() => dispatch({ type: 'SET_TIMER', minutes: 0 })}
            />
            {[1, 2, 3, 5, 10].map((m) => (
              <Chip
                key={m}
                label={`${m} min`}
                active={state.timerMin === m}
                onPress={() => dispatch({ type: 'SET_TIMER', minutes: m })}
              />
            ))}
          </View>
        </Card>

        {/* Categories */}
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>WORD CATEGORIES</Text>
          <View style={styles.chipRow}>
            <Chip
              label="🎲 All"
              active={allSelected}
              onPress={() => dispatch({ type: 'SET_ALL_CATEGORIES' })}
            />
            {allCats.map((c) => (
              <Chip
                key={c.id}
                label={`${c.emoji || '📦'} ${c.name}`}
                active={!allSelected && state.selectedCategoryIds.includes(c.id)}
                onPress={() => dispatch({ type: 'TOGGLE_CATEGORY', id: c.id })}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => dispatch({ type: 'GO', phase: 'home' })}
        />
        <Button
          title="START ROUND"
          style={{ flex: 2 }}
          disabled={players.length < MIN_PLAYERS}
          onPress={() => dispatch({ type: 'START_ROUND' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  addRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceHi,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  playerTag: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playerTagText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceHi,
  },
  chipText: { color: COLORS.textDim, fontWeight: '700', fontSize: 13 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
