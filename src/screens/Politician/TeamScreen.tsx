import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {FormModal} from '@components/common/FormModal';
import {MOCK_TEAM, TeamMember} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const TeamScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM);
  const [formVisible, setFormVisible] = useState(false);

  const handleAdd = (values: Record<string, string>) => {
    const newMember: TeamMember = {
      id: `t-${members.length + 1}`,
      name: values.name?.trim() || t('addMember'),
      roleKey: 'coordinator',
      area: values.area?.trim() || t('allWards'),
      phone: values.phone?.trim() || '',
      online: false,
    };
    setMembers(prev => [...prev, newMember]);
    toastSuccess(t('memberAdded'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('team')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppButton title={t('addMember')} onPress={() => setFormVisible(true)} />
        <View style={{height: Spacing[4]}} />
        {members.map(m => (
          <AppCard key={m.id}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
                {m.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.role}>{t(m.roleKey as TranslationKey)} · {m.area}</Text>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => m.phone && Linking.openURL(`tel:${m.phone}`)}>
                <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('addMember')}
        submitLabel={t('addMember')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleAdd}
        fields={[
          {key: 'name', label: t('name'), placeholder: t('name'), required: true},
          {key: 'area', label: t('ward'), placeholder: 'Ward 5'},
          {key: 'phone', label: t('mobileNumber'), placeholder: t('mobilePlaceholder'), keyboardType: 'phone-pad'},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3]},
  avatar: {width: 46, height: 46, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.md},
  onlineDot: {position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surface},
  info: {flex: 1},
  name: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  role: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  callBtn: {width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
} as const);
