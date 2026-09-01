import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/theme';

export type IllustrationVariant =
  | 'homeHero'
  | 'emptyDogs'
  | 'registerDog'
  | 'help'
  | 'profile';

const sources: Record<IllustrationVariant, ImageSourcePropType> = {
  homeHero: require('../../assets/illustrations/home-hero.png'),
  emptyDogs: require('../../assets/illustrations/empty-state-dogs.png'),
  registerDog: require('../../assets/illustrations/register-dog.png'),
  help: require('../../assets/illustrations/help.png'),
  profile: require('../../assets/illustrations/profile.png'),
};

interface AppIllustrationProps {
  variant: IllustrationVariant;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppIllustration({ variant, compact, style }: AppIllustrationProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          padding: compact ? spacing.xs : spacing.sm,
        },
        style,
      ]}
    >
      <Image source={sources[variant]} resizeMode="contain" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    aspectRatio: 1.18,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});

export default AppIllustration;
