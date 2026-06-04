import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomTabBarProps, BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Tabs shown in the bar (4 + center FAB). Other registered tabs stay reachable via navigation.
const VISIBLE_TABS = ['CommunityFeed', 'MyComplaints', 'Safety', 'Profile'];

type CreateAction = {
  key: string;
  label: string;
  icon: MaterialCommunityIconName;
  tile: keyof AppColors;
  onPress: () => void;
};

const TabButton: React.FC<{
  options: BottomTabNavigationOptions;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
}> = ({options, isFocused, onPress, onLongPress, label, colors, styles}) => {
  const color = isFocused ? colors.primary : colors.textSecondary;
  const icon = options.tabBarIcon?.({focused: isFocused, color, size: 24});
  const badge = options.tabBarBadge;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}>
      <View>
        {icon}
        {badge != null && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={[styles.activeDot, isFocused && styles.activeDotOn]} />
      <Text style={[styles.tabLabel, {color}]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({state, descriptors, navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const navigateToTab = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const navigateToStack = (routeName: string, params?: object) => {
    const parent: any = navigation.getParent?.();
    if (parent) {
      parent.navigate(routeName, params);
      return;
    }
    (navigation as any).navigate(routeName, params);
  };

  const closeAndRun = (action: () => void) => {
    setIsOpen(false);
    requestAnimationFrame(action);
  };

  const actions: CreateAction[] = [
    {
      key: 'complaint',
      label: t('createComplaint'),
      icon: 'alert-circle-outline',
      tile: 'tileAmber',
      onPress: () => navigateToStack('ReportProblem'),
    },
    {
      key: 'petition',
      label: t('createPetition'),
      icon: 'file-sign',
      tile: 'tileBlue',
      onPress: () => navigateToTab('SubmitPetition'),
    },
    {
      key: 'post',
      label: t('createPost'),
      icon: 'plus-box-outline',
      tile: 'tileGreen',
      onPress: () => navigateToStack('CreatePost'),
    },
  ];

  const focusedKey = state.routes[state.index]?.key;

  const renderTab = (route: typeof state.routes[number]) => {
    const {options} = descriptors[route.key];
    const isFocused = route.key === focusedKey;
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : options.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name as never);
      }
    };

    const onLongPress = () => {
      navigation.emit({type: 'tabLongPress', target: route.key});
    };

    return (
      <TabButton
        key={route.key}
        options={options}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
        label={label as string}
        colors={Colors}
        styles={styles}
      />
    );
  };

  // Only these tabs are shown in the bar (others stay registered but reachable via navigation).
  const orderedVisible = VISIBLE_TABS
    .map(name => state.routes.find(r => r.name === name))
    .filter((r): r is typeof state.routes[number] => Boolean(r));
  const mid = Math.ceil(orderedVisible.length / 2);
  const leftRoutes = orderedVisible.slice(0, mid);
  const rightRoutes = orderedVisible.slice(mid);

  return (
    <View pointerEvents="box-none" style={[styles.root, {paddingBottom: Math.max(insets.bottom, Spacing[3])}]}>
      {isOpen && <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />}

      {isOpen && (
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.duration(120)}
          style={styles.menu}>
          {actions.map(action => (
            <Pressable key={action.key} style={styles.actionRow} onPress={() => closeAndRun(action.onPress)}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <View style={[styles.actionIcon, {backgroundColor: Colors[action.tile]}]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={Colors.primary} />
              </View>
            </Pressable>
          ))}
        </Animated.View>
      )}

      <View style={styles.bar}>
        {leftRoutes.map(route => renderTab(route))}
        <View style={styles.centerSlot} />
        {rightRoutes.map(route => renderTab(route))}
      </View>

      <Animated.View style={[styles.fabWrap, animatedStyle]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('create')}
          style={styles.fab}
          onPress={() => setIsOpen(v => !v)}
          onPressIn={() => {
            scale.value = withSpring(0.92, {damping: 16, stiffness: 260});
          }}
          onPressOut={() => {
            scale.value = withSpring(1, {damping: 14, stiffness: 220});
          }}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary, Colors.secondary]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <MaterialCommunityIcons name={isOpen ? 'close' : 'plus'} size={28} color={Colors.textOnPrimary} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  root: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    left: -Spacing[4],
    right: -Spacing[4],
    bottom: 0,
    top: -1000,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  centerSlot: {width: 64},
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[2],
    paddingBottom: Spacing[1],
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: BorderRadius.full,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  activeDotOn: {backgroundColor: Colors.primary},
  tabLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
    marginTop: 1,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  tabBadgeText: {color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold},
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    top: -24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 10,
  },
  menu: {
    position: 'absolute',
    right: Spacing[4],
    bottom: 92,
    gap: Spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing[2],
  },
  actionLabel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
} as const);
