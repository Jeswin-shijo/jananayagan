import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {Team, Volunteer} from '@appTypes/api';
import {toastSuccess} from '@utils/toast';
import {volunteerSchema, VolunteerFormData} from '@utils/validators';
import {MOCK_TEAMS, MOCK_VOLUNTEERS} from '@utils/mockData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#DC2626', '#0891B2', '#D97706'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const TeamScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(MOCK_VOLUNTEERS);
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {control, handleSubmit, reset, formState: {errors}} = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  });

  const handleAddMember = (data: VolunteerFormData) => {
    if (!addMemberTeamId) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newVol: Volunteer = {
        id: Date.now().toString(),
        name: data.name,
        phone: data.phone,
        area: data.area,
        email: data.email ?? '',
        teamId: addMemberTeamId,
        teamRole: 'Member',
        activeComplaints: 0,
        totalResolved: 0,
        isAvailable: true,
        performanceScore: 5.0,
      };
      setVolunteers(prev => [...prev, newVol]);
      setTeams(prev => prev.map(t =>
        t.id === addMemberTeamId
          ? {...t, volunteerIds: [...t.volunteerIds, newVol.id]}
          : t,
      ));
      setIsSubmitting(false);
      setAddMemberTeamId(null);
      reset();
      toastSuccess(t('memberAdded'), data.name);
    }, 900);
  };

  const membersOf = (team: Team) => volunteers.filter(v => team.volunteerIds.includes(v.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('team')} />
      <OfflineBanner />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Add Member button */}
        <TouchableOpacity
          onPress={() => setAddMemberTeamId(teams[0]?.id ?? null)}
          activeOpacity={0.85}
          style={styles.addBtn}>
          <LinearGradient
            colors={['#2563EB', '#06B6D4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.addBtnGradient}>
            <Text style={styles.addBtnText}>{t('addMember')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Teams */}
        {teams.map(team => {
          const members = membersOf(team);
          return (
            <View key={team.id} style={styles.teamSection}>
              <View style={styles.teamLabelRow}>
                <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.primary} />
                <Text style={styles.teamLabelText}>{team.name}</Text>
                <Text style={styles.teamAreaText}>· {team.area}</Text>
                <TouchableOpacity
                  style={styles.addToTeamBtn}
                  onPress={() => setAddMemberTeamId(team.id)}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons name="account-plus-outline" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {members.map(m => {
                const bg = avatarColor(m.name);
                return (
                  <View key={m.id} style={styles.memberCard}>
                    <View style={[styles.memberAvatar, {backgroundColor: bg}]}>
                      <Text style={styles.memberAvatarText}>{m.name.charAt(0)}</Text>
                      {m.isAvailable && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberRole}>
                        {m.teamRole ?? t('member')} · {m.area}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${m.phone}`)}
                      activeOpacity={0.7}>
                      <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {members.length === 0 && (
                <Text style={styles.emptyTeam}>{t('teamNoMembers')}</Text>
              )}
            </View>
          );
        })}

        <View style={{height: Spacing[8]}} />
      </ScrollView>

      {/* Add Member modal */}
      <Modal visible={!!addMemberTeamId} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addMember')}</Text>
            <AppButton
              title={t('cancel')}
              onPress={() => { setAddMemberTeamId(null); reset(); }}
              variant="ghost"
              size="sm"
              fullWidth={false}
            />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {addMemberTeamId && (
                <View style={styles.teamTagRow}>
                  <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.primary} />
                  <Text style={styles.teamTagText}>
                    {t('teamAddingTo')} {teams.find(t => t.id === addMemberTeamId)?.name}
                  </Text>
                </View>
              )}
              <Controller control={control} name="name" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label={t('fullName')} placeholder={t('volunteerNamePlaceholder')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
              )} />
              <Controller control={control} name="phone" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label={t('phoneNumber')} placeholder={t('mobilePlaceholder')} keyboardType="phone-pad" maxLength={10} value={value} onChangeText={v => onChange(v.replace(/\D/g, ''))} onBlur={onBlur} error={errors.phone?.message} />
              )} />
              <Controller control={control} name="area" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label={t('areaWard')} placeholder={t('areaNamePlaceholder')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.area?.message} />
              )} />
              <Controller control={control} name="email" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label={t('emailOptional')} placeholder="email@example.com" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )} />
              <AppButton
                title={isSubmitting ? t('adding') : t('addMember')}
                onPress={handleSubmit(handleAddMember)}
                loading={isSubmitting}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing[4]},

  addBtn: {marginBottom: Spacing[5]},
  addBtnGradient: {borderRadius: BorderRadius['2xl'], overflow: 'hidden', paddingVertical: Spacing[4], alignItems: 'center' as const},
  addBtnText: {color: '#FFFFFF', fontSize: FontSize.base, fontWeight: FontWeight.bold, letterSpacing: 0.3},

  teamSection: {marginBottom: Spacing[5]},
  teamLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  teamLabelText: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary},
  teamAreaText: {fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1},
  addToTeamBtn: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyTeam: {fontSize: FontSize.sm, color: Colors.textDisabled, paddingLeft: Spacing[2], marginBottom: Spacing[2]},

  memberCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    marginBottom: Spacing[3],
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  memberAvatarText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.lg},
  onlineDot: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  memberInfo: {flex: 1},
  memberName: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  memberRole: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2},
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  modal: {flex: 1, backgroundColor: Colors.background},
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  modalTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  modalScroll: {padding: Spacing[4]},
  teamTagRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing[2],
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[4],
  },
  teamTagText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
} as const);
