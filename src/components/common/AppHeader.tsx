import React from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing} from '@constants/spacing';
import {HEADER_HEIGHT} from '@constants/dimensions';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBackPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({title, showBack = false, rightAction, onBackPress}) => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, {marginTop: -insets.top, paddingTop: insets.top, height: HEADER_HEIGHT + insets.top}]}>
      <LinearGradient
        colors={[Navy.surface, Navy.base]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{rightAction}</View>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Navy.border,
    overflow: 'hidden',
  },
  left: {width: 44},
  right: {width: 44, alignItems: 'flex-end'},
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
} as const);
