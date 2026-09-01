import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CampaignCard from '../components/CampaignCard';
import DogCard from '../components/DogCard';
import EmptyState from '../components/EmptyState';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { favoriteServices } from '../services/api';
import { spacing } from '../theme/theme';
import { Dog, DonationCampaign } from '../types';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);

  const loadFavorites = async () => {
    const [dogResult, campaignResult] = await Promise.all([
      favoriteServices.getFavoriteDogs(),
      favoriteServices.getFavoriteCampaigns(),
    ]);
    setDogs(dogResult.data);
    setCampaigns(campaignResult.data);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const empty = dogs.length === 0 && campaigns.length === 0;

  return (
    <ScreenContainer>
      <IllustratedHeader
        eyebrow="Salvos"
        title="Favoritos"
        subtitle={`${dogs.length + campaigns.length} itens salvos.`}
        illustration={false}
      />

      {empty ? (
        <EmptyState
          illustration="emptyDogs"
          title="Nada favoritado ainda"
          message="Toque no coração em cães ou pedidos para guardar aqui."
        />
      ) : (
        <View style={styles.list}>
          {dogs.length > 0 && <SectionHeader title="Cães" />}
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} onPress={() => navigation.navigate('DogDetail', { dog })} />
          ))}

          {campaigns.length > 0 && <SectionHeader title="Pedidos de apoio" />}
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = {
  list: {
    gap: spacing.lg,
  },
};
