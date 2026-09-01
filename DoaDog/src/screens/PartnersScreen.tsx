import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AppCard from '../components/AppCard';
import EmptyState from '../components/EmptyState';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAppTheme } from '../context/ThemeContext';
import { partnerServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';

interface Partner {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  description: string;
  contactUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialUrl?: string;
}

export default function PartnersScreen() {
  const { theme } = useAppTheme();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPartners = async () => {
    setLoading(true);
    const { data } = await partnerServices.getPartners();
    setPartners(data as Partner[]);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadPartners();
    }, [])
  );

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Carregando parceiros...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <IllustratedHeader
        eyebrow="Rede"
        title="Parceiros"
        subtitle="Contatos confiaveis para apoiar protetores, ONGs e adotantes."
        illustration={false}
      />

      {partners.length === 0 ? (
        <EmptyState
          illustration="help"
          title="Nenhum parceiro ativo"
          message="Parceiros aprovados pela moderacao aparecem aqui."
        />
      ) : (
        <View style={styles.list}>
          <SectionHeader title="Parceiros ativos" />
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const { theme } = useAppTheme();
  const contactUrl = partner.contactUrl || partner.socialUrl;

  const openContact = async () => {
    if (!contactUrl) return;
    const supported = await Linking.canOpenURL(contactUrl);
    if (supported) await Linking.openURL(contactUrl);
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.icon, { backgroundColor: theme.colors.secondarySoft }]}>
          <Feather name="briefcase" size={18} color={theme.colors.secondary} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{partner.name}</Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {partner.category} - {partner.city}, {partner.state}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.colors.textMuted }]}>{partner.description}</Text>

      {!!(partner.contactPhone || partner.contactEmail) && (
        <Text selectable style={[styles.contact, { color: theme.colors.text }]}>
          {partner.contactPhone || partner.contactEmail}
        </Text>
      )}

      {!!contactUrl && (
        <Pressable onPress={openContact} style={styles.linkRow}>
          <Text style={[styles.linkText, { color: theme.colors.secondary }]}>Abrir contato</Text>
          <Feather name="external-link" size={16} color={theme.colors.secondary} />
        </Pressable>
      )}
    </AppCard>
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
  list: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  meta: {
    fontSize: typography.sizes.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  contact: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
  },
  linkText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
