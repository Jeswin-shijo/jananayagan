import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppProgressBar} from '@components/common/AppProgressBar';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {petitionSchema, PetitionFormData} from '@utils/validators';
import {MOCK_PETITIONS} from '@utils/mockData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing} from '@constants/spacing';

const CATEGORIES = ['Road Safety', 'Water', 'Electricity', 'Health', 'Education', 'Environment', 'Other'];
const CONSTITUENCIES = ['Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Guindy'];

export const SubmitPetitionScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<PetitionFormData>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {targetSignatures: 500},
  });

  const onSubmit = async (_data: PetitionFormData) => {
    setIsSubmitting(true);
    // TODO: call submitPetition API
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <AppEmptyState
          icon="🎉"
          title="Petition Submitted!"
          subtitle="Your petition has been submitted for review. Share it with your community to gather signatures."
          ctaLabel="View Petitions"
          onCTAPress={() => {setSubmitted(false); setActiveTab('browse');}}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <View style={styles.tabBar}>
        {(['browse', 'create'] as const).map(tab => (
          <AppButton
            key={tab}
            title={tab === 'browse' ? 'Browse Petitions' : 'Create Petition'}
            onPress={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            style={styles.tabBtn}
          />
        ))}
      </View>

      {activeTab === 'browse' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Active Petitions</Text>
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
                label="Signatures"
              />
              <AppButton
                title="Sign Petition"
                onPress={() => {/* TODO */}}
                size="sm"
                style={styles.signBtn}
              />
            </AppCard>
          ))}
          {MOCK_PETITIONS.length === 0 && (
            <AppEmptyState icon="📜" title="No active petitions" subtitle="Be the first to create a petition for your community." />
          )}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Create a Petition</Text>

            <Controller
              control={control}
              name="title"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label="Petition Title *"
                  placeholder="E.g. Install speed breakers near school"
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
                  label="Description *"
                  placeholder="Explain your petition in detail..."
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
                  label="Target Signatures *"
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
              title={isSubmitting ? 'Submitting...' : 'Submit Petition'}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
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
});
