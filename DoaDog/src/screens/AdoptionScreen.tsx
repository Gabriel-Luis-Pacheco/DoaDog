import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DogCard from '../components/DogCard';
import EmptyState from '../components/EmptyState';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAppTheme } from '../context/ThemeContext';
import { dogServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { Dog, DogAgeRange, DogGender, DogSize } from '../types';

type RootStackParamList = {
  DogDetailAdoption: { dog: Dog };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const filters = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pequeno', value: 'pequeno' },
  { label: 'Macho', value: 'macho' },
  { label: 'Fêmea', value: 'femea' },
  { label: 'Filhote', value: 'filhote' },
];

export default function AdoptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useAppTheme();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    dogServices.getAdoptionDogs().then(({ data }) => {
      setDogs(data);
      setLoading(false);
    });
  }, []);

  const filteredDogs = useMemo(() => {
    if (filter === 'todos') return dogs;
    return dogs.filter((dog) => dog.size === filter || dog.gender === filter || dog.age_range === filter);
  }, [dogs, filter]);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Adoção responsável" subtitle="Conheça cães que já estão prontos para encontrar uma família." />
      <View style={styles.filters}>
        {filters.map((item) => {
          const active = filter === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value as DogSize | DogGender | DogAgeRange | 'todos')}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? theme.colors.white : theme.colors.textMuted }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {filteredDogs.length === 0 ? (
        <EmptyState
          illustration="emptyDogs"
          title="Nenhum cão para adoção"
          message="Quando um cão for cadastrado como disponível para adoção, ele aparecerá aqui."
        />
      ) : (
        <View style={styles.list}>
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} onPress={() => navigation.navigate('DogDetailAdoption', { dog })} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  list: {
    gap: spacing.lg,
  },
});
