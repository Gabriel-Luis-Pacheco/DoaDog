import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../context/ThemeContext';
import { motion, radius } from '../theme/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { theme } = useAppTheme();
  const animated = useSharedValue(0);
  const clamped = Math.max(0, Math.min(progress, 1));

  useEffect(() => {
    animated.value = withTiming(clamped, { duration: motion.slow });
  }, [animated, clamped]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animated.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.backgroundAlt }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color || theme.colors.primary }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.full,
    height: 9,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.full,
    height: '100%',
  },
});

export default ProgressBar;
