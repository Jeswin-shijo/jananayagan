import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {Poll, PollOption} from '@appTypes/api';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppChip} from '@components/common/AppChip';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_POLLS} from '@utils/mockData';
import {formatDate} from '@utils/formatters';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type PollFilter = 'active' | 'ended' | 'voted';

export const PublicPollScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
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
      Alert.alert(t('chooseOption'), t('chooseOptionMessage'));
      return;
    }
    // TODO: call submitVote API
    setPolls(prev =>
      prev.map(p =>
        p.id === pollId
          ? {...p, hasVoted: true, votedOptionId: optionId,
              options: p.options.map(o =>
                o.id === optionId ? {...o, votes: o.votes + 1} : o,
              )}
          : p,
      ),
    );
    Alert.alert(t('voteSubmitted'), t('voteSubmittedMessage'));
  };

  const renderPoll = ({item}: {item: Poll}) => {
    const totalVotes = item.options.reduce((sum, o) => sum + o.votes, 0);

    return (
      <AppCard>
        <View style={styles.pollHeader}>
          <Text style={styles.pollQuestion}>{item.question}</Text>
          <View style={styles.pollMetaRow}>
            <MaterialCommunityIcons name="poll" size={14} color={Colors.textSecondary} />
            <Text style={styles.pollMeta}>
              {t('votesEnds', {votes: totalVotes.toLocaleString(), date: formatDate(item.endDate)})}
            </Text>
          </View>
        </View>

        {item.options.map(option => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOptions[item.id] === option.id;
          const isVoted = item.votedOptionId === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                if (!item.hasVoted) {
                  setSelectedOptions(prev => ({...prev, [item.id]: option.id}));
                }
              }}
              disabled={item.hasVoted}
              style={[styles.option, isSelected && styles.optionSelected, isVoted && styles.optionVoted]}>
              <View style={[styles.optionFill, {width: `${item.hasVoted ? pct : 0}%`}]} />
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{option.text}</Text>
                {item.hasVoted && (
                  <Text style={styles.optionPct}>{pct}%</Text>
                )}
              </View>
              {(isSelected || isVoted) && (
                <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} style={styles.checkmark} />
              )}
            </TouchableOpacity>
          );
        })}

        {!item.hasVoted && item.status === 'active' && (
          <AppButton
            title={t('submitVote')}
            onPress={() => handleVote(item.id)}
            size="sm"
            style={styles.voteBtn}
            disabled={!selectedOptions[item.id]}
          />
        )}
        {item.hasVoted && (
          <View style={styles.votedRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={17} color={Colors.success} />
            <Text style={styles.votedLabel}>{t('youVotedOnPoll')}</Text>
          </View>
        )}
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.title}>{t('publicPolls')}</Text>
      </View>

      <View style={styles.filterRow}>
        {(['active', 'ended', 'voted'] as PollFilter[]).map(f => (
          <AppChip
            key={f}
            label={t(f as TranslationKey)}
            isActive={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPoll}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState
            icon="poll"
            title={t('noPollsAvailable')}
            subtitle={t('noPollsSubtitle')}
          />
        }
      />
      <CitizenCreateFab />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {padding: Spacing[4], paddingBottom: Spacing[2]},
  title: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  filterRow: {flexDirection: 'row', paddingHorizontal: Spacing[4], marginBottom: Spacing[2]},
  list: {padding: Spacing[4], paddingTop: Spacing[2]},
  emptyContainer: {flex: 1},
  pollHeader: {marginBottom: Spacing[3]},
  pollQuestion: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[1],
  },
  pollMeta: {fontSize: FontSize.xs, color: Colors.textSecondary},
  pollMetaRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
  option: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginBottom: Spacing[2],
    minHeight: 54,
    paddingHorizontal: Spacing[4],
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionVoted: {borderColor: Colors.success, backgroundColor: Colors.successLight},
  optionFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primaryLight,
    zIndex: 0,
  },
  optionContent: {flexDirection: 'row', flex: 1, justifyContent: 'space-between', zIndex: 1},
  optionText: {fontSize: FontSize.sm, color: Colors.text, flex: 1},
  optionPct: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary},
  checkmark: {zIndex: 1},
  voteBtn: {marginTop: Spacing[2]},
  votedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[1],
    marginTop: Spacing[2],
  },
  votedLabel: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: '500',
  },
} as const);
