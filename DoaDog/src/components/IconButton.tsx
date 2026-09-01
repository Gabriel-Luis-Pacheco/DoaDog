import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { impactLight } from '../utils/haptics';

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
}

export function IconButton({ icon, onPress, label }: IconButtonProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        impactLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Feather name={icon} size={19} color={theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
    padding: spacing.xs,
  },
});

export default IconButton;

