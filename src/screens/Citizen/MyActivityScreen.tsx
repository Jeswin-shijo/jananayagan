import React, {useState} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {MyComplaintsScreen} from '@screens/Citizen/MyComplaintsScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {CitizenStackParamList, CitizenTabParamList} from '@appTypes/navigation';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Segment = 'complaints' | 'petitions';
type ActivityRoute = RouteProp<CitizenTabParamList, 'MyComplaints'>;
type Nav = NativeStackNavigationProp<CitizenStackParamList>;

export const MyActivityScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const route = useRoute<ActivityRoute>();
  const navigation = useNavigation<Nav>();
  const [segment, setSegment] = useState<Segment>(route.params?.initial ?? 'complaints');

  const SEGMENTS: {id: Segment; label: string}[] = [
    {id: 'complaints', label: t('complaints')},
    {id: 'petitions', label: t('petition')},
  ];
  const createLabel = segment === 'complaints' ? t('createComplaint') : t('createPetition');

  const handleCreate = () => {
    if (segment === 'complaints') {
      navigation.navigate('ReportProblem');
      return;
    }
    navigation.navigate('SubmitPetition', {mode: 'create'});
  };

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

      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.pageCreateFab}
        onPress={handleCreate}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, Colors.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.pageCreateFill}
        />
        <MaterialCommunityIcons name="plus" size={30} color={Colors.textOnPrimary} />
        <Text style={styles.pageCreateText}>{createLabel}</Text>
      </TouchableOpacity>

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
  pageCreateFab: {
    position: 'absolute',
    right: Spacing[5],
    bottom: 96,
    minWidth: 56,
    height: 56,
    borderRadius: BorderRadius['2xl'],
    paddingLeft: Spacing[3],
    paddingRight: Spacing[4],
    flexDirection: 'row',
    gap: Spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 30,
  },
  pageCreateText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  pageCreateFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
} as const);
