import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {Team, Volunteer} from '@appTypes/api';
import {toastSuccess} from '@utils/toast';
import {volunteerSchema, VolunteerFormData} from '@utils/validators';
import {MOCK_TEAMS, MOCK_VOLUNTEERS} from '@utils/mockData';
import {MOCK_TASKS} from '@utils/volunteerData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MCIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TEAM_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];
const teamColor = (idx: number) => TEAM_COLORS[idx % TEAM_COLORS.length];

const PRIORITY_COLOR: Record<string, string> = {high: '#EF4444', medium: '#F59E0B', low: '#22C55E'};

export const VolunteerManagementScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(MOCK_VOLUNTEERS);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Add Team modal
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamArea, setNewTeamArea] = useState('');

  // Add Member modal
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign Task modal
  const [assignTeamId, setAssignTeamId] = useState<string | null>(null);

  const {control, handleSubmit, reset, formState: {errors}} = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  });

  const handleAddTeam = () => {
    if (!newTeamName.trim() || !newTeamArea.trim()) return;
    const team: Team = {
      id: `t${Date.now()}`,
      name: newTeamName.trim(),
      area: newTeamArea.trim(),
      volunteerIds: [],
      activeTasks: 0,
      completedTasks: 0,
    };
    setTeams(prev => [...prev, team]);
    setNewTeamName('');
    setNewTeamArea('');
    setShowAddTeam(false);
    toastSuccess(t('vmTeamCreated'), team.name);
  };

  const handleAddMember = async (data: VolunteerFormData) => {
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
      toastSuccess(t('volunteerAdded'), data.name);
    }, 1000);
  };

  const teamTasks = (teamId: string) => MOCK_TASKS.filter(tk => tk.teamId === teamId);
  const teamMembers = (team: Team) => volunteers.filter(v => team.volunteerIds.includes(v.id));

  const totalVolunteers = teams.reduce((s, t) => s + t.volunteerIds.length, 0);
  const totalActive = teams.reduce((s, t) => s + t.activeTasks, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('volunteerManagement')} />
      <OfflineBanner />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Summary strip */}
        <View style={styles.summaryRow}>
          {[
            {icon: 'account-group-outline' as MCIcon, value: teams.length, label: t('vmTeams')},
            {icon: 'account-outline' as MCIcon, value: totalVolunteers, label: t('vmMembers')},
            {icon: 'clipboard-list-outline' as MCIcon, value: totalActive, label: t('vmActiveTasks')},
          ].map(s => (
            <View key={s.label} style={styles.summaryCard}>
              <MaterialCommunityIcons name={s.icon} size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Teams */}
        {teams.length === 0 ? (
          <AppEmptyState icon="account-group-outline" title={t('vmNoTeams')} subtitle={t('vmNoTeamsSubtitle')} ctaLabel={t('vmCreateTeam')} onCTAPress={() => setShowAddTeam(true)} />
        ) : (
          teams.map((team, idx) => {
            const color = teamColor(idx);
            const members = teamMembers(team);
            const tasks = teamTasks(team.id);
            const isExpanded = expandedTeam === team.id;

            return (
              <View key={team.id} style={styles.teamCard}>
                {/* Team header */}
                <TouchableOpacity
                  style={styles.teamHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedTeam(isExpanded ? null : team.id)}>
                  <View style={[styles.teamAvatar, {backgroundColor: color + '20', borderColor: color + '40'}]}>
                    <Text style={[styles.teamAvatarText, {color}]}>{team.name.charAt(5)}</Text>
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.teamMetaRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={12} color={Colors.textSecondary} />
                      <Text style={styles.teamArea}>{team.area}</Text>
                    </View>
                  </View>
                  <View style={styles.teamChips}>
                    <View style={[styles.chip, {backgroundColor: Colors.primaryLight}]}>
                      <MaterialCommunityIcons name="account-outline" size={11} color={Colors.primary} />
                      <Text style={[styles.chipText, {color: Colors.primary}]}>{members.length}</Text>
                    </View>
                    <View style={[styles.chip, {backgroundColor: Colors.warningLight}]}>
                      <MaterialCommunityIcons name="clipboard-list-outline" size={11} color={Colors.warning} />
                      <Text style={[styles.chipText, {color: Colors.warning}]}>{team.activeTasks}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Colors.textDisabled}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded: members + tasks */}
                {isExpanded && (
                  <View style={styles.expandedBody}>
                    {/* Members */}
                    <Text style={styles.sectionLabel}>{t('vmMembersLabel')}</Text>
                    {members.length === 0 ? (
                      <Text style={styles.emptyText}>{t('vmNoMembers')}</Text>
                    ) : (
                      members.map(v => (
                        <View key={v.id} style={styles.memberRow}>
                          <View style={[styles.memberAvatar, {backgroundColor: color + '20'}]}>
                            <Text style={[styles.memberAvatarText, {color}]}>{v.name.charAt(0)}</Text>
                          </View>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{v.name}</Text>
                            <Text style={styles.memberMeta}>{v.phone} · {v.area}</Text>
                          </View>
                          <View style={[
                            styles.availBadge,
                            {backgroundColor: v.isAvailable ? Colors.successLight : Colors.dangerLight},
                          ]}>
                            <Text style={[
                              styles.availText,
                              {color: v.isAvailable ? Colors.success : Colors.danger},
                            ]}>
                              {v.isAvailable ? t('available') : t('busy')}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}

                    {/* Assigned tasks */}
                    {tasks.length > 0 && (
                      <>
                        <Text style={[styles.sectionLabel, {marginTop: Spacing[4]}]}>{t('vmAssignedTasks')}</Text>
                        {tasks.map(tk => (
                          <View key={tk.id} style={styles.taskRow}>
                            <View style={[styles.priorityDot, {backgroundColor: PRIORITY_COLOR[tk.priority]}]} />
                            <View style={styles.taskInfo}>
                              <Text style={styles.taskTitle} numberOfLines={1}>{tk.title}</Text>
                              <Text style={styles.taskMeta}>{tk.ticketId} · {tk.ward} · {tk.ago} ago</Text>
                            </View>
                            <View style={[styles.statusPill, {
                              backgroundColor: tk.status === 'done' ? Colors.successLight : tk.status === 'in_progress' ? Colors.warningLight : Colors.tileBlue,
                            }]}>
                              <Text style={[styles.statusText, {
                                color: tk.status === 'done' ? Colors.success : tk.status === 'in_progress' ? Colors.warning : Colors.info,
                              }]}>
                                {tk.status === 'done' ? t('done') : tk.status === 'in_progress' ? t('inProgress') : t('assigned')}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    )}

                    {/* Actions */}
                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, {borderColor: Colors.border, flex: 1}]}
                        onPress={() => { setAddMemberTeamId(team.id); }}
                        activeOpacity={0.7}>
                        <MaterialCommunityIcons name="account-plus-outline" size={16} color={Colors.primary} />
                        <Text style={[styles.actionBtnText, {color: Colors.primary}]}>{t('addMember')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: Colors.primary, flex: 1}]}
                        onPress={() => setAssignTeamId(team.id)}
                        activeOpacity={0.7}>
                        <MaterialCommunityIcons name="clipboard-plus-outline" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionBtnText, {color: '#FFFFFF'}]}>{t('vmAssignTask')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{height: Spacing[10]}} />
      </ScrollView>

      {/* Create Team FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddTeam(true)}
        activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>{t('vmNewTeam')}</Text>
      </TouchableOpacity>

      {/* Add Team Modal */}
      <Modal visible={showAddTeam} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('vmCreateTeam')}</Text>
            <Text style={styles.fieldLabel}>{t('vmTeamName')}</Text>
            <TextInput
              style={styles.textInput}
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder={t('vmTeamNamePlaceholder')}
              placeholderTextColor={Colors.textDisabled}
            />
            <Text style={styles.fieldLabel}>{t('vmAreaWard')}</Text>
            <TextInput
              style={styles.textInput}
              value={newTeamArea}
              onChangeText={setNewTeamArea}
              placeholder={t('vmAreaWardPlaceholder')}
              placeholderTextColor={Colors.textDisabled}
            />
            <View style={styles.sheetActions}>
              <AppButton title={t('cancel')} variant="ghost" onPress={() => setShowAddTeam(false)} fullWidth={false} style={styles.halfBtn} />
              <AppButton title={t('create')} onPress={handleAddTeam} fullWidth={false} style={styles.halfBtn} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal visible={!!addMemberTeamId} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addMember')}</Text>
            <AppButton title={t('cancel')} onPress={() => { setAddMemberTeamId(null); reset(); }} variant="ghost" size="sm" fullWidth={false} />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {addMemberTeamId && (
                <View style={styles.teamTagRow}>
                  <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.primary} />
                  <Text style={styles.teamTagText}>
                    {t('vmAddingTo')} {teams.find(t => t.id === addMemberTeamId)?.name}
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
              <AppButton title={isSubmitting ? t('adding') : t('vmAddToTeam')} onPress={handleSubmit(handleAddMember)} loading={isSubmitting} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Assign Task Modal */}
      <Modal visible={!!assignTeamId} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {t('vmAssignTask')} — {teams.find(t => t.id === assignTeamId)?.name}
            </Text>
            <Text style={styles.assignInfo}>{t('vmAvailableComplaints')}</Text>
            <ScrollView style={{maxHeight: 280}} showsVerticalScrollIndicator={false}>
              {[
                {id: 'c1', ticket: 'JAN-002310', title: 'Drainage blockage on Ring Road', ward: 'Ward 5', priority: 'high'},
                {id: 'c2', ticket: 'JAN-002308', title: 'Missing manhole cover near hospital', ward: 'Ward 8', priority: 'high'},
                {id: 'c3', ticket: 'JAN-002305', title: 'Illegal dumping in park area', ward: 'Ward 3', priority: 'medium'},
              ].map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.assignRow}
                  onPress={() => {
                    setTeams(prev => prev.map(t =>
                      t.id === assignTeamId ? {...t, activeTasks: t.activeTasks + 1} : t,
                    ));
                    setAssignTeamId(null);
                    toastSuccess(t('vmTaskAssigned'), teams.find(t => t.id === assignTeamId)?.name ?? '');
                  }}
                  activeOpacity={0.75}>
                  <View style={[styles.priorityDot, {backgroundColor: PRIORITY_COLOR[c.priority]}]} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{c.title}</Text>
                    <Text style={styles.taskMeta}>{c.ticket} · {c.ward}</Text>
                  </View>
                  <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AppButton title={t('vmClose')} variant="ghost" onPress={() => setAssignTeamId(null)} style={{marginTop: Spacing[3]}} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[16]},

  // Summary
  summaryRow: {flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4]},
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryValue: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  summaryLabel: {fontSize: 10, color: Colors.textSecondary, textAlign: 'center'},

  // Team card
  teamCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  teamAvatarText: {fontSize: FontSize.lg, fontWeight: FontWeight.bold},
  teamInfo: {flex: 1},
  teamName: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  teamMetaRow: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2},
  teamArea: {fontSize: FontSize.xs, color: Colors.textSecondary},
  teamChips: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {fontSize: 11, fontWeight: FontWeight.bold},

  // Expanded
  expandedBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: Spacing[4],
    backgroundColor: Colors.background,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textDisabled,
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
  },
  emptyText: {fontSize: FontSize.sm, color: Colors.textDisabled, marginBottom: Spacing[3]},

  // Member row
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing[1],
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {fontSize: FontSize.sm, fontWeight: FontWeight.bold},
  memberInfo: {flex: 1},
  memberName: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  memberMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1},
  availBadge: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  availText: {fontSize: 10, fontWeight: '600'},

  // Task row
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing[1],
  },
  priorityDot: {width: 8, height: 8, borderRadius: 4},
  taskInfo: {flex: 1},
  taskTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  taskMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1},
  statusPill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  statusText: {fontSize: 10, fontWeight: FontWeight.semiBold},

  // Actions
  teamActions: {flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[4]},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionBtnText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold},

  // FAB
  fab: {
    position: 'absolute' as const,
    bottom: 32,
    right: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm},

  // Sheet modals
  sheetOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    paddingBottom: Spacing[8],
  },
  sheetHandle: {width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing[4]},
  sheetTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing[4]},
  fieldLabel: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[1], marginTop: Spacing[3]},
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  sheetActions: {flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5]},
  halfBtn: {flex: 1},
  assignInfo: {fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[3]},
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  // Page-sheet modal
  modal: {flex: 1, backgroundColor: Colors.background},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  modalTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  modalScroll: {padding: Spacing[4]},
  teamTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[4],
  },
  teamTagText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
} as const);
