import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppSelect, { SelectOption } from '../components/AppSelect';
import AppSnackbar from '../components/AppSnackbar';
import BrandLogo from '../components/BrandLogo';
import FormSection from '../components/FormSection';
import IllustratedHeader from '../components/IllustratedHeader';
import PhotoPickerCard from '../components/PhotoPickerCard';
import ScreenContainer from '../components/ScreenContainer';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useBrazilLocations } from '../hooks/useBrazilLocations';
import { dogServices, storageServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { DogAgeRange, DogGender, DogSize, DogStatus, UrgencyLevel } from '../types';
import { cleanContact, cleanMultiline, cleanText } from '../utils/sanitize';
import { successHaptic } from '../utils/haptics';

const sizeOptions: SelectOption[] = [
  { label: 'Pequeno', value: 'pequeno' },
  { label: 'Médio', value: 'medio' },
  { label: 'Grande', value: 'grande' },
  { label: 'Não sei', value: 'nao_sei' },
];

const genderOptions: SelectOption[] = [
  { label: 'Macho', value: 'macho' },
  { label: 'Fêmea', value: 'femea' },
  { label: 'Não sei', value: 'nao_sei' },
];

const ageOptions: SelectOption[] = [
  { label: 'Filhote', value: 'filhote' },
  { label: 'Jovem', value: 'jovem' },
  { label: 'Adulto', value: 'adulto' },
  { label: 'Idoso', value: 'idoso' },
];

const statusOptions: SelectOption[] = [
  { label: 'Em situação de rua', value: 'em_situacao_rua' },
  { label: 'Resgatado', value: 'resgatado' },
  { label: 'Para adoção', value: 'disponivel_adocao' },
  { label: 'Precisa de lar temporário', value: 'precisa_lar_temporario' },
];

const urgencyOptions: SelectOption[] = [
  { label: 'Baixa', value: 'baixa' },
  { label: 'Média', value: 'media' },
  { label: 'Alta', value: 'alta' },
];

export default function RegisterDogScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: user?.state || '',
    city: user?.city || '',
    address: '',
    size: 'medio' as DogSize,
    gender: 'nao_sei' as DogGender,
    age_range: 'adulto' as DogAgeRange,
    status: 'em_situacao_rua' as DogStatus,
    urgency_level: 'media' as UrgencyLevel,
    health_condition: '',
    contact_name: user?.name || '',
    contact_info: user?.phone || user?.email || '',
  });
  const { states, cities, loadingCities: locationLoading, locationError } = useBrazilLocations(formData.state);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para anexar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.82,
    });

    if (!result.canceled) {
      setImages((current) => [...current, ...result.assets.map((asset) => asset.uri)].slice(0, 5));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!cleanMultiline(formData.description)) nextErrors.description = 'Descreva onde o cão foi visto e como ele está.';
    if (!formData.state) nextErrors.state = 'Selecione o estado.';
    if (!formData.city) nextErrors.city = 'Selecione a cidade.';
    if (!cleanText(formData.contact_name)) nextErrors.contact_name = 'Informe o nome do responsável pelo contato.';
    if (!cleanContact(formData.contact_info)) nextErrors.contact_info = 'Informe um telefone, e-mail ou Instagram para contato.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const uploadedImages: string[] = [];
      for (const uri of images) {
        const { data, error } = await storageServices.uploadImage({ uri });
        if (error) {
          throw new Error(error.message);
        }
        if (data?.publicUrl) uploadedImages.push(data.publicUrl);
      }

      const { error } = await dogServices.createDog({
        name: cleanText(formData.name, 80) || 'Nome desconhecido',
        description: cleanMultiline(formData.description),
        size: formData.size,
        gender: formData.gender,
        age_range: formData.age_range,
        status: formData.status,
        urgency_level: formData.urgency_level,
        health_condition: cleanMultiline(formData.health_condition, 500) || undefined,
        contact_name: cleanText(formData.contact_name, 90),
        contact_info: cleanContact(formData.contact_info),
        location: {
          address: cleanText(formData.address, 160) || undefined,
          city: cleanText(formData.city),
          state: cleanText(formData.state),
        },
        images: uploadedImages,
        user_id: user?.id || 'visitor',
      });
      if (error) {
        throw new Error(error.message);
      }

      setFormData((current) => ({
        ...current,
        name: '',
        description: '',
        address: '',
        health_condition: '',
        contact_name: user?.name || current.contact_name,
        contact_info: user?.phone || user?.email || '',
      }));
      setImages([]);
      setErrors({});
      await successHaptic();
      setSnackbarVisible(true);
      setTimeout(() => {
        setSnackbarVisible(false);
        navigation.getParent()?.navigate('Início' as never);
      }, 850);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível cadastrar o cão agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScreenContainer>
        <IllustratedHeader
          brand={<BrandLogo size="sm" showText={false} />}
          eyebrow="Cadastro"
          title="Cadastrar cão"
          subtitle="Dados básicos para localizar e ajudar."
          illustration={false}
        />

        <FormSection title="1. Fotos">
          <PhotoPickerCard
            title="Fotos do cão"
            helper="Fotos reais ajudam a identificar o cão com segurança."
            images={images}
            onAdd={pickImage}
            onRemove={(index) => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
          />
        </FormSection>

        <FormSection title="2. Informações principais">
          <AppInput
            label="Nome do cão"
            placeholder="Nome desconhecido"
            value={formData.name}
            onChangeText={(name) => setFormData((current) => ({ ...current, name }))}
          />
          <AppInput
            label="Descrição"
            placeholder="Conte onde foi visto, comportamento, riscos e necessidades."
            value={formData.description}
            onChangeText={(description) => setFormData((current) => ({ ...current, description }))}
            error={errors.description}
            multiline
          />
        </FormSection>

        <FormSection title="3. Localização">
          <AppInput
            label="Local aproximado"
            placeholder="Rua, bairro ou ponto de referência"
            value={formData.address}
            onChangeText={(address) => setFormData((current) => ({ ...current, address }))}
          />
          <AppSelect
            label="Estado"
            value={formData.state}
            options={states}
            onChange={(state) => setFormData((current) => ({ ...current, state, city: '' }))}
            error={errors.state}
          />
          <AppSelect
            label="Cidade"
            value={formData.city}
            options={cities}
            loading={locationLoading}
            disabled={!formData.state}
            onChange={(city) => setFormData((current) => ({ ...current, city }))}
            error={errors.city}
          />
          {!!locationError && <Text style={[styles.helper, { color: theme.colors.warning }]}>{locationError}</Text>}
        </FormSection>

        <FormSection title="4. Situação do cão">
          <AppSelect
            label="Status"
            value={formData.status}
            options={statusOptions}
            onChange={(status) => setFormData((current) => ({ ...current, status: status as DogStatus }))}
          />
          <AppSelect
            label="Porte"
            value={formData.size}
            options={sizeOptions}
            onChange={(size) => setFormData((current) => ({ ...current, size: size as DogSize }))}
          />
          <AppSelect
            label="Sexo"
            value={formData.gender}
            options={genderOptions}
            onChange={(gender) => setFormData((current) => ({ ...current, gender: gender as DogGender }))}
          />
          <AppSelect
            label="Idade aproximada"
            value={formData.age_range}
            options={ageOptions}
            onChange={(age_range) => setFormData((current) => ({ ...current, age_range: age_range as DogAgeRange }))}
          />
          <AppSelect
            label="Urgência"
            value={formData.urgency_level}
            options={urgencyOptions}
            onChange={(urgency_level) =>
              setFormData((current) => ({ ...current, urgency_level: urgency_level as UrgencyLevel }))
            }
          />
          <AppInput
            label="Saúde ou cuidados especiais"
            placeholder="Ferimentos, medo, filhotes, medicação..."
            value={formData.health_condition}
            onChangeText={(health_condition) => setFormData((current) => ({ ...current, health_condition }))}
            multiline
          />
        </FormSection>

        <FormSection title="5. Contato responsável">
          <AppInput
            label="Nome do responsável"
            placeholder="Quem deve ser procurado"
            value={formData.contact_name}
            onChangeText={(contact_name) => setFormData((current) => ({ ...current, contact_name }))}
            error={errors.contact_name}
          />
          <AppInput
            label="Contato"
            placeholder="Telefone, e-mail ou Instagram"
            value={formData.contact_info}
            onChangeText={(contact_info) => setFormData((current) => ({ ...current, contact_info }))}
            error={errors.contact_info}
          />
        </FormSection>

        <AppButton title="Salvar cadastro" icon="check-circle" onPress={submit} loading={loading} fullWidth />
      </ScreenContainer>
      <AppSnackbar visible={snackbarVisible} message="Cadastro salvo. Voltando para a Home..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  helper: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
