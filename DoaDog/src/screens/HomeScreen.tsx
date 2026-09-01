import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppButton from '../components/AppButton';
import BrandLogo from '../components/BrandLogo';
import DogCard from '../components/DogCard';
import EmptyState from '../components/EmptyState';
import FocusCard from '../components/FocusCard';
import IllustratedHeader from '../components/IllustratedHeader';
import SearchInput from '../components/SearchInput';
import ScreenContainer from '../components/ScreenContainer';
import SegmentedControl from '../components/SegmentedControl';
import SectionHeader from '../components/SectionHeader';
import { useAppTheme } from '../context/ThemeContext';
import { dogServices, donationServices, preferenceServices } from '../services/api';
import { spacing, typography } from '../theme/theme';
import { AppPreferences, Dog } from '../types';

type RootStackParamList = {
  DogDetail: { dog: Dog };
  Map: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type Filter = 'todos' | 'regiao' | 'urgente' | 'adocao' | 'resgate' | 'lar';

const baseFilters: { label: string; value: Filter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Urgente', value: 'urgente' },
  { label: 'Adoção', value: 'adocao' },
  { label: 'Resgate', value: 'resgate' },
  { label: 'Lar temporário', value: 'lar' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useAppTheme();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [campaignCount, setCampaignCount] = useState(0);
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);

  const loadDogs = async () => {
    try {
      const { data } = await dogServices.getAllDogs();
      const { data: campaigns } = await donationServices.getCampaigns();
      const { data: savedPreferences } = await preferenceServices.getPreferences();
      setDogs(data);
      setCampaignCount(campaigns.length);
      setPreferences(savedPreferences);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [])
  );

  const urgentCount = dogs.filter((dog) => dog.urgency_level === 'alta' || dog.urgency_level === 'emergencia').length;
  const hasPreferredRegion = !!preferences?.preferredState && !!preferences?.preferredCity;

  const filters = useMemo(() => {
    if (!hasPreferredRegion) return baseFilters;
    return [baseFilters[0], { label: 'Minha região', value: 'regiao' as Filter }, ...baseFilters.slice(1)];
  }, [hasPreferredRegion]);

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        dog.name.toLowerCase().includes(query) ||
        dog.description.toLowerCase().includes(query) ||
        dog.location?.city?.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (filter === 'regiao') {
        return (
          dog.location?.state === preferences?.preferredState &&
          dog.location?.city?.toLowerCase() === preferences?.preferredCity.toLowerCase()
        );
      }
      if (filter === 'urgente') return dog.urgency_level === 'alta' || dog.urgency_level === 'emergencia';
      if (filter === 'adocao') return dog.status === 'disponivel_adocao';
      if (filter === 'resgate') return dog.status === 'em_situacao_rua' || dog.status === 'resgatado';
      if (filter === 'lar') return dog.status === 'precisa_lar_temporario';
      return true;
    });
  }, [dogs, filter, preferences?.preferredCity, preferences?.preferredState, search]);

  const goToRegisterDog = () => {
    navigation.getParent()?.navigate('Cadastrar' as never);
  };

  const goToDonations = () => {
    navigation.getParent()?.navigate('Doações' as never);
  };

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Preparando a rede DoaDog...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDogs(); }} />}
    >
      <IllustratedHeader
        brand={<BrandLogo size="md" showText />}
        eyebrow="DoaDog"
        title="Cães perto de você"
        subtitle="Cadastre, busque e apoie casos locais."
        illustration="homeHero"
        right={
        <View style={styles.heroActions}>
          <View style={styles.heroButton}>
            <AppButton title="Cadastrar cão" icon="plus-circle" onPress={goToRegisterDog} fullWidth />
          </View>
          <View style={styles.heroButton}>
            <AppButton title="Como ajudar" icon="heart" onPress={goToDonations} variant="outline" fullWidth />
          </View>
        </View>
        }
      />

      <View style={styles.stats}>
        <FocusCard label="Cães cadastrados" value={dogs.length} tone="warm" />
        <FocusCard label="Casos urgentes" value={urgentCount} tone="botanical" />
        <FocusCard label="Pedidos de ajuda" value={campaignCount} tone="lilac" />
      </View>

      <SearchInput value={search} onChangeText={setSearch} />

      <SegmentedControl options={filters} value={filter} onChange={setFilter} />

      <SectionHeader title="Cães que precisam de ajuda" />

      {filteredDogs.length === 0 ? (
        <EmptyState
          illustration="emptyDogs"
          title="Nenhum cão cadastrado ainda."
          message="Cadastre o primeiro cão e ajude a dar visibilidade para quem precisa."
          actionLabel="Cadastrar primeiro cão"
          onAction={goToRegisterDog}
        />
      ) : (
        <View style={styles.list}>
          {filteredDogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              highlightUrgency={preferences?.urgentAlerts ?? true}
              onPress={() => navigation.navigate('DogDetail', { dog })}
            />
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
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroButton: {
    flex: 1,
    minWidth: 130,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.lg,
  },
});
