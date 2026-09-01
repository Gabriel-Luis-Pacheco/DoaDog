export * from './index';

import { makeNavigationTheme, themes, urgencyColors } from './colors';
import { motion } from './motion';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';
import { elevation } from './elevation';
import { zIndex } from './zIndex';

export type { AppTheme } from './colors';
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export default {
  themes,
  spacing,
  radius,
  typography,
  shadows,
  elevation,
  zIndex,
  motion,
  makeNavigationTheme,
  urgencyColors,
};
