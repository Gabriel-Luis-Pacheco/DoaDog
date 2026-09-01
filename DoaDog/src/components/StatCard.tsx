import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: 'primary' | 'coral' | 'neutral';
}

export function StatCard({ label, value, accent = 'primary' }: StatCardProps) {
  const { theme } = useAppTheme();
  const color = accent === 'coral' ? theme.colors.accent : accent === 'neutral' ? theme.colors.textMuted : theme.colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={[styles.value, { color }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.colors.textMuted }]} numberOfLines={2}>{label}</Text>
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
    minWidth: 96,
    padding: spacing.md,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    lineHeight: 16,
  },
});

export default StatCard;
