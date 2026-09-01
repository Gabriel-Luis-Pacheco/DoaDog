import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { motion, spacing } from '../theme/theme';
import OrganicBackground from './OrganicBackground';

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export function ScreenContainer({ children, scroll = true, contentContainerStyle, style, ...props }: ScreenContainerProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: motion.normal,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const animatedStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>
        <OrganicBackground />
        <Animated.View style={[styles.flex, animatedStyle]}>{children}</Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>
      <OrganicBackground />
      <ScrollView
        style={styles.flex}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + 104 },
        ]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        <Animated.View style={[styles.inner, contentContainerStyle, animatedStyle]}>{children}</Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
  },
  inner: {
    gap: spacing.lg,
  },
});

export default ScreenContainer;
