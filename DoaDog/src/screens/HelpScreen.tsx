import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppSelect, { SelectOption } from '../components/AppSelect';
import AppSnackbar from '../components/AppSnackbar';
import BrandLogo from '../components/BrandLogo';
import CampaignCard from '../components/CampaignCard';
import EmptyState from '../components/EmptyState';
import FocusCard from '../components/FocusCard';
import FormSection from '../components/FormSection';
import HelpOptionCard from '../components/HelpOptionCard';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useBrazilLocations } from '../hooks/useBrazilLocations';
import { donationServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { BeneficiaryType, DonationCampaign, DonationUrgency, HelpType } from '../types';
import { cleanMultiline, cleanText, parseCurrencyInput } from '../utils/sanitize';
import { impactLight, successHaptic } from '../utils/haptics';

const urgencyOptions: SelectOption[] = [
  { label: 'Baixa', value: 'baixa' },
  { label: 'Média', value: 'media' },
  { label: 'Alta', value: 'alta' },
];

const helpTypeOptions: SelectOption[] = [
  { label: 'Ração', value: 'racao' },
  { label: 'Tratamento veterinário', value: 'tratamento' },
  { label: 'Medicamentos', value: 'medicamentos' },
  { label: 'Transporte', value: 'transporte' },
  { label: 'Lar temporário', value: 'lar_temporario' },
  { label: 'Outros', value: 'outros' },
];

const beneficiaryTypeOptions: SelectOption[] = [
  { label: 'Cão específico', value: 'cao' },
  { label: 'ONG/Projeto', value: 'ong' },
  { label: 'Protetor independente', value: 'protetor' },
];

const helpOptions: { icon: keyof typeof Feather.glyphMap; title: string; text: string; helpType: HelpType }[] = [
  { icon: 'package', title: 'Ração', text: 'Alimento e itens básicos.', helpType: 'racao' },
  { icon: 'heart', title: 'Tratamento', text: 'Consulta, exames e remédios.', helpType: 'tratamento' },
  { icon: 'truck', title: 'Transporte', text: 'Ajuda para deslocamento seguro.', helpType: 'transporte' },
  { icon: 'home', title: 'Lar temporário', text: 'Acolhimento por alguns dias.', helpType: 'lar_temporario' },
];

const initialForm = {
  title: '',
  help_type: 'racao' as HelpType,
  beneficiary_type: 'cao' as BeneficiaryType,
  beneficiary_name: '',
  city: '',
  state: '',
  description: '',
  goal_amount: '',
  urgency: 'media' as DonationUrgency,
  image_uri: '',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function HelpScreen() {
  const { theme } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState(initialForm);
  const { states, cities, loadingCities: locationLoading, locationError } = useBrazilLocations(form.state);

  const loadCampaigns = async () => {
    const { data } = await donationServices.getCampaigns();
    setCampaigns(data);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const stats = useMemo(() => {
    const total = campaigns.reduce((sum, campaign) => sum + campaign.collected_amount, 0);
    const urgent = campaigns.filter((campaign) => campaign.urgency === 'alta').length;
    return { total, urgent };
  }, [campaigns]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para anexar uma imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });
    if (!result.canceled) {
      setForm((current) => ({ ...current, image_uri: result.assets[0].uri }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const goal = parseCurrencyInput(form.goal_amount);

    if (!cleanText(form.title)) nextErrors.title = 'Informe o título do pedido.';
    if (!cleanText(form.beneficiary_name)) nextErrors.beneficiary_name = 'Informe o beneficiário.';
    if (!form.state) nextErrors.state = 'Selecione o estado.';
    if (!form.city) nextErrors.city = 'Selecione a cidade.';
    if (!cleanMultiline(form.description)) nextErrors.description = 'Explique a necessidade.';
    if (!Number.isFinite(goal) || goal <= 0) nextErrors.goal_amount = 'Informe uma meta válida.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const ensureAuthenticated = () => {
    if (isAuthenticated) return true;
    Alert.alert('Entre para continuar', 'Faca login para criar um pedido de apoio.');
    return false;
  };

  const createCampaign = async () => {
    if (!ensureAuthenticated()) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await donationServices.createCampaign({
        title: cleanText(form.title),
        help_type: form.help_type,
        beneficiary_type: form.beneficiary_type,
        beneficiary_name: cleanText(form.beneficiary_name),
        city: cleanText(form.city),
        state: cleanText(form.state).toUpperCase(),
        description: cleanMultiline(form.description),
        goal_amount: parseCurrencyInput(form.goal_amount),
        collected_amount: 0,
        urgency: form.urgency,
        pix_contact: '',
        image_uri: form.image_uri || undefined,
      });
      if (error) {
        Alert.alert('Não foi possível criar', error.message);
        return;
      }

      await loadCampaigns();
      await successHaptic();
      setForm(initialForm);
      setErrors({});
      setShowForm(false);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2200);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    if (!showForm && !ensureAuthenticated()) return;
    impactLight();
    setShowForm((current) => !current);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScreenContainer>
        <IllustratedHeader
          brand={<BrandLogo size="sm" showText={false} />}
          eyebrow="Ajuda"
          title="Pedidos de apoio"
          subtitle="Crie ou acompanhe pedidos locais."
          illustration={false}
          right={
            <AppButton
              title={showForm ? 'Fechar' : 'Criar pedido'}
              icon={showForm ? 'x' : 'plus-circle'}
              onPress={toggleForm}
              variant={showForm ? 'outline' : 'primary'}
              style={styles.headerButton}
            />
          }
        />

        {!showForm && (
          <View style={styles.helpGrid}>
            {helpOptions.map((option) => (
              <HelpOptionCard
                key={option.title}
                icon={option.icon}
                title={option.title}
                text={option.text}
                onPress={() => {
                  if (!ensureAuthenticated()) return;
                  impactLight();
                  setForm((current) => ({ ...current, help_type: option.helpType }));
                  setShowForm(true);
                }}
              />
            ))}
          </View>
        )}

        {campaigns.length > 0 && !showForm && (
          <View style={styles.stats}>
            <FocusCard label="Pedidos" value={campaigns.length} tone="botanical" />
            <FocusCard label="Registrado" value={formatCurrency(stats.total)} tone="warm" />
            <FocusCard label="Urgentes" value={stats.urgent} tone="lilac" />
          </View>
        )}

        {showForm && (
          <FormSection title="Novo pedido">
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>Dados do pedido</Text>
            <AppInput
              label="Título"
              placeholder="Ex: Consulta e exames"
              value={form.title}
              error={errors.title}
              onChangeText={(title) => setForm((current) => ({ ...current, title }))}
            />
            <AppSelect
              label="Tipo de ajuda"
              value={form.help_type}
              options={helpTypeOptions}
              onChange={(help_type) => setForm((current) => ({ ...current, help_type: help_type as HelpType }))}
            />
            <AppSelect
              label="Beneficiário"
              value={form.beneficiary_type}
              options={beneficiaryTypeOptions}
              onChange={(beneficiary_type) =>
                setForm((current) => ({ ...current, beneficiary_type: beneficiary_type as BeneficiaryType }))
              }
            />
            <AppInput
              label="Nome do beneficiário"
              placeholder="Nome do cão, projeto ou protetor"
              value={form.beneficiary_name}
              error={errors.beneficiary_name}
              onChangeText={(beneficiary_name) => setForm((current) => ({ ...current, beneficiary_name }))}
            />
            <AppInput
              label="Descrição"
              placeholder="Explique a necessidade e como a ajuda será usada."
              value={form.description}
              error={errors.description}
              multiline
              onChangeText={(description) => setForm((current) => ({ ...current, description }))}
            />

            <SectionHeader title="Local e meta" />
            <AppSelect
              label="Estado"
              value={form.state}
              options={states}
              error={errors.state}
              onChange={(state) => setForm((current) => ({ ...current, state, city: '' }))}
            />
            <AppSelect
              label="Cidade"
              value={form.city}
              options={cities}
              loading={locationLoading}
              disabled={!form.state}
              error={errors.city}
              onChange={(city) => setForm((current) => ({ ...current, city }))}
            />
            {!!locationError && <Text style={[styles.helper, { color: theme.colors.warning }]}>{locationError}</Text>}
            <AppInput
              label="Meta"
              placeholder="Ex: 450"
              value={form.goal_amount}
              error={errors.goal_amount}
              keyboardType="numeric"
              onChangeText={(goal_amount) => setForm((current) => ({ ...current, goal_amount }))}
            />
            <AppSelect
              label="Urgência"
              value={form.urgency}
              options={urgencyOptions}
              onChange={(urgency) => setForm((current) => ({ ...current, urgency: urgency as DonationUrgency }))}
            />
            <View style={styles.photoRow}>
              {form.image_uri ? (
                <Image source={{ uri: form.image_uri }} style={styles.preview} />
              ) : (
                <View style={[styles.preview, { backgroundColor: theme.colors.primarySoft }]} />
              )}
              <View style={styles.photoText}>
                <Text style={[styles.photoTitle, { color: theme.colors.text }]}>Imagem opcional</Text>
                <Text style={[styles.photoHelper, { color: theme.colors.textMuted }]}>Use uma imagem real quando tiver.</Text>
              </View>
              <AppButton title="Escolher" icon="image" onPress={pickImage} variant="outline" />
            </View>
            <AppButton title="Publicar pedido" icon="send" onPress={createCampaign} loading={loading} fullWidth />
          </FormSection>
        )}

        {!showForm && campaigns.length === 0 ? (
          <EmptyState
            illustration="help"
            title="Nenhum pedido criado"
            message="Crie um pedido para ração, tratamento, transporte ou lar temporário."
            actionLabel="Criar pedido"
            onAction={() => {
              if (!ensureAuthenticated()) return;
              impactLight();
              setShowForm(true);
            }}
          />
        ) : !showForm ? (
          <View style={styles.list}>
            <SectionHeader title="Pedidos ativos" />
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </View>
        ) : null}
      </ScreenContainer>
      <AppSnackbar visible={snackbarVisible} message="Pedido criado com sucesso." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  headerButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rowLarge: {
    flex: 1,
    minWidth: 130,
  },
  photoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  preview: {
    borderRadius: radius.lg,
    height: 64,
    width: 64,
  },
  photoText: {
    flex: 1,
    gap: spacing.xs,
  },
  photoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  photoHelper: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  helper: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
  list: {
    gap: spacing.lg,
  },
});
