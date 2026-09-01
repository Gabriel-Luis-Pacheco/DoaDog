import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface ProfileActionRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

export function ProfileActionRow({ icon, title, subtitle, onPress }: ProfileActionRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.colors.surfaceCool }]}>
        <Feather name={icon} size={18} color={theme.colors.secondary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={18} color={theme.colors.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
});

export default ProfileActionRow;
