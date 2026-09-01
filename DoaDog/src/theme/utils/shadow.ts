import { elevation } from '../elevation';

export function shadow(level: keyof typeof elevation = 'sm') {
  return elevation[level];
}

