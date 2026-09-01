import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { motion, radius, shadows, spacing, typography } from '../theme/theme';
import { impactLight } from '../utils/haptics';

function TabGlyph({ routeName, active }: { routeName: string; active: boolean }) {
  const { theme } = useAppTheme();
  const color = active ? theme.colors.white : theme.colors.textMuted;
  const icon = routeName === 'Cadastrar' ? 'plus' : routeName === 'Doações' ? 'heart' : routeName === 'Perfil' ? 'user' : 'home';
  return <Feather name={icon as any} size={active ? 20 : 18} color={color} />;
}

interface TabButtonProps {
  route: BottomTabBarProps['state']['routes'][number];
  descriptor: any;
  navigation: BottomTabBarProps['navigation'];
  state: BottomTabBarProps['state'];
}

function TabButton({ route, descriptor, navigation, state }: TabButtonProps) {
  const { theme } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const index = state.routes.findIndex((item) => item.key === route.key);
  const active = state.index === index;
  const label =
    descriptor.options.tabBarLabel !== undefined
      ? descriptor.options.tabBarLabel
      : descriptor.options.title !== undefined
        ? descriptor.options.title
        : route.name;

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!active && !event.defaultPrevented) {
      impactLight();
      navigation.navigate(route.name);
    }
  };

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={styles.tabPressable}>
      <Animated.View
        style={[
          styles.tabItem,
          {
            backgroundColor: active ? theme.colors.secondary : 'transparent',
            transform: [{ scale }],
          },
        ]}
      >
        <TabGlyph routeName={route.name} active={active} />
        <Text style={[styles.tabLabel, { color: active ? theme.colors.white : theme.colors.textMuted }]} numberOfLines={1}>
          {String(label)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar(props: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.tab, borderColor: theme.colors.border }, shadows.soft]}>
        {props.state.routes.map((route) => (
          <TabButton
            key={route.key}
            route={route}
            state={props.state}
            navigation={props.navigation}
            descriptor={props.descriptors[route.key]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
  },
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  tabPressable: {
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: radius.full,
    gap: spacing.xs,
    minHeight: 48,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
});

export default FloatingTabBar;
