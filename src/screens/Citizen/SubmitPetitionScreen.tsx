import React, {useEffect, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  FlatList,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {AppInput} from '@components/common/AppInput';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppProgressBar} from '@components/common/AppProgressBar';
import {AppCard} from '@components/common/AppCard';
import {AppChip} from '@components/common/AppChip';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {petitionSchema, PetitionFormData} from '@utils/validators';
import {Petition} from '@appTypes/api';
import {formatRelativeTime} from '@utils/formatters';
import {usePetitionStore} from '@store/petitionStore';
import {useAppAlert} from '@components/common/AppAlert';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';
import {CitizenStackParamList} from '@appTypes/navigation';
import {TranslationKey} from '@constants/i18n';

type PetitionStatusFilter = Petition['status'] | 'all';

const FILTERS: {id: PetitionStatusFilter; labelKey?: TranslationKey; label?: string}[] = [
  {id: 'all', labelKey: 'all'},
  {id: 'active', labelKey: 'active'},
  {id: 'closed', labelKey: 'closed'},
  {id: 'approved', label: 'Approved'},
];

export const SubmitPetitionScreen: React.FC<{
  embedded?: boolean;
}> = ({
  embedded,
}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {showAlert} = useAppAlert();
  const route = useRoute<RouteProp<CitizenStackParamList, 'SubmitPetition'>>();
  const navigation = useNavigation<any>();
  const petitions = usePetitionStore(state => state.petitions);
  const hasSigned = usePetitionStore(state => state.hasSigned);
  const signPetition = usePetitionStore(state => state.signPetition);
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PetitionStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<PetitionFormData>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      category: 'General',
      constituency: 'JANANAYAGAN',
      targetSignatures: 500,
    },
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

  const filtered = petitions.filter(petition => {
    const matchFilter = activeFilter === 'all' || petition.status === activeFilter;
    const term = search.trim().toLowerCase();
    const matchSearch =
      term.length === 0 ||
      petition.title.toLowerCase().includes(term) ||
      petition.description.toLowerCase().includes(term) ||
      petition.category.toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: refetch petitions
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleSignPetition = (petition: Petition) => {
    const alreadySigned = hasSigned(petition.id);
    if (!alreadySigned) {
      signPetition(petition.id);
    }

    showAlert({
      title: alreadySigned ? 'Already signed' : 'Petition signed',
      message: alreadySigned
        ? 'You have already signed this petition.'
        : 'Your signature has been added to this petition.',
      variant: alreadySigned ? 'info' : 'success',
      icon: alreadySigned ? 'check-circle-outline' : 'file-sign',
    });
  };

  const renderPetition = ({item}: {item: Petition}) => {
    const isSigned = hasSigned(item.id);

    return (
    <AppCard
      style={styles.card}
      onPress={() => navigation.navigate('PetitionDetail', {petitionId: item.id})}>
      <View style={styles.cardHeader}>
        <View style={styles.petitionHeading}>
          <Text style={styles.petitionTitle}>{item.title}</Text>
          <View style={styles.petitionMetaRow}>
            <MaterialCommunityIcons name="folder-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.petitionCategory}>{item.category} · {item.constituency}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.petitionDesc} numberOfLines={2}>{item.description}</Text>
      <AppProgressBar
        current={item.currentSignatures}
        total={item.targetSignatures}
        label={t('signatures')}
      />
      <View style={styles.cardFooter}>
        <Text style={styles.ticketId}>{formatRelativeTime(item.createdAt)}</Text>
        <AppButton
          title={isSigned ? 'Signed' : t('signPetition')}
          onPress={() => handleSignPetition(item)}
          size="sm"
          variant={isSigned ? 'outline' : 'primary'}
          disabled={isSigned}
          fullWidth={false}
          style={styles.signBtn}
        />
      </View>
    </AppCard>
  );
  };

  const Container: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {!embedded && <AppHeader title={activeTab === 'create' ? t('createPetition') : t('petition')} showBack />}
      {!embedded && <OfflineBanner />}

      {activeTab === 'browse' ? (
        <>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textDisabled} />
            <TextInput
              style={styles.searchInput}
              placeholder={`${t('search')} ${t('petition').toLowerCase()}`}
              placeholderTextColor={Colors.textDisabled}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map(filter => (
              <AppChip
                key={filter.id}
                label={filter.labelKey ? t(filter.labelKey) : filter.label!}
                isActive={activeFilter === filter.id}
                onPress={() => setActiveFilter(filter.id)}
              />
            ))}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderPetition}
            contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <AppEmptyState
                icon="file-document-outline"
                title={t('noActivePetitions')}
                subtitle={t('noActivePetitionsSubtitle')}
              />
            }
          />
        </>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing[3],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingLeft: Spacing[2],
    fontSize: FontSize.base,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2],
  },
  list: {padding: Spacing[4], paddingTop: Spacing[2], paddingBottom: 170},
  emptyContainer: {flex: 1},
  scroll: {padding: Spacing[4], paddingTop: Spacing[2]},
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[4],
  },
  card: {marginHorizontal: 0},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
    gap: Spacing[3],
  },
  petitionHeading: {flex: 1},
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
    marginTop: Spacing[1],
  },
  petitionDesc: {
    fontSize: FontSize.base,
    color: Colors.text,
    marginBottom: Spacing[3],
    lineHeight: 20,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing[2],
    marginTop: Spacing[2],
  },
  ticketId: {fontSize: FontSize.xs, color: Colors.textSecondary},
  signBtn: {paddingHorizontal: Spacing[3], minHeight: 34},
  textarea: {height: 120, textAlignVertical: 'top'},
  submitBtn: {marginTop: Spacing[4]},
} as const);
