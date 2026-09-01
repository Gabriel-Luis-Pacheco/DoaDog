import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import BrandLogo from '../components/BrandLogo';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';
import { cleanText } from '../utils/sanitize';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn } = useAuth();
  const { theme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedEmail = cleanText(email).toLowerCase();

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) nextErrors.email = 'Informe um e-mail válido.';
    if (password.length < 6) nextErrors.password = 'Informe uma senha com pelo menos 6 caracteres.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await signIn(normalizedEmail, password);
      if (error) Alert.alert('Erro ao entrar', error.message || 'Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScreenContainer contentContainerStyle={styles.content}>
        <IllustratedHeader
          brand={<BrandLogo size="sm" showText={false} />}
          eyebrow="DoaDog"
          title="Entre na sua rede de cuidado"
          subtitle="Acompanhe casos, pedidos e contatos salvos neste aparelho."
          illustration={false}
        />
        <AppCard style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Entrar no DoaDog</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Acesse para registrar casos, acompanhar pedidos e manter sua rede de cuidado organizada.
          </Text>
          <AppInput
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />
          <AppButton title="Entrar" icon="log-in" onPress={submit} loading={loading} fullWidth />
        </AppCard>
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.register}>
          <Text style={[styles.registerText, { color: theme.colors.textMuted }]}>Ainda não tem conta? </Text>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Criar conta</Text>
        </Pressable>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
  },
  link: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  register: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
  },
  registerText: {
    fontSize: typography.sizes.md,
  },
});
