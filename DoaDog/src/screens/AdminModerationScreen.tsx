import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { adminServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { Dog, DonationCampaign } from '../types';

type ModerationQueue = {
  dogs: Dog[];
  campaigns: DonationCampaign[];
  adoptionRequests: AdoptionRequestSummary[];
};

type AdoptionRequestSummary = {
  id: string;
  dogId?: string;
  dog_id?: string;
  adopterName?: string;
  adopterEmail?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
};

const emptyQueue: ModerationQueue = {
  dogs: [],
  campaigns: [],
  adoptionRequests: [],
};

const dogStatusLabels: Record<Dog['status'], string> = {
  em_situacao_rua: 'Rua',
  precisa_lar_temporario: 'Lar temporário',
  resgatado: 'Resgatado',
  disponivel_adocao: 'Adoção',
};

function formatLocation(city?: string, state?: string) {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return 'Local não informado';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function shortDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

export default function AdminModerationScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [queue, setQueue] = useState<ModerationQueue>(emptyQueue);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    const { data, error: queueError } = await adminServices.getModerationQueue();
    if (queueError) {
      setError(queueError.message);
    }
    setQueue(data as ModerationQueue);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'admin') {
        loadQueue();
      } else {
        setLoading(false);
      }
    }, [loadQueue, user?.role])
  );

  const refresh = () => {
    setRefreshing(true);
    loadQueue(true);
  };

  const completeDogModeration = async (dog: Dog, moderationStatus: 'APPROVED' | 'REJECTED') => {
    const isRejected = moderationStatus === 'REJECTED';
    setBusyKey(`dog:${dog.id}`);
    const { error: moderationError } = await adminServices.moderateDog(
      dog.id,
      moderationStatus,
      isRejected ? 'Reprovado pela moderação do DoaDog.' : undefined
    );
    setBusyKey(null);

    if (moderationError) {
      Alert.alert('Não foi possível moderar', moderationError.message);
      return;
    }

    setQueue((current) => ({ ...current, dogs: current.dogs.filter((item) => item.id !== dog.id) }));
  };

  const completeCampaignModeration = async (campaign: DonationCampaign, status: 'ACTIVE' | 'REJECTED') => {
    const isRejected = status === 'REJECTED';
    setBusyKey(`campaign:${campaign.id}`);
    const { error: moderationError } = await adminServices.moderateCampaign(
      campaign.id,
      status,
      isRejected ? 'Reprovada pela moderação do DoaDog.' : undefined
    );
    setBusyKey(null);

    if (moderationError) {
      Alert.alert('Não foi possível moderar', moderationError.message);
      return;
    }

    setQueue((current) => ({ ...current, campaigns: current.campaigns.filter((item) => item.id !== campaign.id) }));
  };

  const rejectDog = (dog: Dog) => {
    Alert.alert('Reprovar cão?', 'O cadastro sairá da fila pública e ficará registrado no histórico de moderação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reprovar', style: 'destructive', onPress: () => completeDogModeration(dog, 'REJECTED') },
    ]);
  };

  const rejectCampaign = (campaign: DonationCampaign) => {
    Alert.alert('Reprovar campanha?', 'A campanha não será exibida para doações públicas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reprovar', style: 'destructive', onPress: () => completeCampaignModeration(campaign, 'REJECTED') },
    ]);
  };

  if (user?.role !== 'admin') {
    return (
      <ScreenContainer>
        <EmptyState icon="!" title="Acesso restrito" message="A moderação é reservada para administradores do DoaDog." />
      </ScreenContainer>
    );
  }

  const totalPending = queue.dogs.length + queue.campaigns.length;

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}>
      <SectionHeader
        title="Moderação"
        subtitle="Cadastros pendentes e solicitações recentes."
        right={<Badge label={`${totalPending} pendentes`} tone={totalPending ? 'warning' : 'success'} />}
      />

      {loading ? (
        <AppCard style={styles.centerCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>Carregando fila...</Text>
        </AppCard>
      ) : error ? (
        <EmptyState icon="!" title="Fila indisponível" message={error} actionLabel="Tentar novamente" onAction={() => loadQueue()} />
      ) : totalPending === 0 ? (
        <EmptyState icon="✓" title="Nada pendente" message="Novos cães e campanhas aguardando análise aparecerão aqui." />
      ) : null}

      {queue.dogs.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Cães pendentes" subtitle={`${queue.dogs.length} cadastro(s) aguardando análise`} />
          {queue.dogs.map((dog) => (
            <ModerationDogCard
              key={dog.id}
              dog={dog}
              busy={busyKey === `dog:${dog.id}`}
              onApprove={() => completeDogModeration(dog, 'APPROVED')}
              onReject={() => rejectDog(dog)}
            />
          ))}
        </View>
      )}

      {queue.campaigns.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Campanhas pendentes" subtitle={`${queue.campaigns.length} campanha(s) aguardando análise`} />
          {queue.campaigns.map((campaign) => (
            <ModerationCampaignCard
              key={campaign.id}
              campaign={campaign}
              busy={busyKey === `campaign:${campaign.id}`}
              onApprove={() => completeCampaignModeration(campaign, 'ACTIVE')}
              onReject={() => rejectCampaign(campaign)}
            />
          ))}
        </View>
      )}

      {queue.adoptionRequests.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Solicitações recentes" subtitle="Últimos interesses registrados no app" />
          {queue.adoptionRequests.slice(0, 6).map((request) => (
            <AdoptionRequestCard key={request.id} request={request} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function ModerationDogCard({
  dog,
  busy,
  onApprove,
  onReject,
}: {
  dog: Dog;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { theme } = useAppTheme();
  const location = formatLocation(dog.location?.city, dog.location?.state);

  return (
    <AppCard style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleBlock}>
          <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {dog.name || 'Cão sem nome'}
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <Badge label={dogStatusLabels[dog.status]} tone="blue" />
      </View>
      <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]} numberOfLines={3}>
        {dog.description}
      </Text>
      <View style={styles.badges}>
        <Badge label={dog.size} />
        <Badge label={dog.gender} />
        <Badge label={dog.age_range} />
      </View>
      <View style={styles.actionRow}>
        <View style={styles.actionButton}>
          <AppButton title="Reprovar" onPress={onReject} variant="danger" disabled={busy} fullWidth />
        </View>
        <View style={styles.actionButton}>
          <AppButton title="Aprovar" icon="check" onPress={onApprove} loading={busy} fullWidth />
        </View>
      </View>
    </AppCard>
  );
}

function ModerationCampaignCard({
  campaign,
  busy,
  onApprove,
  onReject,
}: {
  campaign: DonationCampaign;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { theme } = useAppTheme();
  const location = formatLocation(campaign.city, campaign.state);

  return (
    <AppCard style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleBlock}>
          <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {campaign.title}
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {campaign.beneficiary_name} • {location}
          </Text>
        </View>
        <Badge label={formatCurrency(campaign.goal_amount)} tone="warning" />
      </View>
      <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]} numberOfLines={3}>
        {campaign.description}
      </Text>
      <View style={styles.actionRow}>
        <View style={styles.actionButton}>
          <AppButton title="Reprovar" onPress={onReject} variant="danger" disabled={busy} fullWidth />
        </View>
        <View style={styles.actionButton}>
          <AppButton title="Aprovar" icon="check" onPress={onApprove} loading={busy} fullWidth />
        </View>
      </View>
    </AppCard>
  );
}

function AdoptionRequestCard({ request }: { request: AdoptionRequestSummary }) {
  const { theme } = useAppTheme();
  const requester = request.adopterName || request.adopterEmail || 'Solicitante';
  const date = shortDate(request.createdAt || request.created_at);

  return (
    <AppCard style={styles.requestCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleBlock}>
          <Text style={[styles.requestTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {requester}
          </Text>
          {!!date && <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{date}</Text>}
        </View>
        <Badge label={request.status || 'PENDING'} tone="neutral" />
      </View>
      {!!request.message && (
        <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {request.message}
        </Text>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  centerCard: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 120,
  },
  helperText: {
    fontSize: typography.sizes.sm,
  },
  itemCard: {
    gap: spacing.md,
  },
  requestCard: {
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  itemTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  requestTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  itemMeta: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  itemDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
