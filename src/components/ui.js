import React from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';

export function Button({ title, onPress, variant = 'primary', disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'ghost' && styles.btnGhost,
        variant === 'danger' && styles.btnDanger,
        disabled && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.75, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'ghost' && { color: COLORS.text },
          disabled && { color: COLORS.textDim },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnDanger: { backgroundColor: COLORS.danger },
  btnDisabled: { backgroundColor: COLORS.surfaceHi },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 15,
    lineHeight: 21,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
});
