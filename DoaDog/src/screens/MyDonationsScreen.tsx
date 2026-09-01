import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppCard from '../components/AppCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import FocusCard from '../components/FocusCard';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { donationServices } from '../services/api';
import { spacing, typography } from '../theme/theme';
import { Donation } from '../types';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
};

const statusTone: Record<string, React.ComponentProps<typeof Badge>['tone']> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
};

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((value || 0) / 100);
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

function formatLocation(city?: string, state?: string) {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return 'Local não informado';
}

export default function MyDonationsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async (silent = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setError(null);
    const { data, error: donationError } = await donationServices.getByUserId(user.id);
    if (donationError) {
      setError(donationError.message);
    }
    setDonations(data);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations])
  );

  const totalPaid = useMemo(
    () => donations.filter((donation) => donation.status === 'PAID').reduce((sum, donation) => sum + donation.amount_in_cents, 0),
    [donations]
  );

  const refresh = () => {
    setRefreshing(true);
    loadDonations(true);
  };

  if (!user) {
    return (
      <ScreenContainer>
        <EmptyState icon="!" title="Entre para acompanhar" message="Faça login para ver as doações vinculadas à sua conta." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}>
      <IllustratedHeader
        eyebrow="Doações"
        title="Minhas doações"
        subtitle="Histórico das doações PIX geradas enquanto você estava logado."
        illustration={false}
      />

      <View style={styles.stats}>
        <FocusCard label="Doações" value={donations.length} tone="cool" />
        <FocusCard label="Pago confirmado" value={formatCurrencyFromCents(totalPaid)} tone="warm" />
      </View>

      {loading ? (
        <AppCard style={styles.centerCard}>
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>Carregando doações...</Text>
        </AppCard>
      ) : error ? (
        <EmptyState icon="!" title="Não foi possível carregar" message={error} actionLabel="Tentar novamente" onAction={() => loadDonations()} />
      ) : donations.length === 0 ? (
        <EmptyState
          icon="$"
          title="Nenhuma doação vinculada"
          message="Doações geradas enquanto você estiver logado aparecerão aqui. A confirmação sempre vem do webhook de pagamento."
        />
      ) : (
        <View style={styles.section}>
          <SectionHeader title="Histórico" subtitle="Status informado pelo backend" />
          {donations.map((donation) => (
            <DonationHistoryCard key={donation.id} donation={donation} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function DonationHistoryCard({ donation }: { donation: Donation }) {
  const { theme } = useAppTheme();
  const campaignTitle = donation.campaign?.title || 'Campanha DoaDog';
  const location = formatLocation(donation.campaign?.city, donation.campaign?.state);
  const date = formatDate(donation.created_at);

  return (
    <AppCard style={styles.donationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {campaignTitle}
          </Text>
          <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <Badge label={statusLabels[donation.status] || donation.status} tone={statusTone[donation.status] || 'neutral'} />
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.amount, { color: theme.colors.text }]}>{formatCurrencyFromCents(donation.amount_in_cents)}</Text>
        {!!date && <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]}>{date}</Text>}
      </View>

      {donation.status === 'PENDING' && (
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
          Aguardando confirmação do provedor de pagamento. O app não confirma pagamento manualmente.
        </Text>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  donationCard: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  cardMeta: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
