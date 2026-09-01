import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, typography } from '../theme/theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label: string;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function AppSelect({
  label,
  value,
  placeholder = 'Selecione',
  options,
  onChange,
  error,
  loading,
  disabled,
}: AppSelectProps) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.select,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.value, { color: selected ? theme.colors.text : theme.colors.textSoft }]} numberOfLines={1}>
          {loading ? 'Carregando...' : selected?.label || placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={theme.colors.textMuted} />
      </Pressable>
      {!!error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>}

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>{label}</Text>
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: active ? theme.colors.primary : theme.colors.text,
                          fontWeight: active ? typography.weights.bold : typography.weights.medium,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {active && <Feather name="check" size={17} color={theme.colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  select: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  value: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
  error: {
    fontSize: typography.sizes.xs,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    borderRadius: radius.xl,
    borderWidth: 1,
    maxHeight: '72%',
    padding: spacing.lg,
    ...shadows.soft,
  },
  sheetTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  options: {
    flexGrow: 0,
  },
  optionsContent: {
    gap: spacing.xs,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
});

export default AppSelect;
