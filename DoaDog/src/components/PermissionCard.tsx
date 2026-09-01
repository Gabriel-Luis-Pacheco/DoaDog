import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';
import AppCard from './AppCard';
import AppButton from './AppButton';

interface PermissionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function PermissionCard({ icon, title, message, actionLabel, onAction }: PermissionCardProps) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Feather name={icon} size={22} color={theme.colors.secondary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      <AppButton title={actionLabel} onPress={onAction} variant="outline" fullWidth />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  message: {
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
});

export default PermissionCard;

