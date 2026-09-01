import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { radius, shadows, spacing } from '../theme/theme';
import AppButton from './AppButton';

interface StickyActionBarProps {
  primaryLabel: string;
  onPrimary: () => void;
  primaryIcon?: React.ComponentProps<typeof AppButton>['icon'];
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryIcon?: React.ComponentProps<typeof AppButton>['icon'];
  loading?: boolean;
}

export function StickyActionBar({
  primaryLabel,
  onPrimary,
  primaryIcon,
  secondaryLabel,
  onSecondary,
  secondaryIcon,
  loading,
}: StickyActionBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) + 82 }]}>
      <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.soft]}>
        {!!secondaryLabel && !!onSecondary && (
          <View style={styles.secondary}>
            <AppButton title={secondaryLabel} icon={secondaryIcon} onPress={onSecondary} variant="outline" fullWidth />
          </View>
        )}
        <View style={styles.primary}>
          <AppButton title={primaryLabel} icon={primaryIcon} onPress={onPrimary} loading={loading} fullWidth />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
  },
  bar: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  primary: {
    flex: 1.2,
  },
  secondary: {
    flex: 1,
  },
});

export default StickyActionBar;
