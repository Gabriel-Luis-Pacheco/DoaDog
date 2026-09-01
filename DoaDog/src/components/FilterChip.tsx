import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  count?: number;
}

export function FilterChip({ label, selected = false, onPress, icon, count }: FilterChipProps) {
  const { theme } = useAppTheme();
  const color = selected ? theme.colors.white : theme.colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.secondary : theme.colors.surface,
          borderColor: selected ? theme.colors.secondary : theme.colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      {!!icon && <Feather name={icon} size={14} color={color} />}
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {count === undefined ? label : `${label} ${count}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});

export default FilterChip;
