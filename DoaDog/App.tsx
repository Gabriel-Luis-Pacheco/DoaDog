import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { makeNavigationTheme, typography } from './src/theme/theme';
import FloatingTabBar from './src/components/FloatingTabBar';
import BrandLogo from './src/components/BrandLogo';

import HomeScreen from './src/screens/HomeScreen';
import RegisterDogScreen from './src/screens/RegisterDogScreen';
import DogDetailScreen from './src/screens/DogDetailScreen';
import HelpScreen from './src/screens/HelpScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MyDogsScreen from './src/screens/MyDogsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SupportRequestsScreen from './src/screens/SupportRequestsScreen';
import AdoptionRequestsScreen from './src/screens/AdoptionRequestsScreen';
import MyDonationsScreen from './src/screens/MyDonationsScreen';
import TrustGuideScreen from './src/screens/TrustGuideScreen';
import PartnersScreen from './src/screens/PartnersScreen';
import AdminModerationScreen from './src/screens/AdminModerationScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MapScreen from './src/screens/MapScreen';
import OnboardingScreen, { hasSeenOnboarding } from './src/screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AuthStack() {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <ProfileScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function useHeaderOptions() {
  const { theme } = useAppTheme();
  return {
    headerStyle: {
      backgroundColor: theme.colors.surface,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontWeight: typography.weights.black,
      fontSize: typography.sizes.lg,
    },
  } as const;
}

function HomeStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Início' }} />
      <Stack.Screen name="AdminModeration" component={AdminModerationScreen} options={{ title: 'Moderação' }} />
      <Stack.Screen name="DogDetail" component={DogDetailScreen} options={{ title: 'Detalhes do cão' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}

function RegisterStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="RegisterDogMain" component={RegisterDogScreen} options={{ title: 'Cadastrar cão' }} />
    </Stack.Navigator>
  );
}

function ProtectedRegisterStack() {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return <RegisterStack />;
}

function DonationsStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="DonationsMain" component={HelpScreen} options={{ title: 'Ajuda' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator initialRouteName="ProfileMain" screenOptions={headerOptions}>
      <Stack.Screen name="Partners" component={PartnersScreen} options={{ title: 'Parceiros' }} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Preferências' }} />
      <Stack.Screen name="MyDogs" component={MyDogsScreen} options={{ title: 'Meus cadastros' }} />
      <Stack.Screen name="AdoptionRequests" component={AdoptionRequestsScreen} options={{ title: 'Solicitações' }} />
      <Stack.Screen name="MyDonations" component={MyDonationsScreen} options={{ title: 'Minhas doações' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Stack.Screen name="SupportRequests" component={SupportRequestsScreen} options={{ title: 'Pedidos de apoio' }} />
      <Stack.Screen name="TrustGuide" component={TrustGuideScreen} options={{ title: 'Segurança' }} />
      <Stack.Screen name="DogDetail" component={DogDetailScreen} options={{ title: 'Detalhes do cão' }} />
      <Stack.Screen name="Login" component={AuthStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textSoft,
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.bold,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Início" component={HomeStack} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Cadastrar" component={ProtectedRegisterStack} options={{ tabBarLabel: 'Cadastrar' }} />
      <Tab.Screen name="Doações" component={DonationsStack} options={{ tabBarLabel: 'Ajuda' }} />
      <Tab.Screen name="Perfil" component={ProfileStack} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

function AppShell() {
  const { theme, resolvedMode } = useAppTheme();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    hasSeenOnboarding()
      .then((seen) => setShowOnboarding(!seen))
      .finally(() => setCheckingOnboarding(false));
  }, []);

  if (checkingOnboarding) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <BrandLogo size="lg" showText center />
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
        <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <NavigationContainer theme={makeNavigationTheme(theme)}>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    alignItems: 'center',
    flex: 1,
    gap: 18,
    justifyContent: 'center',
  },
});
