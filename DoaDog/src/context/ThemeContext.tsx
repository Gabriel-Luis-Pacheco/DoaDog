import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, ResolvedTheme, ThemeMode, themes } from '../theme/theme';

const THEME_STORAGE_KEY = '@doadog:theme';

interface ThemeContextData {
  mode: ThemeMode;
  resolvedMode: ResolvedTheme;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setModeState(storedMode);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const resolvedMode: ResolvedTheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const toggleTheme = async () => {
    await setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      theme: themes[resolvedMode],
      setMode,
      toggleTheme,
    }),
    [mode, resolvedMode]
  );

  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context.theme) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
