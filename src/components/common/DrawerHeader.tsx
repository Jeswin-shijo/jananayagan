import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useAuthStore} from '@store/authStore';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

interface DrawerHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
  right?: React.ReactNode;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({title, subtitle, showAvatar = true, right}) => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);

  return (
    <View style={[styles.header, {marginTop: -insets.top, paddingTop: insets.top + Spacing[3]}]}>
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <MaterialCommunityIcons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
      {showAvatar && !right && (
        <TouchableOpacity
          style={styles.avatar}
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate('Profile')}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'P'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Navy.base,
    borderBottomWidth: 1,
    borderBottomColor: Navy.border,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[2],
  },
  titleBlock: {flex: 1},
  title: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFFFFF'},
  subtitle: {fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 1},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.md},
} as const);
