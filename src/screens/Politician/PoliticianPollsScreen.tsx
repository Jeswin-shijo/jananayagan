import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {FormModal} from '@components/common/FormModal';
import {MOCK_POLLS} from '@utils/mockData';
import {Poll} from '@appTypes/api';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const PoliticianPollsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);
  const [formVisible, setFormVisible] = useState(false);

  const handleCreate = (values: Record<string, string>) => {
    const options = (values.options ?? '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean)
      .map((text, i) => ({id: `o${i}`, text, votes: 0, percentage: 0}));
    const newPoll: Poll = {
      id: `poll-${polls.length + 1}`,
      question: values.question?.trim() || t('createPoll'),
      options: options.length ? options : [{id: 'o0', text: t('yes'), votes: 0, percentage: 0}],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      totalVotes: 0,
      hasVoted: false,
      status: 'active',
    };
    setPolls(prev => [newPoll, ...prev]);
    toastSuccess(t('pollCreated'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('publicPolls')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setFormVisible(true)} activeOpacity={0.85} style={styles.createBtn}>
          <LinearGradient colors={['#2563EB', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.createBtnGradient}>
            <Text style={styles.createBtnText}>{t('createPoll')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        {polls.map(poll => (
          <AppCard key={poll.id}>
            <View style={styles.head}>
              <Text style={styles.question}>{poll.question}</Text>
              <View style={[styles.statusPill, poll.status === 'active' ? styles.activePill : styles.closedPill]}>
                <Text style={[styles.statusText, {color: poll.status === 'active' ? Colors.success : Colors.textSecondary}]}>
                  {poll.status === 'active' ? t('active') : t('closed')}
                </Text>
              </View>
            </View>
            {poll.options.map(opt => (
              <View key={opt.id} style={styles.optRow}>
                <View style={styles.optHead}>
                  <Text style={styles.optText} numberOfLines={1}>{opt.text}</Text>
                  <Text style={styles.optPct}>{opt.percentage}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, {width: `${opt.percentage}%`}]} />
                </View>
              </View>
            ))}
            <Text style={styles.total}>{poll.totalVotes.toLocaleString()} {t('votes')}</Text>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('createPoll')}
        submitLabel={t('create')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        fields={[
          {key: 'question', label: t('question'), placeholder: t('question'), required: true},
          {key: 'options', label: t('pollOptions'), placeholder: t('pollOptionsHint'), multiline: true},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  head: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing[3], gap: Spacing[2]},
  question: {flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  statusPill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  activePill: {backgroundColor: Colors.successLight},
  closedPill: {backgroundColor: Colors.borderLight},
  statusText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  optRow: {marginBottom: Spacing[2]},
  optHead: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  optText: {flex: 1, fontSize: FontSize.sm, color: Colors.text},
  optPct: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.primary, marginLeft: Spacing[2]},
  track: {height: 6, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.full, overflow: 'hidden'},
  fill: {height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full},
  total: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing[2], fontWeight: FontWeight.medium},
  createBtn: {marginBottom: Spacing[5]},
  createBtnGradient: {borderRadius: BorderRadius['2xl'], overflow: 'hidden', paddingVertical: Spacing[4], alignItems: 'center' as const},
  createBtnText: {color: '#FFFFFF', fontSize: FontSize.base, fontWeight: FontWeight.bold, letterSpacing: 0.3},
} as const);
