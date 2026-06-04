import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useAuthStore} from '@store/authStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

interface DrawerHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
  right?: React.ReactNode;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({title, subtitle, showAvatar = true, right}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <MaterialCommunityIcons name="menu" size={24} color={Colors.text} />
      </TouchableOpacity>
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
      {showAvatar && !right && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'P'}</Text>
        </View>
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  title: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  subtitle: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1},
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
