import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius } from '../theme/theme';

interface SkeletonBlockProps {
  height?: number;
  width?: ViewStyle['width'];
}

export function SkeletonBlock({ height = 16, width = '100%' }: SkeletonBlockProps) {
  const { theme } = useAppTheme();
  return <View style={[styles.block, { backgroundColor: theme.colors.surfacePressed, height, width }]} />;
}

const styles = StyleSheet.create({
  block: {
    borderRadius: radius.md,
  },
});

export default SkeletonBlock;

