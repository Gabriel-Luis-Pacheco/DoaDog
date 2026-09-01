import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import BrandLogo from '../components/BrandLogo';
import IllustratedHeader from '../components/IllustratedHeader';
import ProfileActionRow from '../components/ProfileActionRow';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { dogServices, donationServices, favoriteServices } from '../services/api';
import { radius, spacing, typography } from '../theme/theme';

const roleLabels: Record<string, string> = {
  adopter: 'Adotante',
  user: 'Adotante',
  volunteer: 'Voluntário',
  ngo: 'ONG/Projeto',
  protector: 'Protetor independente',
  admin: 'Administrador',
  visitor: 'Visitante',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { user, signOut } = useAuth();
  const [activity, setActivity] = useState({ dogs: 0, campaigns: 0, favorites: 0 });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      Promise.all([
        dogServices.getMyDogs(),
        donationServices.getCampaigns(),
        favoriteServices.getDogIds(),
        favoriteServices.getCampaignIds(),
      ]).then(([dogsResult, campaignsResult, dogFavoriteIds, campaignFavoriteIds]) => {
        if (!mounted) return;
        setActivity({
          dogs: dogsResult.data.length,
          campaigns: campaignsResult.data.length,
          favorites: dogFavoriteIds.length + campaignFavoriteIds.length,
        });
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  const logout = () => {
    Alert.alert('Sair', 'Deseja sair da conta salva neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScreenContainer>
      <IllustratedHeader
        brand={<BrandLogo size="sm" showText={false} />}
        eyebrow="Perfil"
        title="Perfil"
        subtitle="Conta, favoritos e ajustes."
        illustration={false}
      />

      {user ? (
        <AppCard style={styles.userCard}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primarySoft }]}>
            <Text style={[styles.avatarLetter, { color: theme.colors.primary }]}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{user.name}</Text>
            <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {user.email}
            </Text>
            <View style={[styles.tag, { backgroundColor: theme.colors.accentSoft }]}>
              <Text style={[styles.tagText, { color: theme.colors.accent }]}>{roleLabels[user.role] || 'Usuário'}</Text>
            </View>
          </View>
        </AppCard>
      ) : (
        <AppCard style={styles.guestCard}>
          <BrandLogo size="sm" showText={false} />
          <View style={styles.guestCopy}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Entre no DoaDog</Text>
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>
              Salve seus dados para preencher cadastros com mais agilidade.
            </Text>
          </View>
          <AppButton title="Fazer login" icon="log-in" onPress={() => navigation.navigate('Login' as never)} fullWidth />
        </AppCard>
      )}

      <ProfileActionsCard
        dogCount={activity.dogs}
        campaignCount={activity.campaigns}
        favoriteCount={activity.favorites}
        isAdmin={user?.role === 'admin'}
      />

      {user && <AppButton title="Sair" icon="log-out" onPress={logout} variant="outline" fullWidth />}
    </ScreenContainer>
  );
}

function ProfileActionsCard({
  dogCount,
  campaignCount,
  favoriteCount,
  isAdmin,
}: {
  dogCount: number;
  campaignCount: number;
  favoriteCount: number;
  isAdmin: boolean;
}) {
  const navigation = useNavigation();

  return (
    <AppCard style={styles.cardGap}>
      <ProfileActionRow
        icon="list"
        title="Meus cadastros"
        subtitle={`${dogCount} casos locais`}
        onPress={() => navigation.navigate('MyDogs' as never)}
      />
      <ProfileActionRow
        icon="heart"
        title="Favoritos"
        subtitle={`${favoriteCount} itens salvos`}
        onPress={() => navigation.navigate('Favorites' as never)}
      />
      <ProfileActionRow
        icon="clipboard"
        title="Solicitações de adoção"
        subtitle="Interesses enviados e recebidos"
        onPress={() => navigation.navigate('AdoptionRequests' as never)}
      />
      <ProfileActionRow
        icon="life-buoy"
        title="Pedidos de apoio"
        subtitle={`${campaignCount} pedidos locais`}
        onPress={() => navigation.navigate('SupportRequests' as never)}
      />
      <ProfileActionRow
        icon="credit-card"
        title="Minhas doações"
        subtitle="PIX gerados com sua conta"
        onPress={() => navigation.navigate('MyDonations' as never)}
      />
      <ProfileActionRow
        icon="briefcase"
        title="Parceiros"
        subtitle="Rede local de apoio"
        onPress={() => navigation.navigate('Partners' as never)}
      />
      {isAdmin && (
        <ProfileActionRow
          icon="shield"
          title="Moderação"
          subtitle="Aprovar cães e campanhas"
          onPress={() => navigation.navigate('AdminModeration' as never)}
        />
      )}
      <ProfileActionRow
        icon="settings"
        title="Preferências"
        subtitle="Tema, região e alertas"
        onPress={() => navigation.navigate('Settings' as never)}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  guestCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  guestCopy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  userCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarLetter: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  description: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  cardGap: {
    gap: spacing.sm,
  },
});
