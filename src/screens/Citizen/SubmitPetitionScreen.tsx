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
  Share,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {petitionSchema, PetitionFormData} from '@utils/validators';
import {Petition} from '@appTypes/api';
import {usePetitionStore} from '@store/petitionStore';
import {useNotificationStore} from '@store/notificationStore';
import {useAuthStore} from '@store/authStore';
import {useAppAlert} from '@components/common/AppAlert';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';
import {CitizenStackParamList} from '@appTypes/navigation';
import {TranslationKey} from '@constants/i18n';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type PetitionStatusFilter = Petition['status'] | 'all';

const FILTERS: {id: PetitionStatusFilter; labelKey?: TranslationKey; label?: string}[] = [
  {id: 'all', labelKey: 'all'},
  {id: 'active', labelKey: 'active'},
  {id: 'closed', labelKey: 'closed'},
  {id: 'approved', labelKey: 'spApproved'},
];

// Exact brand gradients sampled from the approved design.
const CREATE_GRADIENT = ['#3AD17C', '#1FA6D8', '#2C7BEA']; // Create Petition pill: green → cyan → blue
const SIGN_GRADIENT = ['#3D5AF2', '#3187F4', '#30AAF2']; // Sign Petition pill: indigo → blue → sky

// Per-category icon + accent colours for the petition cards.
const CATEGORY_META: Record<
  string,
  {icon: MaterialCommunityIconName; accent: string; soft: string; chipText: string}
> = {
  'Road Safety': {icon: 'road-variant', accent: '#2563EB', soft: '#DBEAFE', chipText: '#1D4ED8'},
  Water: {icon: 'water', accent: '#0D9488', soft: '#CCFBF1', chipText: '#0F766E'},
  Electricity: {icon: 'flash', accent: '#D97706', soft: '#FEF3C7', chipText: '#B45309'},
  Health: {icon: 'hospital-box', accent: '#DC2626', soft: '#FEE2E2', chipText: '#B91C1C'},
  General: {icon: 'bullhorn', accent: '#7C3AED', soft: '#EDE9FE', chipText: '#6D28D9'},
};
const metaFor = (category: string) => CATEGORY_META[category] ?? CATEGORY_META.General;

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const SubmitPetitionScreen: React.FC<{
  embedded?: boolean;
}> = ({embedded}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {showAlert} = useAppAlert();
  const route = useRoute<RouteProp<CitizenStackParamList, 'SubmitPetition'>>();
  const navigation = useNavigation<any>();
  const petitions = usePetitionStore(state => state.petitions);
  const hasSigned = usePetitionStore(state => state.hasSigned);
  const signPetition = usePetitionStore(state => state.signPetition);
  const signedCount = usePetitionStore(state => state.signedPetitionIds.length);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const user = useAuthStore(state => state.user);

  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PetitionStatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
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

  const filtered = petitions.filter(petition => activeFilter === 'all' || petition.status === activeFilter);

  const totalSignatures = petitions.reduce((sum, p) => sum + p.currentSignatures, 0);

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
      title: alreadySigned ? t('spAlreadySigned') : t('spPetitionSigned'),
      message: alreadySigned
        ? t('spAlreadySignedMessage')
        : t('spSignatureAddedMessage'),
      variant: alreadySigned ? 'info' : 'success',
      icon: alreadySigned ? 'check-circle-outline' : 'file-sign',
    });
  };

  const handleSharePetition = async (petition: Petition) => {
    const message = [
      petition.title,
      petition.description,
      '',
      `${t('signatures')}: ${formatNum(petition.currentSignatures)} / ${formatNum(petition.targetSignatures)}`,
      `${t('spConstituency')}: ${petition.constituency}`,
      `${t('spSharedFrom')} JANANAYAGAN`,
    ].join('\n');

    try {
      await Share.share({message, title: petition.title});
    } catch {
      showAlert({
        title: t('spUnableToShare'),
        message: t('spPleaseTryAgain'),
        variant: 'danger',
        icon: 'share-off',
      });
    }
  };

  const currentFilterLabel = (() => {
    const f = FILTERS.find(x => x.id === activeFilter)!;
    return f.labelKey ? t(f.labelKey) : f.label!;
  })();

  const renderPetition = ({item}: {item: Petition}) => {
    const isSigned = hasSigned(item.id);
    const meta = metaFor(item.category);
    const pct = Math.min(100, Math.round((item.currentSignatures / item.targetSignatures) * 100));

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate('PetitionDetail', {petitionId: item.id})}>
        <View style={styles.cardTop}>
          <View style={[styles.cardThumb, {backgroundColor: meta.soft}]}>
            <MaterialCommunityIcons name={meta.icon} size={30} color={meta.accent} />
          </View>
          <View style={styles.cardTopBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.chip, {backgroundColor: meta.soft}]}>
                <Text style={[styles.chipText, {color: meta.chipText}]} numberOfLines={1}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{item.constituency}</Text>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sigRow}>
          <View style={[styles.sigIcon, {backgroundColor: meta.soft}]}>
            <MaterialCommunityIcons name="account-group" size={18} color={meta.accent} />
          </View>
          <View style={styles.sigTextWrap}>
            <Text style={styles.sigLabel}>{t('signatures')}</Text>
            <Text style={styles.sigCount}>
              {formatNum(item.currentSignatures)} <Text style={styles.sigTarget}>/ {formatNum(item.targetSignatures)}</Text>
            </Text>
          </View>
          <Text style={[styles.sigPct, {color: meta.accent}]}>{pct}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: meta.accent}]} />
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isSigned}
            onPress={() => handleSignPetition(item)}
            style={styles.signBtn}>
            <LinearGradient
              colors={isSigned ? [Colors.borderLight, Colors.borderLight] : SIGN_GRADIENT}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.signBtnFill}
            />
            <MaterialCommunityIcons
              name={isSigned ? 'check' : 'signature-freehand'}
              size={18}
              color={isSigned ? Colors.textSecondary : '#FFFFFF'}
            />
            <Text style={[styles.signBtnText, isSigned && {color: Colors.textSecondary}]}>
              {isSigned ? t('spSigned') : t('signPetition')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, {borderColor: meta.soft}]}
            activeOpacity={0.8}
            onPress={() => handleSharePetition(item)}>
            <MaterialCommunityIcons name="share-variant" size={20} color={meta.accent} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View style={styles.activeHeader}>
      <View style={styles.activeIcon}>
        <MaterialCommunityIcons name="file-document-outline" size={22} color={Colors.primary} />
      </View>
      <View style={styles.activeHeaderText}>
        <Text style={styles.activeTitle}>{t('activePetitions')}</Text>
        <Text style={styles.activeSubtitle}>{t('spTrackAndSign')}</Text>
      </View>
      <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => setFilterOpen(o => !o)}>
        <MaterialCommunityIcons name="filter-variant" size={16} color={Colors.primary} />
        <Text style={styles.filterBtnText}>{currentFilterLabel}</Text>
        <MaterialCommunityIcons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const statsBar = (
    <View style={styles.statsBar}>
      <LinearGradient colors={[Navy.surface, Navy.deep]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.statsFill} />
      {[
        {icon: 'file-document-outline' as MaterialCommunityIconName, value: formatNum(petitions.length), label: t('spTotalPetitions'), bg: 'rgba(124,58,237,0.22)', color: '#C4B5FD'},
        {icon: 'account-group' as MaterialCommunityIconName, value: formatNum(totalSignatures), label: t('spTotalSignatures'), bg: 'rgba(217,119,6,0.22)', color: '#FCD34D'},
        {icon: 'chart-bar' as MaterialCommunityIconName, value: formatNum(signedCount), label: t('spYourSigned'), bg: 'rgba(236,72,153,0.22)', color: '#F9A8D4'},
      ].map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <View style={styles.statsDivider} />}
          <View style={styles.statItem}>
            <View style={[styles.statIcon, {backgroundColor: s.bg}]}>
              <MaterialCommunityIcons name={s.icon} size={16} color={s.color} />
            </View>
            <View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />

      {/* Dark header region */}
      <View style={styles.topRegion}>
        <LinearGradient colors={[Navy.base, Navy.surface, Navy.base]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheetAbsolute} />
        <View pointerEvents="none" style={styles.skyline}>
          {[16, 26, 20, 34, 22, 30, 18, 28, 24, 36, 20, 30, 16].map((h, i) => (
            <View key={i} style={[styles.building, {height: h}]} />
          ))}
        </View>

        <View style={styles.headerRow}>
          {!embedded && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.headerGreeting}>{t('spHello')}, {user?.name ?? t('citizen')} 👋</Text>
            <Text style={styles.headerSubtitle}>{t('spMakeVoiceHeard')}</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85} onPress={() => navigation.navigate('Notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Browse / Create toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.toggleBtn, activeTab === 'browse' && styles.toggleBtnActiveLight]}
            onPress={() => setActiveTab('browse')}>
            <MaterialCommunityIcons name="magnify" size={20} color={activeTab === 'browse' ? Colors.primary : '#C7D6F0'} />
            <Text style={[styles.toggleText, {color: activeTab === 'browse' ? Colors.primary : '#C7D6F0'}]}>{t('browsePetitions')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.toggleBtn}
            onPress={() => setActiveTab('create')}>
            {activeTab === 'create' && (
              <LinearGradient colors={CREATE_GRADIENT} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.toggleFill} />
            )}
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={activeTab === 'create' ? '#FFFFFF' : '#C7D6F0'} />
            <Text style={[styles.toggleText, {color: activeTab === 'create' ? '#FFFFFF' : '#C7D6F0'}]}>{t('createPetition')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Light content panel */}
      <View style={styles.panel}>
        {activeTab === 'browse' ? (
          <>
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={renderPetition}
              ListHeaderComponent={listHeader}
              ListFooterComponent={filtered.length > 0 ? statsBar : null}
              contentContainerStyle={styles.list}
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

            {filterOpen && (
              <>
                <TouchableOpacity style={styles.filterBackdrop} activeOpacity={1} onPress={() => setFilterOpen(false)} />
                <View style={styles.filterMenu}>
                  {FILTERS.map(f => {
                    const label = f.labelKey ? t(f.labelKey) : f.label!;
                    const active = activeFilter === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={styles.filterOption}
                        onPress={() => {
                          setActiveFilter(f.id);
                          setFilterOpen(false);
                        }}>
                        <Text style={[styles.filterOptionText, active && {color: Colors.primary, fontWeight: FontWeight.bold}]}>{label}</Text>
                        {active && <MaterialCommunityIcons name="check" size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
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
      </View>
    </SafeAreaView>
  );
};

const StyleSheetAbsolute = {position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Navy.base},
  flex: {flex: 1},

  // Dark header region
  topRegion: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[5],
    overflow: 'hidden',
  },
  skyline: {
    position: 'absolute',
    right: 0,
    top: Spacing[2],
    left: '40%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 4,
    opacity: 0.5,
  },
  building: {width: 12, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: 'rgba(255,255,255,0.10)'},
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3]},
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {flex: 1},
  headerGreeting: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFFFFF'},
  headerSubtitle: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Navy.base,
  },
  bellBadgeText: {color: '#FFFFFF', fontSize: 9, fontWeight: FontWeight.bold},

  // Toggle
  toggleRow: {flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5]},
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 52,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  toggleBtnActiveLight: {backgroundColor: '#FFFFFF'},
  toggleFill: {...StyleSheetAbsolute},
  toggleText: {fontSize: FontSize.base, fontWeight: FontWeight.bold},

  // Light panel
  panel: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    marginTop: -Spacing[3],
    overflow: 'hidden',
  },
  list: {padding: Spacing[4], paddingBottom: 180},

  // Active petitions header
  activeHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4]},
  activeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHeaderText: {flex: 1},
  activeTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  activeSubtitle: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1},
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surface,
  },
  filterBtnText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.primary},
  filterBackdrop: {...StyleSheetAbsolute},
  filterMenu: {
    position: 'absolute',
    top: 64,
    right: Spacing[4],
    minWidth: 150,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing[1],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 50,
  },
  filterOption: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[3], paddingVertical: Spacing[3], gap: Spacing[3]},
  filterOptionText: {fontSize: FontSize.sm, color: Colors.text},

  // Petition card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTop: {flexDirection: 'row', gap: Spacing[3]},
  cardThumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopBody: {flex: 1},
  cardTitleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2]},
  cardTitle: {flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 21},
  chip: {borderRadius: BorderRadius.full, paddingHorizontal: Spacing[2], paddingVertical: 4, maxWidth: 110},
  chipText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: Spacing[1]},
  locationText: {fontSize: FontSize.xs, color: Colors.textSecondary},
  cardDesc: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19, marginTop: Spacing[1]},

  divider: {height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing[3]},

  sigRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  sigIcon: {width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center'},
  sigTextWrap: {flex: 1},
  sigLabel: {fontSize: FontSize.xs, color: Colors.textSecondary},
  sigCount: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  sigTarget: {fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary},
  sigPct: {fontSize: FontSize.lg, fontWeight: FontWeight.bold},

  progressTrack: {height: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceSoft, marginTop: Spacing[2], overflow: 'hidden'},
  progressFill: {height: 8, borderRadius: BorderRadius.full},

  cardActions: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginTop: Spacing[4]},
  signBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 48,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  signBtnFill: {...StyleSheetAbsolute},
  signBtnText: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#FFFFFF'},
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[2],
    overflow: 'hidden',
    marginTop: Spacing[1],
  },
  statsFill: {...StyleSheetAbsolute},
  statItem: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2]},
  statIcon: {width: 32, height: 32, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center'},
  statLabel: {fontSize: 10, color: 'rgba(255,255,255,0.6)'},
  statValue: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#FFFFFF'},
  statsDivider: {width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)'},

  // Create form
  scroll: {padding: Spacing[4]},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing[4]},
  textarea: {height: 120, textAlignVertical: 'top'},
  submitBtn: {marginTop: Spacing[4]},
} as const);
