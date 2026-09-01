import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface BadgeProps {
  label: string;
  tone?: 'blue' | 'cyan' | 'coral' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { theme } = useAppTheme();
  const color =
    tone === 'blue'
      ? theme.colors.secondary
      : tone === 'cyan'
        ? theme.colors.tertiary
        : tone === 'coral'
          ? theme.colors.accent
          : tone === 'success'
            ? theme.colors.success
            : tone === 'warning'
              ? theme.colors.warning
              : tone === 'danger'
                ? theme.colors.danger
                : theme.colors.textMuted;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

export default Badge;
