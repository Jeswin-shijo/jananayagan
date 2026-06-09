import React, {useState} from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {Poll} from '@appTypes/api';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppAlert} from '@components/common/AppAlert';
import {MOCK_POLLS} from '@utils/mockData';
import {formatDate} from '@utils/formatters';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type PollFilter = 'active' | 'ended' | 'voted';

// Exact poll-theme gradients (blue → cyan), matching the approved design.
const POLL_GRADIENT = ['#1F6FE5', '#22D3EE'];
const WINNER_GRADIENT = ['#2563EB', '#22C55E'];
const ACCENT = '#2563EB';
const GREEN = '#16A34A';
const ABSOLUTE_FILL = {position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0};

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const PublicPollScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {showAlert} = useAppAlert();
  const navigation = useNavigation<any>();
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [filter, setFilter] = useState<PollFilter>('active');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const filtered = polls.filter(p => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'ended') return p.status === 'ended';
    if (filter === 'voted') return p.hasVoted;
    return true;
  });

  const handleVote = (pollId: string) => {
    const optionId = selectedOptions[pollId];
    if (!optionId) {
      showAlert({
        title: t('chooseOption'),
        message: t('chooseOptionMessage'),
        variant: 'warning',
        icon: 'checkbox-marked-circle-outline',
      });
      return;
    }
    // TODO: call submitVote API
    setPolls(prev =>
      prev.map(p =>
        p.id === pollId
          ? {
              ...p,
              hasVoted: true,
              votedOptionId: optionId,
              options: p.options.map(o => (o.id === optionId ? {...o, votes: o.votes + 1} : o)),
            }
          : p,
      ),
    );
    showAlert({
      title: t('voteSubmitted'),
      message: t('voteSubmittedMessage'),
      variant: 'success',
      icon: 'poll',
    });
  };

  const renderPoll = ({item}: {item: Poll}) => {
    const totalVotes = item.options.reduce((sum, o) => sum + o.votes, 0);
    const showResults = item.hasVoted || item.status === 'ended';
    const leadingId = item.options.reduce((best, o) => (o.votes > best.votes ? o : best), item.options[0]).id;
    const highlightId = item.votedOptionId ?? leadingId;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.cardIcon, {backgroundColor: item.hasVoted ? '#DCFCE7' : '#E0ECFF'}]}>
            <MaterialCommunityIcons name="poll" size={22} color={item.hasVoted ? GREEN : ACCENT} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.pollQuestion}>{item.question}</Text>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="account-group" size={14} color={item.hasVoted ? GREEN : ACCENT} />
              <Text style={[styles.metaVotes, {color: item.hasVoted ? GREEN : ACCENT}]}>
                {formatNum(totalVotes)} {t('votes')}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <MaterialCommunityIcons name="calendar-blank-outline" size={13} color="#7C8BA5" />
              <Text style={styles.metaEnds}>{t('ppEnds')} {formatDate(item.endDate)}</Text>
            </View>
          </View>
        </View>

        {showResults ? (
          <>
            {item.options.map(option => {
              const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              const isWinner = option.id === highlightId;
              return (
                <View key={option.id} style={[styles.resultRow, isWinner && styles.resultRowWinner]}>
                  <View style={styles.resultTop}>
                    <Text style={styles.resultLabel}>{option.text}</Text>
                    <View style={styles.resultRight}>
                      <Text style={styles.resultPct}>{pct}%</Text>
                      {isWinner && <MaterialCommunityIcons name="check-circle" size={18} color={GREEN} />}
                    </View>
                  </View>
                  <View style={styles.resultTrack}>
                    {isWinner ? (
                      <LinearGradient
                        colors={WINNER_GRADIENT}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={[styles.resultFill, {width: `${pct}%`}]}
                      />
                    ) : (
                      <View style={[styles.resultFill, {width: `${pct}%`, backgroundColor: ACCENT}]} />
                    )}
                  </View>
                </View>
              );
            })}
            {item.hasVoted && (
              <View style={styles.votedBanner}>
                <MaterialCommunityIcons name="check-circle" size={18} color={GREEN} />
                <Text style={styles.votedBannerText}>{t('youVotedOnPoll')}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {item.options.map(option => {
              const selected = selectedOptions[item.id] === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedOptions(prev => ({...prev, [item.id]: option.id}))}
                  style={[styles.radioRow, selected && styles.radioRowActive]}>
                  <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.radioLabel, selected && styles.radioLabelActive]}>{option.text}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!selectedOptions[item.id]}
              onPress={() => handleVote(item.id)}
              style={[styles.submitBtn, !selectedOptions[item.id] && styles.submitBtnDisabled]}>
              <LinearGradient colors={POLL_GRADIENT} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.submitFill} />
              <Text style={styles.submitText}>{t('submitVote')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />

      <View style={styles.topBar}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{t('publicPolls')}</Text>
        <View style={styles.filterIconBtn}>
          <MaterialCommunityIcons name="filter-variant" size={20} color="#5FB2FF" />
        </View>
      </View>

      <View style={styles.segmentRow}>
        {(['active', 'ended', 'voted'] as PollFilter[]).map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              activeOpacity={0.9}
              onPress={() => setFilter(f)}
              style={[styles.segment, active && styles.segmentActive]}>
              {active && <LinearGradient colors={POLL_GRADIENT} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.segmentFill} />}
              <Text style={[styles.segmentText, {color: active ? '#FFFFFF' : '#9FB4D6'}]}>{t(f)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPoll}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState icon="poll" title={t('noPollsAvailable')} subtitle={t('noPollsSubtitle')} />
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (_Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Navy.base},

  topBar: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingHorizontal: Spacing[4], paddingTop: Spacing[2], paddingBottom: Spacing[3]},
  backBtn: {width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)'},
  title: {flex: 1, fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#FFFFFF'},
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,211,238,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(95,178,255,0.5)',
  },

  segmentRow: {flexDirection: 'row', gap: Spacing[2], paddingHorizontal: Spacing[4], marginBottom: Spacing[3]},
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(95,178,255,0.35)',
  },
  segmentActive: {borderColor: 'transparent'},
  segmentFill: {...ABSOLUTE_FILL},
  segmentText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold},

  list: {paddingHorizontal: Spacing[4], paddingBottom: 180},
  emptyContainer: {flex: 1},

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    marginBottom: Spacing[5],
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeaderRow: {flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4]},
  cardIcon: {width: 44, height: 44, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center'},
  cardHeaderText: {flex: 1},
  pollQuestion: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0F2440', lineHeight: 22},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing[1], flexWrap: 'wrap'},
  metaVotes: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  metaDot: {fontSize: FontSize.xs, color: '#7C8BA5', marginHorizontal: 2},
  metaEnds: {fontSize: FontSize.xs, color: '#7C8BA5'},

  // Radio options
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 56,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    backgroundColor: '#F4F7FB',
    borderWidth: 1.5,
    borderColor: '#E6ECF4',
    marginBottom: Spacing[3],
  },
  radioRowActive: {borderColor: ACCENT, backgroundColor: '#EFF5FF'},
  radioOuter: {width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#B6C2D6', alignItems: 'center', justifyContent: 'center'},
  radioOuterActive: {borderColor: ACCENT},
  radioInner: {width: 11, height: 11, borderRadius: 6, backgroundColor: ACCENT},
  radioLabel: {flex: 1, fontSize: FontSize.base, color: '#243551', fontWeight: FontWeight.medium},
  radioLabelActive: {color: '#0F2440', fontWeight: FontWeight.semiBold},

  // Submit
  submitBtn: {height: 52, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: Spacing[1]},
  submitBtnDisabled: {opacity: 0.55},
  submitFill: {...ABSOLUTE_FILL},
  submitText: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#FFFFFF'},

  // Results
  resultRow: {borderRadius: BorderRadius.xl, backgroundColor: '#F4F7FB', borderWidth: 1.5, borderColor: '#E6ECF4', padding: Spacing[3], marginBottom: Spacing[3]},
  resultRowWinner: {borderColor: '#86EFAC', backgroundColor: '#F0FDF4'},
  resultTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2]},
  resultLabel: {flex: 1, fontSize: FontSize.base, color: '#243551', fontWeight: FontWeight.medium},
  resultRight: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  resultPct: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0F2440'},
  resultTrack: {height: 8, borderRadius: BorderRadius.full, backgroundColor: '#E2E8F0', overflow: 'hidden'},
  resultFill: {height: 8, borderRadius: BorderRadius.full},

  votedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: '#ECFDF3',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    marginTop: Spacing[1],
  },
  votedBannerText: {fontSize: FontSize.sm, color: GREEN, fontWeight: FontWeight.semiBold},
} as const);
