import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppCard} from '@components/common/AppCard';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppHeader} from '@components/common/AppHeader';
import {AppProgressBar} from '@components/common/AppProgressBar';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppAlert} from '@components/common/AppAlert';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {usePetitionStore} from '@store/petitionStore';
import {CitizenStackParamList} from '@appTypes/navigation';
import {formatDate, formatRelativeTime} from '@utils/formatters';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

type PetitionDetailRoute = RouteProp<CitizenStackParamList, 'PetitionDetail'>;

export const PetitionDetailScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {showAlert} = useAppAlert();
  const route = useRoute<PetitionDetailRoute>();
  const petition = usePetitionStore(state => state.getPetition(route.params.petitionId));
  const hasSigned = usePetitionStore(state => state.hasSigned(route.params.petitionId));
  const signPetition = usePetitionStore(state => state.signPetition);

  const handleSign = () => {
    if (!petition) return;

    if (!hasSigned) {
      signPetition(petition.id);
    }

    showAlert({
      title: hasSigned ? 'Already signed' : 'Petition signed',
      message: hasSigned
        ? 'You have already signed this petition.'
        : 'Your signature has been added to this petition.',
      variant: hasSigned ? 'info' : 'success',
      icon: hasSigned ? 'check-circle-outline' : 'file-sign',
    });
  };

  if (!petition) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('petition')} showBack />
        <AppEmptyState
          icon="file-document-outline"
          title={t('noActivePetitions')}
          subtitle={t('noActivePetitionsSubtitle')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('petition')} showBack />
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppCard style={styles.heroCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.createdText}>{formatRelativeTime(petition.createdAt)}</Text>
          </View>

          <Text style={styles.title}>{petition.title}</Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="folder-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{petition.category}</Text>
            <Text style={styles.metaDot}>·</Text>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{petition.constituency}</Text>
          </View>

          <Text style={styles.description}>{petition.description}</Text>

          <AppProgressBar
            current={petition.currentSignatures}
            total={petition.targetSignatures}
            label={t('signatures')}
          />

          <AppButton
            title={hasSigned ? 'Signed' : t('signPetition')}
            onPress={handleSign}
            variant={hasSigned ? 'outline' : 'primary'}
            disabled={hasSigned}
            style={styles.signButton}
          />
        </AppCard>

        <AppCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-outline" size={20} color={Colors.primary} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>Created by</Text>
              <Text style={styles.infoValue}>{petition.createdBy}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-outline" size={20} color={Colors.primary} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>{t('date')}</Text>
              <Text style={styles.infoValue}>{formatDate(petition.createdAt)}</Text>
            </View>
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[8]},
  heroCard: {marginHorizontal: 0},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  createdText: {fontSize: FontSize.xs, color: Colors.textDisabled},
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: Spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[1],
    marginBottom: Spacing[4],
  },
  metaText: {fontSize: FontSize.sm, color: Colors.textSecondary},
  metaDot: {fontSize: FontSize.sm, color: Colors.textDisabled},
  description: {
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 23,
    marginBottom: Spacing[4],
  },
  signButton: {marginTop: Spacing[4]},
  infoCard: {marginHorizontal: 0},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  infoCopy: {flex: 1},
  infoLabel: {fontSize: FontSize.xs, color: Colors.textSecondary},
  infoValue: {
    fontSize: FontSize.base,
    color: Colors.text,
    fontWeight: FontWeight.semiBold,
    marginTop: 2,
  },
} as const);
