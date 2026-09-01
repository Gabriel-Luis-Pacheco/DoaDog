import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AppCard from '../components/AppCard';
import ScreenContainer from '../components/ScreenContainer';
import { useAppTheme } from '../context/ThemeContext';
import { dogServices } from '../services/api';
import { spacing, typography } from '../theme/theme';
import { Dog } from '../types';

const defaultRegion = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const { theme } = useAppTheme();
  const [region, setRegion] = useState(defaultRegion);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const mappedDogs = dogs.filter(
    (dog) => typeof dog.location?.latitude === 'number' && typeof dog.location?.longitude === 'number'
  );

  useEffect(() => {
    async function load() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const current = await Location.getCurrentPositionAsync({});
        setRegion({
          ...defaultRegion,
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      }
      const { data } = await dogServices.getAllDogs();
      setDogs(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Carregando mapa...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation showsMyLocationButton>
        {mappedDogs.map((dog) =>
          typeof dog.location?.latitude === 'number' && typeof dog.location?.longitude === 'number' ? (
            <Marker
              key={dog.id}
              coordinate={{ latitude: dog.location.latitude, longitude: dog.location.longitude }}
              title={dog.name || 'Nome desconhecido'}
              description={dog.description}
            />
          ) : null
        )}
      </MapView>
      <View style={styles.overlay}>
        <AppCard>
          <Text style={[styles.info, { color: theme.colors.text }]}>
            {mappedDogs.length} cão{mappedDogs.length === 1 ? '' : 'es'} com localização no mapa
          </Text>
          {dogs.length > mappedDogs.length && (
            <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
              Casos sem coordenadas aparecem no feed com cidade e estado.
            </Text>
          )}
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    bottom: spacing.lg,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  info: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  helper: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
  },
});
