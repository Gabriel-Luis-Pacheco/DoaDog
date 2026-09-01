import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/theme';

const placeholder = require('../../assets/placeholders/dog-placeholder.png');

interface DogPhotoProps {
  uri?: string;
  height?: number;
  badge?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function DogPhoto({ uri, height = 180, badge, style }: DogPhotoProps) {
  const { theme } = useAppTheme();
  const source: ImageSourcePropType = uri ? { uri } : placeholder;

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: uri ? theme.colors.surface : theme.colors.surfaceWarm,
          borderColor: theme.colors.border,
          height,
        },
        style,
      ]}
    >
      <Image source={source} resizeMode={uri ? 'cover' : 'contain'} style={[styles.image, !uri && styles.placeholder]} />
      {!!badge && <View style={styles.badge}>{badge}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignSelf: 'center',
    height: '72%',
    marginTop: spacing.lg,
    width: '72%',
  },
  badge: {
    left: spacing.sm,
    position: 'absolute',
    top: spacing.sm,
  },
});

export default DogPhoto;
