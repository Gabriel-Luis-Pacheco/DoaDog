import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import AppIllustration, { IllustrationVariant } from './AppIllustration';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  illustration?: IllustrationVariant;
  onAction?: () => void;
}

export function EmptyState({ icon = '-', title, message, actionLabel, illustration, onAction }: EmptyStateProps) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.wrapper}>
      {illustration ? (
        <AppIllustration variant={illustration} compact style={styles.appIllustration} />
      ) : (
        <View style={[styles.mark, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={[styles.icon, { color: theme.colors.primary }]}>{icon}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      {!!actionLabel && !!onAction && <AppButton title={actionLabel} onPress={onAction} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 28,
    fontWeight: typography.weights.black,
  },
  mark: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  appIllustration: {
    maxWidth: 180,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    maxWidth: 310,
    textAlign: 'center',
  },
});

export default EmptyState;
