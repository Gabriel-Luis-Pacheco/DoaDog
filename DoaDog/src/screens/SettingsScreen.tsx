import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppCard from '../components/AppCard';
import AppSelect from '../components/AppSelect';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import SettingRow from '../components/SettingRow';
import ThemeToggle from '../components/ThemeToggle';
import { useAppTheme } from '../context/ThemeContext';
import { useBrazilLocations } from '../hooks/useBrazilLocations';
import { preferenceServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';
import { AppPreferences } from '../types';

const emptyPreferences: AppPreferences = {
  urgentAlerts: true,
  preferredState: '',
  preferredCity: '',
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const [preferences, setPreferences] = useState<AppPreferences>(emptyPreferences);
  const { states, cities, loadingCities, locationError } = useBrazilLocations(preferences.preferredState);

  useEffect(() => {
    let mounted = true;
    preferenceServices.getPreferences().then(({ data }) => {
      if (mounted) setPreferences(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updatePreferences = async (updates: Partial<AppPreferences>) => {
    const { data } = await preferenceServices.updatePreferences(updates);
    setPreferences(data);
  };

  return (
    <ScreenContainer>
      <IllustratedHeader eyebrow="Ajustes" title="Preferências" subtitle="Configurações salvas neste aparelho." illustration={false} />

      <AppCard style={styles.cardGap}>
        <SectionHeader title="Tema" />
        <ThemeToggle />
      </AppCard>

      <AppCard style={styles.cardGap}>
        <SectionHeader title="Região principal" />
        <AppSelect
          label="Estado"
          value={preferences.preferredState}
          options={states}
          onChange={(preferredState) => updatePreferences({ preferredState, preferredCity: '' })}
        />
        <AppSelect
          label="Cidade"
          value={preferences.preferredCity}
          options={cities}
          loading={loadingCities}
          disabled={!preferences.preferredState}
          onChange={(preferredCity) => updatePreferences({ preferredCity })}
        />
        {!!locationError && <Text style={[styles.helper, { color: theme.colors.warning }]}>{locationError}</Text>}
      </AppCard>

      <AppCard style={styles.cardGap}>
        <SectionHeader title="Alertas" />
        <View style={[styles.switchRow, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.icon, { backgroundColor: theme.colors.secondarySoft }]}>
            <Feather name="bell" size={18} color={theme.colors.secondary} />
          </View>
          <View style={styles.switchCopy}>
            <Text style={[styles.switchTitle, { color: theme.colors.text }]}>Casos urgentes</Text>
            <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>Destacar emergências nas listas.</Text>
          </View>
          <Switch
            value={preferences.urgentAlerts}
            onValueChange={(urgentAlerts) => updatePreferences({ urgentAlerts })}
            trackColor={{ false: theme.colors.border, true: theme.colors.secondarySoft }}
            thumbColor={preferences.urgentAlerts ? theme.colors.secondary : theme.colors.surfaceElevated}
          />
        </View>
        <SettingRow
          icon="shield"
          title="Segurança e confiança"
          subtitle="Checklist de contato responsável"
          onPress={() => navigation.navigate('TrustGuide' as never)}
        />
      </AppCard>

      <AppCard style={styles.versionCard}>
        <Text style={[styles.version, { color: theme.colors.text }]}>DoaDog v1.0.0</Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  switchRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
    padding: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  switchCopy: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  switchText: {
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  helper: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
  versionCard: {
    alignItems: 'center',
  },
  version: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
