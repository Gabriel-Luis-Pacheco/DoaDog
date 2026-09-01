import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import AppButton from './AppButton';

interface PhotoPickerCardProps {
  title: string;
  helper: string;
  images: string[];
  onAdd: () => void;
  onRemove?: (index: number) => void;
  actionLabel?: string;
}

export function PhotoPickerCard({
  title,
  helper,
  images,
  onAdd,
  onRemove,
  actionLabel = 'Adicionar foto',
}: PhotoPickerCardProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.helper, { color: theme.colors.textMuted }]}>{helper}</Text>
        </View>
        <AppButton title={actionLabel} icon="camera" onPress={onAdd} variant="outline" style={styles.button} />
      </View>

      {images.length > 0 ? (
        <View style={styles.grid}>
          {images.map((uri, index) => (
            <Pressable
              accessibilityRole="button"
              key={`${uri}-${index}`}
              onPress={() => onRemove?.(index)}
              style={({ pressed }) => [styles.imageWrap, { opacity: pressed ? 0.82 : 1 }]}
            >
              <Image source={{ uri }} style={styles.image} />
              {!!onRemove && (
                <View style={[styles.remove, { backgroundColor: theme.colors.overlay }]}>
                  <Feather name="x" size={14} color={theme.colors.white} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onAdd}
          style={({ pressed }) => [
            styles.empty,
            {
              backgroundColor: theme.colors.surfaceCool,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surface }]}>
            <Feather name="camera" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nenhuma foto adicionada</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Use fotos reais sempre que for seguro.</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  helper: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  button: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    borderRadius: radius.md,
    height: 96,
    width: 96,
  },
  remove: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 24,
  },
  empty: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 150,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
    textAlign: 'center',
  },
});

export default PhotoPickerCard;
