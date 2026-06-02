import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppCard} from '@components/common/AppCard';
import {AppHeader} from '@components/common/AppHeader';
import {AppChip} from '@components/common/AppChip';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_SENTIMENT_DATA} from '@utils/mockData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const DATE_RANGES = ['7 Days', '30 Days', '3 Months', '6 Months'];

export const AISentimentDashboardScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [selectedRange, setSelectedRange] = useState('30 Days');
  const data = MOCK_SENTIMENT_DATA;

  const getSentimentEmoji = (score: number) => {
    if (score >= 70) return '😊';
    if (score >= 40) return '😐';
    return '😟';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return Colors.success;
    if (score >= 40) return Colors.warning;
    return Colors.danger;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="AI Sentiment Dashboard" showBack />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            🤖 Data powered by backend AI service
          </Text>
        </View>

        {/* Date Range */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeRow}>
          {DATE_RANGES.map(range => (
            <AppChip
              key={range}
              label={range}
              isActive={selectedRange === range}
              onPress={() => setSelectedRange(range)}
            />
          ))}
        </ScrollView>

        {/* Overall Score */}
        <AppCard style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Overall Sentiment Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreEmoji}>{getSentimentEmoji(data.overallScore)}</Text>
            <Text style={[styles.scoreValue, {color: getSentimentColor(data.overallScore)}]}>
              {data.overallScore}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, {
              width: `${data.overallScore}%`,
              backgroundColor: getSentimentColor(data.overallScore),
            }]} />
          </View>
        </AppCard>

        {/* Trend */}
        <AppCard>
          <Text style={styles.sectionTitle}>Sentiment Trend</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.trendBars}>
              {data.trend.map((point, idx) => (
                <View key={idx} style={styles.trendBarWrapper}>
                  <View style={[
                    styles.trendBar,
                    {
                      height: `${point.score}%`,
                      backgroundColor: getSentimentColor(point.score),
                    },
                  ]} />
                  <Text style={styles.trendLabel}>{point.date.slice(5, 7)}</Text>
                </View>
              ))}
            </View>
          </View>
        </AppCard>

        {/* By Category */}
        <AppCard>
          <Text style={styles.sectionTitle}>By Category</Text>
          {data.byCategory.map(cat => (
            <View key={cat.category} style={styles.catRow}>
              <Text style={styles.catName}>{cat.category}</Text>
              <View style={styles.catBarWrapper}>
                <View style={[
                  styles.catBar,
                  {
                    width: `${cat.score}%`,
                    backgroundColor: getSentimentColor(cat.score),
                  },
                ]} />
              </View>
              <Text style={[styles.catScore, {color: getSentimentColor(cat.score)}]}>
                {cat.score}
              </Text>
            </View>
          ))}
        </AppCard>

        {/* Top Comments */}
        <AppCard>
          <Text style={styles.sectionTitle}>Sample Feedback</Text>
          {data.topComments.map(comment => (
            <View key={comment.id} style={styles.commentRow}>
              <Text style={styles.commentSentiment}>
                {comment.sentiment === 'positive' ? '👍' : comment.sentiment === 'negative' ? '👎' : '➡️'}
              </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  disclaimer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[3],
  },
  disclaimerText: {fontSize: FontSize.xs, color: Colors.primary, textAlign: 'center'},
  rangeRow: {marginBottom: Spacing[4]},
  scoreCard: {alignItems: 'center'},
  scoreLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[3]},
  scoreRow: {flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing[3]},
  scoreEmoji: {fontSize: 40, marginRight: Spacing[2]},
  scoreValue: {fontSize: 56, fontWeight: FontWeight.bold, lineHeight: 60},
  scoreMax: {fontSize: FontSize.lg, color: Colors.textSecondary, marginBottom: 8},
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  scoreBarFill: {height: '100%', borderRadius: BorderRadius.full},
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[3],
  },
  chartPlaceholder: {height: 120, justifyContent: 'flex-end'},
  trendBars: {flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: Spacing[2]},
  trendBarWrapper: {flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end'},
  trendBar: {width: '80%', borderRadius: BorderRadius.sm},
  trendLabel: {fontSize: 10, color: Colors.textSecondary, marginTop: 4},
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  catName: {width: 90, fontSize: FontSize.sm, color: Colors.text},
  catBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing[2],
  },
  catBar: {height: '100%', borderRadius: BorderRadius.full},
  catScore: {width: 30, fontSize: FontSize.sm, fontWeight: '600', textAlign: 'right'},
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing[3],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  commentSentiment: {fontSize: 20, marginRight: Spacing[2]},
  commentText: {flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20},
});
