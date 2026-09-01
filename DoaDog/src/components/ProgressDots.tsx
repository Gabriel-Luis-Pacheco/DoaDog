import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/theme';

interface ProgressDotsProps {
  total: number;
  active: number;
}

export function ProgressDots({ total, active }: ProgressDotsProps) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: index === active ? 28 : 8,
              backgroundColor: index === active ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: radius.full,
    height: 8,
  },
});

export default ProgressDots;

