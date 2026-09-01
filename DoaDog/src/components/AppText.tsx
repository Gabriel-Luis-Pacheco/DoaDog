import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { typography } from '../theme/theme';

type AppTextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'label' | 'caption';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  muted?: boolean;
}

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps) {
  const { theme } = useAppTheme();
  return <Text style={[styles[variant], { color: muted ? theme.colors.textMuted : theme.colors.text }, style]} {...props} />;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 34,
    fontWeight: typography.weights.black,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: typography.weights.black,
    lineHeight: 34,
  },
  h3: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    lineHeight: 28,
  },
  body: {
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
  bodyStrong: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    lineHeight: 18,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 16,
  },
});

export default AppText;

