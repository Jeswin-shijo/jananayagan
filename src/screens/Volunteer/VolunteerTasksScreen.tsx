import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_TASKS, VolunteerTask, TaskStatus} from '@utils/volunteerData';
import {toastSuccess, toastInfo} from '@utils/toast';
import {AppColors, Navy} from '@constants/colors';
import {ComplaintPriority} from '@appTypes/api';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const STATUS_META: Record<TaskStatus, {labelKey: TranslationKey; bg: keyof AppColors; fg: keyof AppColors}> = {
  assigned: {labelKey: 'assigned', bg: 'tileBlue', fg: 'info'},
  in_progress: {labelKey: 'inProgress', bg: 'warningLight', fg: 'warning'},
  done: {labelKey: 'done', bg: 'successLight', fg: 'success'},
};

const PRIORITY_KEY: Record<ComplaintPriority, TranslationKey> = {low: 'low', medium: 'medium', high: 'high'};

export const VolunteerTasksScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [tasks, setTasks] = useState<VolunteerTask[]>(MOCK_TASKS);

  const update = (task: VolunteerTask, status: TaskStatus) => {
    setTasks(prev => prev.map(x => (x.id === task.id ? {...x, status} : x)));
    if (status === 'done') {
      toastSuccess(t('taskCompleted'), task.ticketId);
    } else {
      toastInfo(t('taskStarted'), task.ticketId);
    }
  };

  const priorityColor = (p: ComplaintPriority) =>
    p === 'high' ? Colors.priorityHigh : p === 'medium' ? Colors.priorityMedium : Colors.priorityLow;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.titleBar}><Text style={styles.screenTitle}>{t('myTasks')}</Text></View>
      <View style={styles.panel}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tasks.map(task => {
          const meta = STATUS_META[task.status];
          return (
            <AppCard key={task.id}>
              <View style={styles.row}>
                <Text style={styles.ticket}>{task.ticketId}</Text>
                <View style={[styles.statusPill, {backgroundColor: Colors[meta.bg]}]}>
                  <Text style={[styles.statusText, {color: Colors[meta.fg]}]}>{t(meta.labelKey)}</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.priorityDot, {backgroundColor: priorityColor(task.priority)}]} />
                <Text style={styles.meta}>{t(PRIORITY_KEY[task.priority])} · {task.ward}, {task.area} · {t('agoShort', {time: task.ago})}</Text>
              </View>
              {task.status !== 'done' && (
                <View style={styles.actions}>
                  {task.status === 'assigned' && (
                    <TouchableOpacity style={[styles.btn, styles.start]} onPress={() => update(task, 'in_progress')}>
                      <MaterialCommunityIcons name="play" size={15} color={Colors.primary} />
                      <Text style={styles.startText}>{t('startTask')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.btn, styles.proof]} onPress={() => toastInfo(t('proofUploaded'))}>
                    <MaterialCommunityIcons name="camera-outline" size={15} color={Colors.textSecondary} />
                    <Text style={styles.proofText}>{t('uploadProof')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.done]} onPress={() => update(task, 'done')}>
                    <MaterialCommunityIcons name="check" size={15} color={Colors.secondaryDark} />
                    <Text style={styles.doneText}>{t('markDone')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AppCard>
          );
        })}
        <View style={{height: Spacing[8]}} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Navy.base},
  titleBar: {backgroundColor: Navy.base, paddingHorizontal: Spacing[4], paddingTop: Spacing[2], paddingBottom: Spacing[4]},
  screenTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFFFFF'},
  panel: {flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], paddingTop: Spacing[4]},
  scroll: {paddingHorizontal: Spacing[4]},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2]},
  ticket: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  statusPill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  statusText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  title: {fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing[2]},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3]},
  priorityDot: {width: 8, height: 8, borderRadius: 4},
  meta: {flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary},
  actions: {flexDirection: 'row', gap: Spacing[2]},
  btn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing[2], borderRadius: 10},
  start: {backgroundColor: Colors.primaryLight},
  startText: {color: Colors.primary, fontWeight: FontWeight.semiBold, fontSize: FontSize.xs},
  proof: {backgroundColor: Colors.surfaceSoft, borderWidth: 1, borderColor: Colors.border},
  proofText: {color: Colors.textSecondary, fontWeight: FontWeight.semiBold, fontSize: FontSize.xs},
  done: {backgroundColor: Colors.secondaryLight},
  doneText: {color: Colors.secondaryDark, fontWeight: FontWeight.semiBold, fontSize: FontSize.xs},
} as const);
