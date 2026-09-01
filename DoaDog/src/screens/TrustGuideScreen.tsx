import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppCard from '../components/AppCard';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

const tips: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  {
    icon: 'map-pin',
    title: 'Confirme o local',
    text: 'Combine pontos seguros e evite ir sozinho em resgates.',
  },
  {
    icon: 'message-circle',
    title: 'Fale com o responsável',
    text: 'Use o contato informado para alinhar ajuda, visita ou transporte.',
  },
  {
    icon: 'shield',
    title: 'Apoie com cuidado',
    text: 'O app organiza contatos; confirme dados antes de transferir valores.',
  },
  {
    icon: 'heart',
    title: 'Priorize o cão',
    text: 'Se houver risco imediato, acione ajuda local ou atendimento veterinário.',
  },
];

export default function TrustGuideScreen() {
  const { theme } = useAppTheme();

  return (
    <ScreenContainer>
      <IllustratedHeader
        eyebrow="Segurança"
        title="Contato responsável"
        subtitle="Um checklist curto para agir melhor."
        illustration={false}
      />

      <View style={styles.list}>
        {tips.map((tip) => (
          <AppCard key={tip.title} style={styles.tipCard}>
            <View style={[styles.icon, { backgroundColor: theme.colors.secondarySoft }]}>
              <Feather name={tip.icon} size={18} color={theme.colors.secondary} />
            </View>
            <View style={styles.tipCopy}>
              <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
              <Text style={[styles.tipText, { color: theme.colors.textMuted }]}>{tip.text}</Text>
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  tipCard: {
    alignItems: 'flex-start',
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
  tipCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
