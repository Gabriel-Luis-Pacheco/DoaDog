import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { motion, radius, spacing, typography } from '../theme/theme';

interface AppSnackbarProps {
  visible: boolean;
  message: string;
}

export function AppSnackbar({ visible, message }: AppSnackbarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(90)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 90,
        duration: motion.normal,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: motion.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.snackbar,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          bottom: Math.max(insets.bottom, spacing.md) + spacing.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: radius.lg,
    borderWidth: 1,
    left: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'absolute',
    right: spacing.lg,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});

export default AppSnackbar;
