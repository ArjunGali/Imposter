import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { COLORS } from '../theme';
import { Button, Title, Subtitle, Card } from '../components/ui';
import { savePacks } from '../storage';

// Custom word-pack editor. Packs live in AsyncStorage and show up as
// selectable categories in game setup.
export default function PacksScreen({ state, dispatch }) {
  const packs = state.customPacks;
  const [editingId, setEditingId] = useState(null); // pack id or 'new'
  const [packName, setPackName] = useState('');
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [draftWords, setDraftWords] = useState([]);

  const persist = (next) => {
    dispatch({ type: 'SET_PACKS', packs: next });
    savePacks(next);
  };

  const openEditor = (pack) => {
    if (pack) {
      setEditingId(pack.id);
      setPackName(pack.name);
      setDraftWords(pack.words);
    } else {
      setEditingId('new');
      setPackName('');
      setDraftWords([]);
    }
    setWord('');
    setHint('');
  };

  const addWord = () => {
    const w = word.trim();
    const h = hint.trim();
    if (!w || !h) return;
    if (draftWords.some((e) => e.w.toLowerCase() === w.toLowerCase())) return;
    setDraftWords([...draftWords, { w, h }]);
    setWord('');
    setHint('');
  };

  const saveDraft = () => {
    const name = packName.trim() || 'My Pack';
    let next;
    if (editingId === 'new') {
      next = [
        ...packs,
        { id: `custom-${Date.now()}`, name, emoji: '✏️', words: draftWords },
      ];
    } else {
      next = packs.map((p) =>
        p.id === editingId ? { ...p, name, words: draftWords } : p
      );
    }
    persist(next);
    setEditingId(null);
  };

  const deletePack = (pack) => {
    Alert.alert(`Delete “${pack.name}”?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persist(packs.filter((p) => p.id !== pack.id)),
      },
    ]);
  };

  // ----- Editor view -----
  if (editingId !== null) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Title>{editingId === 'new' ? 'New Pack' : 'Edit Pack'}</Title>
          <TextInput
            style={[styles.input, { marginTop: 16 }]}
            placeholder="Pack name (e.g. Inside Jokes)"
            placeholderTextColor={COLORS.textDim}
            value={packName}
            onChangeText={setPackName}
            maxLength={24}
          />

          <Card style={{ marginTop: 14 }}>
            <Text style={styles.sectionTitle}>ADD A WORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Secret word"
              placeholderTextColor={COLORS.textDim}
              value={word}
              onChangeText={setWord}
              maxLength={30}
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Vague hint for the imposter"
              placeholderTextColor={COLORS.textDim}
              value={hint}
              onChangeText={setHint}
              maxLength={60}
            />
            <Button
              title="+ Add word"
              style={{ marginTop: 10 }}
              disabled={!word.trim() || !hint.trim()}
              onPress={addWord}
            />
          </Card>

          <Card style={{ marginTop: 14 }}>
            <Text style={styles.sectionTitle}>WORDS ({draftWords.length})</Text>
            {draftWords.length === 0 && (
              <Subtitle>Add at least 3 words to make the pack playable.</Subtitle>
            )}
            {draftWords.map((e, i) => (
              <Pressable
                key={e.w}
                onLongPress={() =>
                  setDraftWords(draftWords.filter((_, j) => j !== i))
                }
                style={styles.wordRow}
              >
                <Text style={styles.wordText}>{e.w}</Text>
                <Text style={styles.hintText}>hint: {e.h}</Text>
              </Pressable>
            ))}
            {draftWords.length > 0 && (
              <Subtitle style={{ marginTop: 8, fontSize: 12 }}>
                Long-press a word to remove it
              </Subtitle>
            )}
          </Card>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => setEditingId(null)}
          />
          <Button
            title="Save pack"
            style={{ flex: 2 }}
            disabled={draftWords.length < 3}
            onPress={saveDraft}
          />
        </View>
      </View>
    );
  }

  // ----- Pack list view -----
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title>📦 Word Packs</Title>
        <Subtitle style={{ marginTop: 6 }}>
          Create your own packs — inside jokes, local spots, anything. They save to
          this phone and appear as categories in setup.
        </Subtitle>

        {packs.length === 0 ? (
          <Card style={{ marginTop: 24, alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>✏️</Text>
            <Subtitle style={{ marginTop: 10 }}>No custom packs yet</Subtitle>
          </Card>
        ) : (
          packs.map((p) => (
            <Card key={p.id} style={styles.packRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.packName}>
                  {p.emoji} {p.name}
                </Text>
                <Text style={styles.packMeta}>{p.words.length} words</Text>
              </View>
              <Button
                title="Edit"
                variant="ghost"
                style={styles.smallBtn}
                onPress={() => openEditor(p)}
              />
              <Button
                title="🗑"
                variant="danger"
                style={styles.smallBtn}
                onPress={() => deletePack(p)}
              />
            </Card>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Back"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => dispatch({ type: 'GO', phase: 'home' })}
        />
        <Button title="+ New pack" style={{ flex: 2 }} onPress={() => openEditor(null)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 30 },
  sectionTitle: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.surfaceHi,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wordRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  wordText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  hintText: { color: COLORS.textDim, fontSize: 13, marginTop: 2 },
  packRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  packName: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  packMeta: { color: COLORS.textDim, fontSize: 13, marginTop: 2 },
  smallBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
});
