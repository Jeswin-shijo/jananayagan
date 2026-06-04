import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {MyComplaintsScreen} from '@screens/Citizen/MyComplaintsScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {CitizenTabParamList} from '@appTypes/navigation';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Segment = 'complaints' | 'petitions';
type ActivityRoute = RouteProp<CitizenTabParamList, 'MyComplaints'>;

export const MyActivityScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const route = useRoute<ActivityRoute>();
  const [segment, setSegment] = useState<Segment>(route.params?.initial ?? 'complaints');

  const SEGMENTS: {id: Segment; label: string}[] = [
    {id: 'complaints', label: t('complaints')},
    {id: 'petitions', label: t('petition')},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.segmentBar}>
        {SEGMENTS.map(s => {
          const active = segment === s.id;
          return (
            <Text
              key={s.id}
              onPress={() => setSegment(s.id)}
              style={[styles.segment, active && styles.segmentActive]}>
              {s.label}
            </Text>
          );
        })}
      </View>

      <View style={styles.body}>
        {segment === 'complaints' ? (
          <MyComplaintsScreen embedded />
        ) : (
          <SubmitPetitionScreen embedded />
        )}
      </View>

      <CitizenCreateFab />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  segmentBar: {
    flexDirection: 'row',
    margin: Spacing[4],
    marginBottom: Spacing[2],
    backgroundColor: Colors.surfaceSoft,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 4,
  },
  segment: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textSecondary,
    overflow: 'hidden',
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    color: Colors.textOnPrimary,
  },
  body: {flex: 1},
} as const);
