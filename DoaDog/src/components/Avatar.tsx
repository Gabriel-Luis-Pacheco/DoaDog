import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, typography } from '../theme/theme';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
}

export function Avatar({ name = 'D', uri, size = 48 }: AvatarProps) {
  const { theme } = useAppTheme();
  const letter = name.trim().charAt(0).toUpperCase() || 'D';

  if (uri) {
    return <Image source={{ uri }} style={[styles.avatar, { height: size, width: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.avatar, { height: size, width: size, borderRadius: size / 2, backgroundColor: theme.colors.primarySoft }]}>
      <Text style={[styles.letter, { color: theme.colors.primary, fontSize: Math.max(16, size * 0.42) }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: typography.weights.black,
  },
});

export default Avatar;

