import React, {useEffect, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppProgressBar} from '@components/common/AppProgressBar';
import {AppCard} from '@components/common/AppCard';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {petitionSchema, PetitionFormData} from '@utils/validators';
import {MOCK_PETITIONS} from '@utils/mockData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing} from '@constants/spacing';
import {CitizenTabParamList} from '@appTypes/navigation';

export const SubmitPetitionScreen: React.FC<{embedded?: boolean}> = ({embedded}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const route = useRoute<RouteProp<CitizenTabParamList, 'SubmitPetition'>>();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<PetitionFormData>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {targetSignatures: 500},
  });

  useEffect(() => {
    if (route.params?.mode === 'create') {
      setActiveTab('create');
    }
  }, [route.params?.mode]);

  const onSubmit = async (_data: PetitionFormData) => {
    setIsSubmitting(true);
    // TODO: call submitPetition API
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('Success', {kind: 'petition', refId: 'PET-' + Date.now().toString().slice(-6)});
    }, 1500);
  };

  const Container: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {!embedded && <OfflineBanner />}
      <View style={styles.tabBar}>
        {(['browse', 'create'] as const).map(tab => (
          <AppButton
            key={tab}
            title={tab === 'browse' ? t('browsePetitions') : t('createPetition')}
            onPress={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            style={styles.tabBtn}
          />
        ))}
      </View>

      {activeTab === 'browse' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>{t('activePetitions')}</Text>
          {MOCK_PETITIONS.map(petition => (
            <AppCard key={petition.id}>
              <Text style={styles.petitionTitle}>{petition.title}</Text>
              <View style={styles.petitionMetaRow}>
                <MaterialCommunityIcons name="folder-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.petitionCategory}>{petition.category} · {petition.constituency}</Text>
              </View>
              <Text style={styles.petitionDesc} numberOfLines={2}>{petition.description}</Text>
              <AppProgressBar
                current={petition.currentSignatures}
                total={petition.targetSignatures}
                label={t('signatures')}
              />
              <AppButton
                title={t('signPetition')}
                onPress={() => {/* TODO */}}
                size="sm"
                style={styles.signBtn}
              />
            </AppCard>
          ))}
          {MOCK_PETITIONS.length === 0 && (
            <AppEmptyState icon="file-document-outline" title={t('noActivePetitions')} subtitle={t('noActivePetitionsSubtitle')} />
          )}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>{t('createPetitionTitle')}</Text>

            <Controller
              control={control}
              name="title"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('petitionTitle')}
                  placeholder={t('petitionTitlePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('description')}
                  placeholder={t('petitionDescriptionPlaceholder')}
                  multiline
                  numberOfLines={5}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  style={styles.textarea}
                />
              )}
            />

            <Controller
              control={control}
              name="targetSignatures"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('targetSignatures')}
                  placeholder="500"
                  keyboardType="number-pad"
                  value={value?.toString()}
                  onChangeText={text => onChange(parseInt(text, 10) || 0)}
                  onBlur={onBlur}
                  error={errors.targetSignatures?.message}
                />
              )}
            />

            <AppButton
              title={isSubmitting ? t('submitting') : t('submitPetition')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      {!embedded && <CitizenCreateFab />}
    </Container>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  tabBar: {
    flexDirection: 'row',
    padding: Spacing[4],
    paddingBottom: Spacing[2],
    gap: Spacing[2],
    backgroundColor: Colors.background,
  },
  tabBtn: {flex: 1},
  scroll: {padding: Spacing[4], paddingTop: Spacing[2]},
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[4],
  },
  petitionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[1],
  },
  petitionCategory: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing[1],
  },
  petitionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  petitionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  signBtn: {marginTop: Spacing[3]},
  textarea: {height: 120, textAlignVertical: 'top'},
  submitBtn: {marginTop: Spacing[4]},
} as const);
