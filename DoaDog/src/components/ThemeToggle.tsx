import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { impactLight } from '../utils/haptics';

export function ThemeToggle() {
  const { theme, mode, resolvedMode, setMode } = useAppTheme();
  const options = [
    { icon: 'smartphone', label: 'Sistema', value: 'system' as const },
    { icon: 'sun', label: 'Claro', value: 'light' as const },
    { icon: 'moon', label: 'Escuro', value: 'dark' as const },
  ];

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.backgroundAlt, borderColor: theme.colors.border }]}>
      <View style={styles.options}>
        {options.map((option) => {
          const active = mode === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => {
                impactLight();
                setMode(option.value);
              }}
              style={[
                styles.option,
                {
                  backgroundColor: active ? theme.colors.primary : 'transparent',
                },
              ]}
            >
              <Feather name={option.icon as any} size={15} color={active ? theme.colors.white : theme.colors.textMuted} />
              <Text style={[styles.text, { color: active ? theme.colors.white : theme.colors.textMuted }]} numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.current, { color: theme.colors.textSoft }]}>
        Aparência atual: {resolvedMode === 'dark' ? 'escura' : 'clara'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  current: {
    fontSize: typography.sizes.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
});

export default ThemeToggle;
