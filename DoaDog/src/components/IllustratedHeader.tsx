import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, typography } from '../theme/theme';
import AppIllustration, { IllustrationVariant } from './AppIllustration';

interface IllustratedHeaderProps {
  brand?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  illustration?: IllustrationVariant | false;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function IllustratedHeader({ brand, eyebrow, title, subtitle, illustration = 'homeHero', right, style }: IllustratedHeaderProps) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.subtle, style]}>
      <View style={styles.copy}>
        {brand}
        {!!eyebrow && <Text style={[styles.eyebrow, { color: theme.colors.secondary }]}>{eyebrow}</Text>}
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
        {right}
      </View>
      {illustration && (
        <View style={styles.art}>
          <AppIllustration variant={illustration} compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
  },
  copy: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    lineHeight: 27,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  art: {
    alignSelf: 'center',
    maxWidth: 170,
    width: '46%',
  },
});

export default IllustratedHeader;
