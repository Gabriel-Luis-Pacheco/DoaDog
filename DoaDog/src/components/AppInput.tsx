import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
}

export function AppInput({ label, error, hint, multiline, style, leftIcon, ...props }: AppInputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            minHeight: multiline ? 104 : 50,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {!!leftIcon && (
          <Feather
            name={leftIcon}
            size={18}
            color={theme.colors.textSoft}
            style={multiline ? styles.multilineIcon : undefined}
          />
        )}
        <TextInput
          placeholderTextColor={theme.colors.textSoft}
          multiline={multiline}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
          {...props}
        />
      </View>
      {!!hint && !error && <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{hint}</Text>}
      {!!error && <Text style={[styles.hint, { color: theme.colors.danger }]}>{error}</Text>}
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
  inputShell: {
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    minHeight: 32,
    padding: 0,
  },
  multilineIcon: {
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
});

export default AppInput;
