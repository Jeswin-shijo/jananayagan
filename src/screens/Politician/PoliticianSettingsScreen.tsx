import React, {useState} from 'react';
import {View, Text, ScrollView, Switch, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useThemeStore} from '@store/themeStore';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const PoliticianSettingsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {isDark, toggleMode} = useThemeStore();
  const [pushEnabled, setPushEnabled] = useState(true);

  const links: {icon: string; label: string}[] = [
    {icon: 'translate', label: t('language')},
    {icon: 'shield-lock-outline', label: t('privacyPolicy')},
    {icon: 'information-outline', label: t('aboutApp')},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('settings')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppCard padding={0}>
          <View style={styles.toggleRow}>
            <View style={styles.bubble}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.label}>{t('darkMode')}</Text>
            <Switch value={isDark} onValueChange={toggleMode} trackColor={{false: Colors.border, true: Colors.primaryLight}} thumbColor={isDark ? Colors.primary : Colors.textDisabled} />
          </View>
          <View style={[styles.toggleRow, styles.divider]}>
            <View style={styles.bubble}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.label}>{t('notifications')}</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{false: Colors.border, true: Colors.primaryLight}} thumbColor={pushEnabled ? Colors.primary : Colors.textDisabled} />
          </View>
        </AppCard>

        <View style={{height: Spacing[3]}} />
        <AppCard padding={0}>
          {links.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.linkRow, i < links.length - 1 && styles.divider]}>
              <View style={styles.bubble}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </AppCard>
        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  toggleRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  linkRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  divider: {borderTopWidth: 1, borderTopColor: Colors.borderLight},
  bubble: {width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3]},
  label: {flex: 1, fontSize: FontSize.base, color: Colors.text},
} as const);
