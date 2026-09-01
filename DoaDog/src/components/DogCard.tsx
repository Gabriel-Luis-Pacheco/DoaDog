import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { favoriteServices } from '../services/api';
import { Dog, DogGender, DogSize, DogStatus, UrgencyLevel } from '../types';
import { radius, shadows, spacing, typography, urgencyColors } from '../theme/theme';
import Badge from './Badge';
import DogPhoto from './DogPhoto';

interface DogCardProps {
  dog: Dog;
  onPress?: () => void;
  showStatus?: boolean;
  showUrgency?: boolean;
  highlightUrgency?: boolean;
}

const statusLabels: Record<DogStatus, string> = {
  em_situacao_rua: 'Resgate',
  precisa_lar_temporario: 'Lar temporário',
  resgatado: 'Resgatado',
  disponivel_adocao: 'Para adoção',
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  emergencia: 'Emergência',
};

const sizeLabels: Record<DogSize, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
  nao_sei: 'Porte não informado',
};

const genderLabels: Record<DogGender, string> = {
  macho: 'Macho',
  femea: 'Fêmea',
  nao_sei: 'Sexo não informado',
};

function statusTone(status: DogStatus) {
  if (status === 'disponivel_adocao') return 'success';
  if (status === 'precisa_lar_temporario') return 'warning';
  if (status === 'em_situacao_rua') return 'coral';
  return 'blue';
}

export function DogCard({ dog, onPress, showUrgency = true, highlightUrgency = true }: DogCardProps) {
  const { theme } = useAppTheme();
  const [favorite, setFavorite] = useState(false);
  const location = dog.location?.city && dog.location?.state ? `${dog.location.city}, ${dog.location.state}` : 'Local não informado';
  const urgencyColor = urgencyColors[dog.urgency_level];
  const urgent = highlightUrgency && (dog.urgency_level === 'alta' || dog.urgency_level === 'emergencia');

  useEffect(() => {
    let mounted = true;
    favoriteServices.isDogFavorite(dog.id).then((isFavorite) => {
      if (mounted) setFavorite(isFavorite);
    });
    return () => {
      mounted = false;
    };
  }, [dog.id]);

  const toggleFavorite = async () => {
    const nextFavorite = await favoriteServices.toggleDog(dog.id);
    setFavorite(nextFavorite);
  };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: urgent ? `${urgencyColor}66` : theme.colors.border,
          opacity: pressed ? 0.92 : 1,
        },
        shadows.subtle,
      ]}
    >
      <View>
        <DogPhoto
          uri={dog.images?.[0]}
          height={178}
          badge={<Badge label={statusLabels[dog.status]} tone={statusTone(dog.status)} />}
          style={styles.photo}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onPress={(event) => {
            event.stopPropagation?.();
            toggleFavorite();
          }}
          style={[
            styles.favoriteButton,
            {
              backgroundColor: favorite ? theme.colors.primary : theme.colors.surfaceElevated,
              borderColor: favorite ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Feather name="heart" size={18} color={favorite ? theme.colors.white : theme.colors.secondary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {dog.name || 'Nome desconhecido'}
            </Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={13} color={theme.colors.textSoft} />
              <Text style={[styles.location, { color: theme.colors.textMuted }]} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
          {showUrgency && (
            <View style={[styles.urgency, { backgroundColor: `${urgencyColor}18`, borderColor: `${urgencyColor}44` }]}>
              <Text style={[styles.urgencyText, { color: urgencyColor }]}>{urgencyLabels[dog.urgency_level]}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {dog.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {sizeLabels[dog.size]}
          </Text>
          <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {genderLabels[dog.gender]}
          </Text>
          <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {dog.age_range === 'filhote' ? 'Filhote' : dog.age_range === 'jovem' ? 'Jovem' : dog.age_range === 'idoso' ? 'Idoso' : 'Adulto'}
          </Text>
        </View>

        {!!onPress && (
          <View style={[styles.actionRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.actionText, { color: theme.colors.secondary }]}>Ver detalhes</Text>
            <Feather name="arrow-right" size={17} color={theme.colors.secondary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    borderRadius: 0,
    borderWidth: 0,
  },
  favoriteButton: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 38,
  },
  content: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    lineHeight: 22,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  urgency: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  urgencyText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  description: {
    fontSize: typography.sizes.md,
    lineHeight: 21,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  dot: {
    borderRadius: radius.full,
    height: 4,
    width: 4,
  },
  actionRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});

export default DogCard;
