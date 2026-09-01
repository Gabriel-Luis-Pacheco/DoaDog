import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme/theme';
import AppButton from './AppButton';

interface WizardFooterProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  loading?: boolean;
}

export function WizardFooter({ primaryLabel, onPrimary, secondaryLabel, onSecondary, loading }: WizardFooterProps) {
  return (
    <View style={styles.footer}>
      {!!secondaryLabel && !!onSecondary && (
        <View style={styles.action}>
          <AppButton title={secondaryLabel} onPress={onSecondary} variant="outline" fullWidth />
        </View>
      )}
      <View style={styles.action}>
        <AppButton title={primaryLabel} onPress={onPrimary} loading={loading} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    minWidth: 148,
  },
});

export default WizardFooter;

