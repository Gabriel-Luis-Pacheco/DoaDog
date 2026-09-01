import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, typography } from '../theme/theme';

interface FocusCardProps {
  label: string;
  value?: string | number;
  description?: string;
  tone?: 'warm' | 'botanical' | 'cool' | 'lilac';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function FocusCard({ label, value, description, tone = 'warm', children, style }: FocusCardProps) {
  const { theme } = useAppTheme();
  const backgroundColor =
    tone === 'botanical'
      ? theme.colors.surfaceBotanical
      : tone === 'cool'
        ? theme.colors.surfaceCool
        : tone === 'lilac'
          ? theme.colors.surfaceLilac
          : theme.colors.surfaceWarm;

  return (
    <View style={[styles.card, { backgroundColor, borderColor: theme.colors.border }, shadows.subtle, style]}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      {value !== undefined && (
        <Text adjustsFontSizeToFit minimumFontScale={0.74} numberOfLines={1} style={[styles.value, { color: theme.colors.text }]}>
          {value}
        </Text>
      )}
      {!!description && <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 84,
    minWidth: 98,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: 16,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  description: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
});

export default FocusCard;
