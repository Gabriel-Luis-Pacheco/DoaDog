import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import CampaignCard from '../components/CampaignCard';
import EmptyState from '../components/EmptyState';
import FocusCard from '../components/FocusCard';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { donationServices } from '../services/api';
import { spacing } from '../theme/theme';
import { DonationCampaign } from '../types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function SupportRequestsScreen() {
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);

  const loadCampaigns = async () => {
    const { data } = await donationServices.getCampaigns();
    setCampaigns(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadCampaigns();
    }, [])
  );

  const total = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.collected_amount, 0),
    [campaigns]
  );

  const goToHelp = () => {
    navigation.getParent()?.navigate('Doações' as never);
  };

  return (
    <ScreenContainer>
      <IllustratedHeader
        eyebrow="Apoio"
        title="Pedidos de apoio"
        subtitle={`${campaigns.length} pedidos salvos neste aparelho.`}
        illustration={false}
        right={<AppButton title="Novo pedido" icon="plus-circle" onPress={goToHelp} variant="outline" />}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          illustration="help"
          title="Nenhum pedido criado"
          message="Pedidos de ração, tratamento ou transporte aparecem aqui."
          actionLabel="Criar pedido"
          onAction={goToHelp}
        />
      ) : (
        <View style={styles.list}>
          <View style={styles.stats}>
            <FocusCard label="Pedidos" value={campaigns.length} tone="botanical" />
            <FocusCard label="Total registrado" value={formatCurrency(total)} tone="warm" />
          </View>
          <SectionHeader title="Pedidos ativos" />
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
  stats: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
};
