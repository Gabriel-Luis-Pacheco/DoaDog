import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

async function canUseSecureStore() {
  if (Platform.OS === 'web') return false;

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getItem(key: string) {
  return AsyncStorage.getItem(key);
}

export async function setItem(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function removeItem(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function getSensitiveItem(key: string) {
  if (await canUseSecureStore()) {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue !== null) return secureValue;
  }

  return AsyncStorage.getItem(key);
}

export async function setSensitiveItem(key: string, value: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.removeItem(key);
    return;
  }

  await AsyncStorage.setItem(key, value);
}

export async function removeSensitiveItem(key: string) {
  await AsyncStorage.removeItem(key);

  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
  }
}

