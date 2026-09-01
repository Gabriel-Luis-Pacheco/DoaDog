import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export function Divider({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.border }, style]} {...props} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

export default Divider;

