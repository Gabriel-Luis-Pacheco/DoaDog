import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { impactLight } from '../utils/haptics';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof Feather.glyphMap;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  icon,
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isOutline = variant === 'outline' || variant === 'ghost';
  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.secondary
        : variant === 'danger'
          ? theme.colors.danger
          : 'transparent';
  const actionColor = variant === 'danger' ? theme.colors.danger : variant === 'ghost' ? theme.colors.primary : theme.colors.secondary;
  const color = isOutline ? actionColor : theme.colors.white;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => {
          pressIn();
          impactLight();
        }}
        onPressOut={pressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor,
            borderColor: variant === 'ghost' ? 'transparent' : isOutline ? actionColor : backgroundColor,
            opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <View style={styles.content}>
            {!!icon && <Feather name={icon} size={17} color={color} />}
            <Text style={[styles.text, { color }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
});

export default AppButton;
