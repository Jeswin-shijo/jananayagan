import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type CreateAction = {
  key: string;
  label: string;
  icon: MaterialCommunityIconName;
  color: string;
  onPress: () => void;
};

export const CitizenCreateFab: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const getRouteNames = () => navigation.getState?.().routeNames ?? [];

  // The citizen tab bar (FloatingTabBar) already exposes a center create button, and
  // the volunteer Community tab has its own create affordance. Both tab shells contain
  // a "Dashboard" route, so we hide this floating bottom-right FAB whenever one is present.
  const isWithinCitizenTabs = () => {
    let nav: any = navigation;
    while (nav) {
      const routeNames = nav.getState?.()?.routeNames;
      if (Array.isArray(routeNames) && routeNames.includes('Dashboard')) {
        return true;
      }
      nav = nav.getParent?.();
    }
    return false;
  };

  const navigateToStack = (routeName: string, params?: object) => {
    const routeNames = getRouteNames();
    if (routeNames.includes(routeName)) {
      navigation.navigate(routeName, params);
      return;
    }
    navigation.getParent?.()?.navigate(routeName, params);
  };

  const navigateToTab = (screen: string, params?: object) => {
    const routeNames = getRouteNames();
    if (routeNames.includes(screen)) {
      navigation.navigate(screen, params);
      return;
    }
    navigateToStack('CitizenTabs', {screen, params});
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
      color: Colors.warningLight,
      onPress: () => navigateToStack('ReportProblem'),
    },
    {
      key: 'petition',
      label: t('createPetition'),
      icon: 'file-sign',
      color: Colors.primaryLight,
      onPress: () => navigateToTab('SubmitPetition', {mode: 'create'}),
    },
    {
      key: 'post',
      label: t('createPost'),
      icon: 'plus-box-outline',
      color: Colors.secondaryLight,
      onPress: () => navigateToStack('CreatePost'),
    },
  ];

  if (isWithinCitizenTabs()) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
      )}
      <View pointerEvents="box-none" style={styles.fabGroup}>
        {isOpen && (
          <Animated.View entering={FadeInDown.springify()} exiting={FadeOutDown.duration(120)} style={styles.menu}>
            {actions.map(action => (
              <Pressable
                key={action.key}
                style={styles.actionRow}
                onPress={() => closeAndRun(action.onPress)}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <View style={[styles.actionIcon, {backgroundColor: action.color}]}>
                  <MaterialCommunityIcons name={action.icon} size={22} color={Colors.primary} />
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}
        <Animated.View style={animatedStyle}>
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
            <MaterialCommunityIcons name={isOpen ? 'close' : 'plus'} size={30} color={Colors.textOnPrimary} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fabGroup: {
    position: 'absolute',
    right: Spacing[4],
    bottom: Spacing[10],
    alignItems: 'flex-end',
  },
  menu: {
    marginBottom: Spacing[3],
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
  fab: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
} as const);
