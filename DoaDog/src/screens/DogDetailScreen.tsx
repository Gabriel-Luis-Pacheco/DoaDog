import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import Badge from '../components/Badge';
import DogPhoto from '../components/DogPhoto';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import StickyActionBar from '../components/StickyActionBar';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { adoptionServices, favoriteServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { Dog, DogStatus } from '../types';

type RootStackParamList = {
  DogDetail: { dog: Dog };
};

type AdoptionForm = {
  housingType: string;
  routine: string;
  experience: string;
  message: string;
  hasYard: boolean;
  hasOtherPets: boolean;
  familyAgreement: boolean;
  responsibilityAgreement: boolean;
};

type AdoptionErrors = Partial<Record<keyof AdoptionForm, string>>;

type SwitchRowProps = {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  error?: string;
};

const initialAdoptionForm: AdoptionForm = {
  housingType: '',
  routine: '',
  experience: '',
  message: 'Quero conversar sobre a adoção deste cão e entender os próximos passos.',
  hasYard: false,
  hasOtherPets: false,
  familyAgreement: false,
  responsibilityAgreement: false,
};

const statusLabels: Record<DogStatus, string> = {
  em_situacao_rua: 'Em situação de rua',
  precisa_lar_temporario: 'Precisa de lar temporário',
  resgatado: 'Resgatado',
  disponivel_adocao: 'Para adoção',
};

const infoLabels: Record<string, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
  nao_sei: 'Não sei',
  macho: 'Macho',
  femea: 'Fêmea',
  filhote: 'Filhote',
  jovem: 'Jovem',
  adulto: 'Adulto',
  idoso: 'Idoso',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  emergencia: 'Emergência',
};

function statusTone(status: DogStatus) {
  if (status === 'disponivel_adocao') return 'success';
  if (status === 'precisa_lar_temporario') return 'warning';
  if (status === 'em_situacao_rua') return 'coral';
  return 'blue';
}

export default function DogDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'DogDetail'>>();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { dog } = route.params;
  const [favorite, setFavorite] = useState(false);
  const [adoptionModalVisible, setAdoptionModalVisible] = useState(false);
  const [submittingAdoption, setSubmittingAdoption] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState<AdoptionForm>({ ...initialAdoptionForm });
  const [adoptionErrors, setAdoptionErrors] = useState<AdoptionErrors>({});
  const location = dog.location?.city && dog.location?.state ? `${dog.location.city}, ${dog.location.state}` : 'Local não informado';

  useEffect(() => {
    let mounted = true;
    favoriteServices.isDogFavorite(dog.id).then((isFavorite) => {
      if (mounted) setFavorite(isFavorite);
    });
    return () => {
      mounted = false;
    };
  }, [dog.id]);

  const showContact = () => {
    Alert.alert('Contato responsável', dog.contact_info || 'Contato não informado.');
  };

  const shareDog = async () => {
    await Share.share({
      message: `${dog.name || 'Um cão'} precisa de ajuda no DoaDog. Local: ${location}. ${dog.description}`,
    });
  };

  const toggleFavorite = async () => {
    const nextFavorite = await favoriteServices.toggleDog(dog.id);
    setFavorite(nextFavorite);
  };

  const updateAdoptionField = <Field extends keyof AdoptionForm>(field: Field, value: AdoptionForm[Field]) => {
    setAdoptionForm((current) => ({ ...current, [field]: value }));
    setAdoptionErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateAdoptionForm = () => {
    const nextErrors: AdoptionErrors = {};
    if (adoptionForm.housingType.trim().length < 2) {
      nextErrors.housingType = 'Informe se mora em casa, apartamento ou outro tipo de moradia.';
    }
    if (adoptionForm.routine.trim().length < 5) {
      nextErrors.routine = 'Conte brevemente como é sua rotina.';
    }
    if (adoptionForm.experience.trim().length < 5) {
      nextErrors.experience = 'Conte sua experiência com animais, mesmo que seja a primeira adoção.';
    }
    if (adoptionForm.message.trim().length < 10) {
      nextErrors.message = 'Escreva uma mensagem com pelo menos 10 caracteres.';
    }
    if (!adoptionForm.familyAgreement) {
      nextErrors.familyAgreement = 'Confirme que a família ou moradores da casa estão de acordo.';
    }
    if (!adoptionForm.responsibilityAgreement) {
      nextErrors.responsibilityAgreement = 'Confirme que entende a responsabilidade da adoção.';
    }
    setAdoptionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const adoptionInterest = () => {
    if (!user) {
      Alert.alert('Entre para continuar', 'Faça login para registrar interesse na adoção.');
      return;
    }
    setAdoptionModalVisible(true);
  };

  const closeAdoptionModal = () => {
    if (!submittingAdoption) {
      setAdoptionModalVisible(false);
    }
  };

  const submitAdoptionRequest = async () => {
    if (!user || !validateAdoptionForm()) return;

    setSubmittingAdoption(true);
    const { error } = await adoptionServices.createRequest({
      dog_id: dog.id,
      message: adoptionForm.message.trim(),
      housingType: adoptionForm.housingType.trim(),
      routine: adoptionForm.routine.trim(),
      experience: adoptionForm.experience.trim(),
      hasYard: adoptionForm.hasYard,
      hasOtherPets: adoptionForm.hasOtherPets,
      familyAgreement: adoptionForm.familyAgreement,
      responsibilityAgreement: adoptionForm.responsibilityAgreement,
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone,
      user_city: user.city,
      user_state: user.state,
    });
    setSubmittingAdoption(false);

    if (error) {
      Alert.alert('Não foi possível enviar', error.message);
      return;
    }

    setAdoptionForm({ ...initialAdoptionForm });
    setAdoptionErrors({});
    setAdoptionModalVisible(false);
    Alert.alert('Solicitação enviada', 'Seu interesse foi enviado para avaliação do responsável pelo cão.');
  };

  return (
    <View style={styles.flex}>
      <ScreenContainer contentContainerStyle={styles.content}>
        <DogPhoto
          uri={dog.images?.[0]}
          height={292}
          badge={<Badge label={statusLabels[dog.status]} tone={statusTone(dog.status)} />}
          style={styles.heroImage}
        />

        <AppCard style={styles.identityCard}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{dog.name || 'Nome desconhecido'}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={15} color={theme.colors.textSoft} />
                <Text style={[styles.location, { color: theme.colors.textMuted }]}>{location}</Text>
              </View>
            </View>
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
              <Feather name="heart" size={18} color={favorite ? theme.colors.white : theme.colors.secondary} />
            </Pressable>
          </View>
          <View style={styles.badges}>
            <Badge label={`Porte ${infoLabels[dog.size]}`} />
            <Badge label={infoLabels[dog.gender]} />
            <Badge label={infoLabels[dog.age_range]} />
            <Badge
              label={`Urgência ${infoLabels[dog.urgency_level]}`}
              tone={dog.urgency_level === 'alta' || dog.urgency_level === 'emergencia' ? 'danger' : 'warning'}
            />
          </View>
        </AppCard>

        <AppCard style={styles.cardGap}>
          <SectionHeader title="Sobre este cão" />
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{dog.description}</Text>
        </AppCard>

        {!!dog.health_condition && (
          <AppCard style={styles.cardGap}>
            <SectionHeader title="Saúde e cuidados" />
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{dog.health_condition}</Text>
          </AppCard>
        )}

        <AppCard style={styles.cardGap}>
          <SectionHeader title="Contato" />
          {!!dog.contact_name && <Text style={[styles.contactName, { color: theme.colors.text }]}>{dog.contact_name}</Text>}
          <Text selectable style={[styles.body, { color: theme.colors.textMuted }]}>
            {dog.contact_info || 'Contato não informado.'}
          </Text>
        </AppCard>
      </ScreenContainer>

      <StickyActionBar
        primaryLabel={dog.status === 'disponivel_adocao' ? 'Tenho interesse' : 'Entrar em contato'}
        primaryIcon={dog.status === 'disponivel_adocao' ? 'heart' : 'message-circle'}
        onPrimary={dog.status === 'disponivel_adocao' ? adoptionInterest : showContact}
        secondaryLabel="Compartilhar"
        secondaryIcon="share-2"
        onSecondary={shareDog}
      />

      <Modal transparent visible={adoptionModalVisible} animationType="fade" onRequestClose={closeAdoptionModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.overlay }]} onPress={closeAdoptionModal} />
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Interesse em adoção</Text>
                <Text style={[styles.modalText, { color: theme.colors.textMuted }]}>
                  Essas respostas ajudam o responsável a avaliar se o lar combina com o perfil do cão.
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar formulário" onPress={closeAdoptionModal} style={styles.closeButton}>
                <Feather name="x" size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AppInput
                label="Tipo de moradia"
                value={adoptionForm.housingType}
                onChangeText={(value) => updateAdoptionField('housingType', value)}
                placeholder="Casa, apartamento, sítio..."
                error={adoptionErrors.housingType}
              />
              <AppInput
                label="Rotina da casa"
                value={adoptionForm.routine}
                onChangeText={(value) => updateAdoptionField('routine', value)}
                placeholder="Horários, tempo sozinho, passeios..."
                multiline
                error={adoptionErrors.routine}
              />
              <AppInput
                label="Experiência com animais"
                value={adoptionForm.experience}
                onChangeText={(value) => updateAdoptionField('experience', value)}
                placeholder="Já teve cães? Tem outros animais?"
                multiline
                error={adoptionErrors.experience}
              />
              <AppInput
                label="Mensagem ao responsável"
                value={adoptionForm.message}
                onChangeText={(value) => updateAdoptionField('message', value)}
                multiline
                error={adoptionErrors.message}
              />

              <SwitchRow
                title="Tenho quintal ou área externa segura"
                value={adoptionForm.hasYard}
                onValueChange={(value) => updateAdoptionField('hasYard', value)}
              />
              <SwitchRow
                title="Já existem outros pets na casa"
                value={adoptionForm.hasOtherPets}
                onValueChange={(value) => updateAdoptionField('hasOtherPets', value)}
              />
              <SwitchRow
                title="Todos os moradores concordam com a adoção"
                value={adoptionForm.familyAgreement}
                onValueChange={(value) => updateAdoptionField('familyAgreement', value)}
                error={adoptionErrors.familyAgreement}
              />
              <SwitchRow
                title="Entendo os custos e cuidados de uma adoção responsável"
                value={adoptionForm.responsibilityAgreement}
                onValueChange={(value) => updateAdoptionField('responsibilityAgreement', value)}
                error={adoptionErrors.responsibilityAgreement}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <AppButton title="Cancelar" onPress={closeAdoptionModal} variant="ghost" disabled={submittingAdoption} fullWidth />
              <AppButton title="Enviar solicitação" icon="send" onPress={submitAdoptionRequest} loading={submittingAdoption} fullWidth />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function SwitchRow({ title, value, onValueChange, error }: SwitchRowProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.switchBlock}>
      <View style={[styles.switchRow, { borderColor: error ? theme.colors.danger : theme.colors.border }]}>
        <Text style={[styles.switchTitle, { color: theme.colors.text }]}>{title}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.secondarySoft }}
          thumbColor={value ? theme.colors.secondary : theme.colors.textSoft}
        />
      </View>
      {!!error && <Text style={[styles.switchError, { color: theme.colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
  },
  heroImage: {
    borderRadius: radius.xl,
  },
  identityCard: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  favoriteButton: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    lineHeight: 31,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardGap: {
    gap: spacing.md,
  },
  body: {
    fontSize: typography.sizes.md,
    lineHeight: 23,
  },
  contactName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '88%',
    padding: spacing.lg,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  modalHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  closeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  modalText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  modalContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  switchBlock: {
    gap: spacing.xs,
  },
  switchRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    lineHeight: 19,
  },
  switchError: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
