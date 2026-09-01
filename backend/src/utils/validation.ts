import { z } from 'zod';

export function enumValue<T extends Record<string, string>>(enumObject: T) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    return value.trim().toUpperCase();
  }, z.nativeEnum(enumObject));
}

export function optionalTrimmed(max = 255) {
  return z.string().trim().max(max).optional();
}
