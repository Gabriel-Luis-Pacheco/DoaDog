import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface HelpOptionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  text: string;
  onPress?: () => void;
  badge?: string;
}

export function HelpOptionCard({ icon, title, text, onPress, badge }: HelpOptionCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.colors.secondarySoft }]}>
          <Feather name={icon} size={20} color={theme.colors.secondary} />
        </View>
        {!!badge && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.footer}>
        <Text style={[styles.text, { color: theme.colors.textMuted }]}>{text}</Text>
        <Feather name="arrow-up-right" size={16} color={theme.colors.textSoft} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minWidth: 150,
    padding: spacing.md,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.black,
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
});

export default HelpOptionCard;
