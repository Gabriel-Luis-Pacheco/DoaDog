import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { donationServices, favoriteServices } from '../services/api';
import { DonationCampaign } from '../types';
import { radius, spacing, typography, urgencyColors } from '../theme/theme';
import { successHaptic } from '../utils/haptics';
import AppButton from './AppButton';
import AppCard from './AppCard';
import AppIllustration from './AppIllustration';
import AppInput from './AppInput';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

interface CampaignCardProps {
  campaign: DonationCampaign;
}

const urgencyLabels = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

const helpTypeLabels = {
  racao: 'Ração',
  tratamento: 'Tratamento',
  medicamentos: 'Medicamentos',
  transporte: 'Transporte',
  lar_temporario: 'Lar temporário',
  outros: 'Outros',
};

const beneficiaryTypeLabels = {
  cao: 'Cão',
  ong: 'ONG/Projeto',
  protetor: 'Protetor',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [amount, setAmount] = useState('25');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donating, setDonating] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const progress = campaign.goal_amount > 0 ? Math.min(campaign.collected_amount / campaign.goal_amount, 1) : 0;
  const progressPercent = Math.round(progress * 100);
  const urgency = campaign.urgency ?? 'media';
  const helpType = campaign.help_type ?? 'outros';
  const beneficiaryType = campaign.beneficiary_type ?? 'protetor';
  const legacyBeneficiary = (campaign as DonationCampaign & { beneficiary?: string }).beneficiary;
  const beneficiaryName = campaign.beneficiary_name || legacyBeneficiary || 'Responsável não informado';
  const urgencyTone = urgency === 'alta' ? 'danger' : urgency === 'media' ? 'warning' : 'success';

  useEffect(() => {
    let mounted = true;
    favoriteServices.isCampaignFavorite(campaign.id).then((isFavorite) => {
      if (mounted) setFavorite(isFavorite);
    });
    return () => {
      mounted = false;
    };
  }, [campaign.id]);

  useEffect(() => {
    if (user) {
      setDonorName((current) => current || user.name);
      setDonorEmail((current) => current || user.email);
    }
  }, [user]);

  const openDetails = () => {
    setCopied(false);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setCopied(false);
    setPixCode('');
    setPaymentStatus('');
  };

  const toggleFavorite = async () => {
    const nextFavorite = await favoriteServices.toggleCampaign(campaign.id);
    setFavorite(nextFavorite);
  };

  const createPix = async () => {
    const amountNumber = Number(amount.replace(/[^\d,.]/g, '').replace(',', '.'));
    if (!Number.isFinite(amountNumber) || amountNumber < 1) {
      Alert.alert('Valor inválido', 'Informe um valor de apoio de pelo menos R$ 1.');
      return;
    }

    if (!donorName.trim() || !/\S+@\S+\.\S+/.test(donorEmail.trim())) {
      Alert.alert('Dados do doador', 'Informe nome e e-mail para gerar o PIX.');
      return;
    }

    setDonating(true);
    try {
      const { data, error } = await donationServices.create({
        campaignId: campaign.id,
        amount: amountNumber,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
      });

      if (error) {
        Alert.alert('Erro ao gerar PIX', error.message);
        return;
      }

      const pixResponse = data as any;
      setPixCode(pixResponse?.brCode || pixResponse?.donation?.brCode || '');
      setPaymentStatus(pixResponse?.status || pixResponse?.donation?.status || 'PENDING');
    } finally {
      setDonating(false);
    }
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        {campaign.image_uri ? (
          <Image source={{ uri: campaign.image_uri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: theme.colors.surfaceLilac }]}>
            <AppIllustration variant="help" compact style={styles.thumbArt} />
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {campaign.title}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {helpTypeLabels[helpType]} - {campaign.city}, {campaign.state}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onPress={toggleFavorite}
            style={[
              styles.favoriteButton,
              {
                backgroundColor: favorite ? theme.colors.primary : theme.colors.surface,
                borderColor: favorite ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Feather name="heart" size={16} color={favorite ? theme.colors.white : theme.colors.secondary} />
          </Pressable>
          <Badge label={urgencyLabels[urgency]} tone={urgencyTone} />
        </View>
      </View>

      <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={2}>
        {campaign.description}
      </Text>

      <Text style={[styles.beneficiary, { color: theme.colors.text }]} numberOfLines={1}>
        {beneficiaryTypeLabels[beneficiaryType]}: {beneficiaryName}
      </Text>

      <View style={styles.amountRow}>
        <View style={styles.amountBlock}>
          <Text style={[styles.amountLabel, { color: theme.colors.textSoft }]}>Registrado</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={[styles.amount, { color: theme.colors.text }]}>
            {formatCurrency(campaign.collected_amount)}
          </Text>
        </View>
        <View style={styles.goalText}>
          <Text style={[styles.amountLabel, { color: theme.colors.textSoft }]}>Meta</Text>
          <Text style={[styles.goal, { color: theme.colors.textMuted }]}>{formatCurrency(campaign.goal_amount)}</Text>
        </View>
      </View>

      <ProgressBar progress={progress} color={urgency === 'alta' ? urgencyColors.alta : theme.colors.primary} />
      <Text style={[styles.progressText, { color: theme.colors.textSoft }]}>{progressPercent}% informado</Text>

      <AppButton title="Apoiar" icon="heart" onPress={openDetails} variant="outline" fullWidth />

      <Modal transparent visible={detailsOpen} animationType="fade" onRequestClose={closeDetails}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.colors.overlay }]} onPress={closeDetails}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{campaign.title}</Text>
            {!!campaign.image_uri && <Image source={{ uri: campaign.image_uri }} style={styles.modalImage} />}
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>{campaign.description}</Text>
            <View style={[styles.contactBox, { backgroundColor: theme.colors.backgroundAlt, borderColor: theme.colors.border }]}>
              {pixCode ? (
                <>
                  <Text style={[styles.contactLabel, { color: theme.colors.textSoft }]}>PIX copia e cola</Text>
                  <Text selectable numberOfLines={4} style={[styles.contact, { color: theme.colors.text }]}>
                    {pixCode}
                  </Text>
                  {!!paymentStatus && (
                    <Text style={[styles.contactHelper, { color: theme.colors.textMuted }]}>Status: {paymentStatus}</Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.contactHelper, { color: theme.colors.textMuted }]}>
                    Gere uma cobrança PIX pelo backend. A confirmação do pagamento acontece pelo webhook, nunca pelo app.
                  </Text>
                  <AppInput label="Valor" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                  <AppInput label="Nome" value={donorName} onChangeText={setDonorName} />
                  <AppInput
                    label="E-mail"
                    value={donorEmail}
                    onChangeText={setDonorEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </>
              )}
            </View>

            {pixCode ? (
              <>
                <AppButton
                  title="Copiar PIX"
                  onPress={async () => {
                    await Clipboard.setStringAsync(pixCode);
                    await successHaptic();
                    setCopied(true);
                  }}
                  variant="outline"
                  fullWidth
                />
                {copied && <Text style={[styles.copiedText, { color: theme.colors.success }]}>Código PIX copiado.</Text>}
              </>
            ) : (
              <AppButton title="Gerar PIX" onPress={createPix} loading={donating} variant="outline" fullWidth />
            )}
            <AppButton title="Fechar" onPress={closeDetails} fullWidth />
          </Pressable>
        </Pressable>
      </Modal>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  thumb: {
    borderRadius: radius.lg,
    height: 60,
    width: 60,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 60,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 60,
  },
  thumbArt: {
    borderWidth: 0,
    width: 74,
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  favoriteButton: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    lineHeight: 23,
  },
  meta: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  description: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  beneficiary: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    lineHeight: 19,
  },
  amountRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  goalText: {
    alignItems: 'flex-end',
  },
  goal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  contactBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  contactLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  contactHelper: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  copiedText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  modalImage: {
    borderRadius: radius.lg,
    height: 180,
    width: '100%',
  },
});

export default CampaignCard;
