import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

const officialLogo = require('../../assets/logo/logo-doadog.png');

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  center?: boolean;
}

export function BrandLogo({ size = 'md', showText = true, center = false }: BrandLogoProps) {
  const { theme } = useAppTheme();
  const markSize = size === 'lg' ? 132 : size === 'sm' ? 58 : 82;
  const titleSize = size === 'lg' ? typography.sizes['3xl'] : size === 'sm' ? typography.sizes.lg : typography.sizes['2xl'];

  return (
    <View style={[styles.wrapper, center && styles.center]}>
      <Image
        source={officialLogo}
        resizeMode="contain"
        style={[
          styles.logoImage,
          {
            borderColor: theme.colors.border,
            width: markSize,
            height: markSize,
          },
        ]}
      />
      {showText && (
        <View style={center ? styles.textCenter : styles.textBlock}>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: titleSize }]}>DoaDog</Text>
          {size !== 'sm' && (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Acolha, cuide e transforme.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  center: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoImage: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontWeight: typography.weights.black,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  textCenter: {
    alignItems: 'center',
  },
});

export default BrandLogo;
