import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import AppButton from '../components/AppButton';
import AppIllustration, { IllustrationVariant } from '../components/AppIllustration';
import BrandLogo from '../components/BrandLogo';
import ProgressDots from '../components/ProgressDots';
import ScreenContainer from '../components/ScreenContainer';
import { useAppTheme } from '../context/ThemeContext';
import { motion, radius, spacing, typography } from '../theme/theme';
import { impactLight } from '../utils/haptics';

const ONBOARDING_KEY = '@doadog:onboardingCompleted';

const slides: {
  title: string;
  text: string;
  illustration: IllustrationVariant;
  tone: 'warm' | 'botanical' | 'donation';
}[] = [
  {
    title: 'Acolha, cuide e transforme.',
    text: 'Encontre cães que precisam de uma nova chance e ajude a conectar cuidado, adoção responsável e comunidade.',
    illustration: 'homeHero',
    tone: 'warm',
  },
  {
    title: 'Organize resgates com clareza',
    text: 'Cadastre foto, localização e detalhes para facilitar a ação de voluntários e protetores.',
    illustration: 'registerDog',
    tone: 'botanical',
  },
  {
    title: 'Transforme cuidado em ação',
    text: 'Crie pedidos de ajuda, acompanhe campanhas e apoie ração, tratamento ou lar temporário.',
    illustration: 'help',
    tone: 'donation',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const entrance = useSharedValue(1);
  const artHeight = Math.min(310, Math.max(220, height * 0.39));

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, {
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [entrance, index]);

  const finish = async () => {
    await impactLight();
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onFinish();
  };

  const next = async () => {
    await impactLight();
    if (index === slides.length - 1) {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onFinish();
      return;
    }
    setIndex((current) => current + 1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 18 }],
  }));

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.screen}>
        <View style={styles.top}>
          <BrandLogo size="sm" showText />
          <Pressable onPress={finish} hitSlop={12} style={styles.skipButton}>
            <Text style={[styles.skip, { color: theme.colors.textMuted }]}>Pular</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.artWrap, { height: artHeight }, animatedStyle]}>
          <AppIllustration variant={slide.illustration} style={styles.art} />
        </Animated.View>

        <Animated.View style={[styles.copy, animatedStyle]}>
          <View
            style={[
              styles.step,
              {
                backgroundColor:
                  slide.tone === 'botanical'
                    ? theme.colors.surfaceBotanical
                    : slide.tone === 'donation'
                      ? theme.colors.surfaceWarm
                      : theme.colors.surfaceLilac,
              },
            ]}
          >
            <Text style={[styles.stepText, { color: theme.colors.secondary }]}>0{index + 1} de 03</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{slide.title}</Text>
          <Text style={[styles.text, { color: theme.colors.textMuted }]}>{slide.text}</Text>
        </Animated.View>

        <View style={styles.bottom}>
          <ProgressDots total={slides.length} active={index} />
          <AppButton
            title={index === slides.length - 1 ? 'Entrar no app' : 'Próximo'}
            icon={index === slides.length - 1 ? 'check-circle' : 'arrow-right'}
            onPress={next}
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

export async function hasSeenOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
  skip: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  artWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    maxWidth: 330,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.md,
  },
  step: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    lineHeight: 31,
    maxWidth: 330,
    textAlign: 'center',
  },
  text: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    maxWidth: 324,
    textAlign: 'center',
  },
  bottom: {
    gap: spacing.md,
  },
});

export default OnboardingScreen;
