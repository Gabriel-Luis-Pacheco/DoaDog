import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import AppSelect, { SelectOption } from '../components/AppSelect';
import BrandLogo from '../components/BrandLogo';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useBrazilLocations } from '../hooks/useBrazilLocations';
import { radius, spacing, typography } from '../theme/theme';
import { UserRole } from '../types';
import { cleanContact, cleanText } from '../utils/sanitize';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const userTypes: SelectOption[] = [
  { label: 'Adotante', value: 'adopter' },
  { label: 'ONG/Projeto', value: 'ngo' },
  { label: 'Protetor independente', value: 'protector' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signUp } = useAuth();
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'adopter' as UserRole,
    state: '',
    city: '',
  });
  const { states, cities, loadingCities, locationError } = useBrazilLocations(formData.state);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!cleanText(formData.name)) nextErrors.name = 'Informe seu nome completo.';
    if (!/\S+@\S+\.\S+/.test(cleanText(formData.email))) nextErrors.email = 'Informe um e-mail válido.';
    if (formData.password.length < 8) nextErrors.password = 'A senha deve ter pelo menos 8 caracteres.';
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'As senhas não coincidem.';
    if (!formData.state) nextErrors.state = 'Selecione seu estado.';
    if (!formData.city) nextErrors.city = 'Selecione sua cidade.';
    if (!acceptedTerms) nextErrors.terms = 'Você precisa aceitar os termos para criar a conta.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await signUp(cleanText(formData.email).toLowerCase(), formData.password, {
        name: cleanText(formData.name, 120),
        phone: cleanContact(formData.phone) || undefined,
        role: formData.role,
        city: cleanText(formData.city),
        state: cleanText(formData.state),
      });

      if (error) {
        Alert.alert('Erro no cadastro', error.message || 'Não foi possível criar sua conta.');
      } else {
        Alert.alert('Conta criada', 'Seu perfil DoaDog foi salvo e voce ja esta conectado.', [{ text: 'Continuar' }]);
      }
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
          title="Crie seu perfil de cuidado"
          subtitle="Cidade, contato e tipo de atuação ajudam a organizar casos reais."
          illustration={false}
        />
        <AppCard style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Salve seu perfil para cadastrar casos, apoiar adoções e acompanhar cães da sua região.
          </Text>

          <AppInput
            label="Nome completo"
            placeholder="Seu nome"
            value={formData.name}
            error={errors.name}
            onChangeText={(name) => setFormData((current) => ({ ...current, name }))}
          />
          <AppInput
            label="E-mail"
            placeholder="seu@email.com"
            value={formData.email}
            error={errors.email}
            onChangeText={(email) => setFormData((current) => ({ ...current, email }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Senha"
            placeholder="Minimo 8 caracteres"
            value={formData.password}
            error={errors.password}
            onChangeText={(password) => setFormData((current) => ({ ...current, password }))}
            secureTextEntry
          />
          <AppInput
            label="Confirmar senha"
            placeholder="Repita sua senha"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            onChangeText={(confirmPassword) => setFormData((current) => ({ ...current, confirmPassword }))}
            secureTextEntry
          />
          <AppInput
            label="Telefone (opcional)"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChangeText={(phone) => setFormData((current) => ({ ...current, phone }))}
            keyboardType="phone-pad"
          />
          <AppSelect
            label="Tipo de usuário"
            value={formData.role}
            options={userTypes}
            onChange={(role) => setFormData((current) => ({ ...current, role: role as UserRole }))}
          />
          <AppSelect
            label="Estado"
            value={formData.state}
            options={states}
            error={errors.state}
            onChange={(state) => setFormData((current) => ({ ...current, state, city: '' }))}
          />
          <AppSelect
            label="Cidade"
            value={formData.city}
            options={cities}
            loading={loadingCities}
            disabled={!formData.state}
            error={errors.city}
            onChange={(city) => setFormData((current) => ({ ...current, city }))}
          />
          {!!locationError && <Text style={[styles.helper, { color: theme.colors.warning }]}>{locationError}</Text>}

          <Pressable onPress={() => setAcceptedTerms((current) => !current)} style={styles.termsRow}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptedTerms ? theme.colors.primary : 'transparent',
                  borderColor: acceptedTerms ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              {acceptedTerms && <Feather name="check" size={15} color={theme.colors.white} />}
            </View>
            <Text style={[styles.terms, { color: theme.colors.textMuted }]}>
              Aceito os termos de uso e a política de privacidade
            </Text>
          </Pressable>
          {!!errors.terms && <Text style={[styles.helper, { color: theme.colors.danger }]}>{errors.terms}</Text>}

          <AppButton title="Criar conta" icon="user-plus" onPress={submit} loading={loading} fullWidth />

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: theme.colors.primary }]}>Já tenho uma conta</Text>
          </Pressable>
        </AppCard>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  helper: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  terms: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  loginLink: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
