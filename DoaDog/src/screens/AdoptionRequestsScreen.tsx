import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import FocusCard from '../components/FocusCard';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { adoptionServices } from '../services/api';
import { spacing, typography } from '../theme/theme';
import { AdoptionRequest } from '../types';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Reprovada',
  CANCELLED: 'Cancelada',
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Reprovada',
  cancelled: 'Cancelada',
};

const statusTone: Record<string, React.ComponentProps<typeof Badge>['tone']> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
};

function formatLocation(city?: string, state?: string) {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return 'Local não informado';
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

export default function AdoptionRequestsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    const { data, error: requestError } = await adoptionServices.getRequests();
    if (requestError) {
      setError(requestError.message);
    }
    setRequests(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadRequests();
      } else {
        setLoading(false);
      }
    }, [loadRequests, user])
  );

  const sentRequests = useMemo(
    () => requests.filter((request) => request.requesterId === user?.id || request.user_id === user?.id),
    [requests, user?.id]
  );

  const receivedRequests = useMemo(
    () => requests.filter((request) => request.dog?.createdById === user?.id && request.requesterId !== user?.id),
    [requests, user?.id]
  );

  const refresh = () => {
    setRefreshing(true);
    loadRequests(true);
  };

  const updateRequestStatus = async (request: AdoptionRequest, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(request.id);
    const { data, error: updateError } = await adoptionServices.updateStatus(
      request.id,
      status,
      status === 'APPROVED' ? 'Solicitação aprovada pelo responsável.' : 'Solicitação reprovada pelo responsável.'
    );
    setBusyId(null);

    if (updateError) {
      Alert.alert('Não foi possível atualizar', updateError.message);
      return;
    }

    setRequests((current) => current.map((item) => (item.id === request.id ? data : item)));
  };

  const rejectRequest = (request: AdoptionRequest) => {
    Alert.alert('Reprovar solicitação?', 'A pessoa interessada verá que a solicitação foi reprovada.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reprovar', style: 'destructive', onPress: () => updateRequestStatus(request, 'REJECTED') },
    ]);
  };

  if (!user) {
    return (
      <ScreenContainer>
        <EmptyState icon="!" title="Entre para acompanhar" message="Faça login para ver solicitações de adoção enviadas e recebidas." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}>
      <IllustratedHeader
        eyebrow="Adoção responsável"
        title="Solicitações"
        subtitle="Acompanhe interesses enviados e pedidos recebidos nos seus cães."
        illustration={false}
      />

      <View style={styles.stats}>
        <FocusCard label="Enviadas" value={sentRequests.length} tone="cool" />
        <FocusCard label="Recebidas" value={receivedRequests.length} tone="botanical" />
      </View>

      {loading ? (
        <AppCard style={styles.centerCard}>
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>Carregando solicitações...</Text>
        </AppCard>
      ) : error ? (
        <EmptyState icon="!" title="Não foi possível carregar" message={error} actionLabel="Tentar novamente" onAction={() => loadRequests()} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="♡"
          title="Nenhuma solicitação ainda"
          message="Quando houver interesse em adoção, o histórico aparecerá aqui."
        />
      ) : (
        <>
          {receivedRequests.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Recebidas" subtitle="Interesses nos cães cadastrados por você" />
              {receivedRequests.map((request) => (
                <AdoptionRequestCard
                  key={request.id}
                  request={request}
                  mode="received"
                  busy={busyId === request.id}
                  onApprove={() => updateRequestStatus(request, 'APPROVED')}
                  onReject={() => rejectRequest(request)}
                />
              ))}
            </View>
          )}

          {sentRequests.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Enviadas" subtitle="Seus interesses em adoção" />
              {sentRequests.map((request) => (
                <AdoptionRequestCard key={request.id} request={request} mode="sent" busy={busyId === request.id} />
              ))}
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

function AdoptionRequestCard({
  request,
  mode,
  busy,
  onApprove,
  onReject,
}: {
  request: AdoptionRequest;
  mode: 'sent' | 'received';
  busy: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const { theme } = useAppTheme();
  const dogName = request.dog?.name || 'Cão informado na solicitação';
  const location = formatLocation(request.dog?.city || request.user_city, request.dog?.state || request.user_state);
  const canModerate = mode === 'received' && request.status === 'PENDING';

  return (
    <AppCard style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestTitleBlock}>
          <Text style={[styles.requestTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {dogName}
          </Text>
          <Text style={[styles.requestMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {mode === 'received' ? request.user_name : location}
          </Text>
        </View>
        <Badge label={statusLabels[request.status] || request.status} tone={statusTone[request.status] || 'neutral'} />
      </View>

      <Text style={[styles.message, { color: theme.colors.textMuted }]} numberOfLines={3}>
        {request.message}
      </Text>

      <View style={styles.detailGrid}>
        <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>Moradia: {request.housing_type || 'Não informado'}</Text>
        <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>Rotina: {request.routine || 'Não informado'}</Text>
        {!!request.created_at && (
          <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>Enviada em {formatDate(request.created_at)}</Text>
        )}
      </View>

      {!!request.status_note && <Text style={[styles.statusNote, { color: theme.colors.textMuted }]}>{request.status_note}</Text>}

      {canModerate && (
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <AppButton title="Reprovar" onPress={onReject || (() => undefined)} variant="danger" disabled={busy} fullWidth />
          </View>
          <View style={styles.actionButton}>
            <AppButton title="Aprovar" icon="check" onPress={onApprove || (() => undefined)} loading={busy} fullWidth />
          </View>
        </View>
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
  helperText: {
    fontSize: typography.sizes.sm,
  },
  requestCard: {
    gap: spacing.md,
  },
  requestHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  requestTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  requestTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  requestMeta: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  message: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  detailGrid: {
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  statusNote: {
    fontSize: typography.sizes.xs,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
