import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppHeader} from '@components/common/AppHeader';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {Volunteer} from '@appTypes/api';
import {volunteerSchema, VolunteerFormData} from '@utils/validators';
import {MOCK_VOLUNTEERS} from '@utils/mockData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const VolunteerManagementScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [volunteers, setVolunteers] = useState(MOCK_VOLUNTEERS);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {control, handleSubmit, reset, formState: {errors}} = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  });

  const onAddVolunteer = async (data: VolunteerFormData) => {
    setIsSubmitting(true);
    // TODO: call addVolunteer API
    setTimeout(() => {
      setIsSubmitting(false);
      const newVol: Volunteer = {
        id: Date.now().toString(),
        name: data.name,
        phone: data.phone,
        area: data.area,
        email: data.email ?? '',
        activeComplaints: 0,
        totalResolved: 0,
        isAvailable: true,
        performanceScore: 5.0,
      };
      setVolunteers(prev => [newVol, ...prev]);
      setShowModal(false);
      reset();
    }, 1200);
  };

  const renderVolunteer = ({item}: {item: Volunteer}) => (
    <AppCard>
      <View style={styles.volHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.volInfo}>
          <Text style={styles.volName}>{item.name}</Text>
          <View style={styles.volMetaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.volArea}>{item.area}</Text>
          </View>
          <View style={styles.volMetaRow}>
            <MaterialCommunityIcons name="phone-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.volPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={[styles.availBadge, {backgroundColor: item.isAvailable ? Colors.successLight : Colors.dangerLight}]}>
          <Text style={[styles.availText, {color: item.isAvailable ? Colors.success : Colors.danger}]}>
            {item.isAvailable ? 'Available' : 'Busy'}
          </Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.activeComplaints}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalResolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.stat}>
          <View style={styles.scoreRow}>
            <MaterialCommunityIcons name="star" size={15} color={Colors.warning} />
            <Text style={styles.statValue}>{item.performanceScore.toFixed(1)}</Text>
          </View>
          <Text style={styles.statLabel}>Score</Text>
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Volunteer Management" showBack />
      <OfflineBanner />

      <FlatList
        data={volunteers}
        keyExtractor={item => item.id}
        renderItem={renderVolunteer}
        contentContainerStyle={volunteers.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState
            icon="🤲"
            title="No volunteers yet"
            subtitle="Add volunteers to help manage complaints in your constituency."
            ctaLabel="Add Volunteer"
            onCTAPress={() => setShowModal(true)}
          />
        }
      />

      <View style={styles.fab}>
        <AppButton
          title="+ Add Volunteer"
          onPress={() => setShowModal(true)}
          size="sm"
          fullWidth={false}
        />
      </View>

      {/* Add Volunteer Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Volunteer</Text>
            <AppButton title="Cancel" onPress={() => {setShowModal(false); reset();}} variant="ghost" size="sm" fullWidth={false} />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Controller control={control} name="name" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label="Full Name *" placeholder="Enter volunteer name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
              )} />
              <Controller control={control} name="phone" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label="Phone Number *" placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} />
              )} />
              <Controller control={control} name="area" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label="Area / Ward *" placeholder="Enter area name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.area?.message} />
              )} />
              <Controller control={control} name="email" render={({field: {onChange, value, onBlur}}) => (
                <AppInput label="Email (Optional)" placeholder="email@example.com" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )} />
              <AppButton title={isSubmitting ? 'Adding...' : 'Add Volunteer'} onPress={handleSubmit(onAddVolunteer)} loading={isSubmitting} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  list: {padding: Spacing[4]},
  emptyContainer: {flex: 1},
  volHeader: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing[3]},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  avatarText: {color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold},
  volInfo: {flex: 1},
  volName: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  volMetaRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1], marginTop: 2},
  volArea: {fontSize: FontSize.xs, color: Colors.textSecondary},
  volPhone: {fontSize: FontSize.xs, color: Colors.textSecondary},
  scoreRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2},
  availBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  availText: {fontSize: FontSize.xs, fontWeight: '600'},
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing[3],
  },
  stat: {flex: 1, alignItems: 'center'},
  statValue: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  statLabel: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  fab: {
    position: 'absolute',
    bottom: Spacing[6],
    right: Spacing[4],
  },
  modal: {flex: 1, backgroundColor: Colors.background},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  modalTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  modalScroll: {padding: Spacing[4]},
});
