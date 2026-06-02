import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CitizenStackParamList} from '@appTypes/navigation';
import {reportProblemSchema, ReportProblemFormData} from '@utils/validators';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppHeader} from '@components/common/AppHeader';
import {AppChip} from '@components/common/AppChip';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useImagePicker} from '@hooks/useImagePicker';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {getPriorityColor} from '@utils/formatters';

type Props = NativeStackScreenProps<CitizenStackParamList, 'ReportProblem'>;

const CATEGORIES = [
  {id: 'road', label: '🛣️ Road', subCategories: ['Pothole', 'Damaged Road', 'No Markings']},
  {id: 'water', label: '💧 Water', subCategories: ['Leakage', 'No Supply', 'Contamination']},
  {id: 'electricity', label: '⚡ Electricity', subCategories: ['Street Light', 'Power Cut', 'Damaged Wire']},
  {id: 'sanitation', label: '🗑️ Sanitation', subCategories: ['Garbage', 'Drainage', 'Open Defecation']},
  {id: 'other', label: '📋 Other', subCategories: ['Noise', 'Encroachment', 'Other']},
];

const PRIORITIES = [
  {id: 'low', label: 'Low'},
  {id: 'medium', label: 'Medium'},
  {id: 'high', label: 'High'},
];

export const ReportProblemScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descLength, setDescLength] = useState(0);

  const {selectedImages, openPicker, removeImage} = useImagePicker(5);
  const {fetchLocation, isLoading: locationLoading} = useCurrentLocation();
  const {coords, address} = useLocationStore();

  const {control, handleSubmit, setValue, formState: {errors}} = useForm<ReportProblemFormData>({
    resolver: zodResolver(reportProblemSchema),
    defaultValues: {category: '', description: '', address: '', priority: 'medium'},
  });

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('');
    setValue('category', catId);
  };

  const subCategories = CATEGORIES.find(c => c.id === selectedCategory)?.subCategories ?? [];

  const onSubmit = async (data: ReportProblemFormData) => {
    if (selectedImages.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo of the issue.');
      return;
    }
    setIsSubmitting(true);
    // TODO: call submitComplaint API + upload images
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('ComplaintTicket', {ticketId: 'JAN-' + Date.now().toString().slice(-6)});
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Report a Problem" showBack />
      <OfflineBanner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CATEGORIES.map(cat => (
              <AppChip
                key={cat.id}
                label={cat.label}
                isActive={selectedCategory === cat.id}
                onPress={() => handleCategorySelect(cat.id)}
              />
            ))}
          </ScrollView>
          {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

          {/* Sub-category */}
          {subCategories.length > 0 && (
            <>
              <Text style={styles.label}>Sub-Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {subCategories.map(sub => (
                  <AppChip
                    key={sub}
                    label={sub}
                    isActive={selectedSubCategory === sub}
                    onPress={() => setSelectedSubCategory(sub)}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({field: {onChange, value, onBlur}}) => (
              <View>
                <AppInput
                  label={`Description * (${descLength}/500)`}
                  placeholder="Describe the problem in detail..."
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={value}
                  onChangeText={text => {onChange(text); setDescLength(text.length);}}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  style={styles.textarea}
                />
              </View>
            )}
          />

          {/* Photos */}
          <Text style={styles.label}>Photos * (min 1, max 5)</Text>
          <View style={styles.photoGrid}>
            {selectedImages.map(img => (
              <View key={img.uri} style={styles.photoThumb}>
                <Image source={{uri: img.uri}} style={styles.thumbImg} />
                <TouchableOpacity
                  onPress={() => removeImage(img.uri!)}
                  style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 5 && (
              <TouchableOpacity onPress={openPicker} style={styles.addPhotoBtn}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location */}
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationRow}>
            <AppButton
              title={locationLoading ? 'Detecting...' : '📍 Use Current Location'}
              onPress={fetchLocation}
              loading={locationLoading}
              variant="outline"
              size="sm"
              fullWidth={false}
            />
          </View>
          {address && (
            <Text style={styles.addressText}>📍 {address}</Text>
          )}
          <Controller
            control={control}
            name="address"
            render={({field: {onChange, value, onBlur}}) => (
              <AppInput
                placeholder="Or type address manually"
                value={coords?.latitude ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
              />
            )}
          />

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {setSelectedPriority(p.id); setValue('priority', p.id as any);}}
                style={[
                  styles.priorityBtn,
                  selectedPriority === p.id && {
                    backgroundColor: getPriorityColor(p.id as any) + '20',
                    borderColor: getPriorityColor(p.id as any),
                  },
                ]}>
                <Text style={[
                  styles.priorityText,
                  selectedPriority === p.id && {color: getPriorityColor(p.id as any)},
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppButton
            title={isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
    marginTop: Spacing[2],
  },
  chipRow: {marginBottom: Spacing[2]},
  errorText: {fontSize: FontSize.xs, color: Colors.danger, marginTop: -Spacing[1], marginBottom: Spacing[2]},
  textarea: {height: 100, textAlignVertical: 'top'},
  photoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[4]},
  photoThumb: {width: 80, height: 80, position: 'relative'},
  thumbImg: {width: 80, height: 80, borderRadius: BorderRadius.md},
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold},
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {fontSize: 22},
  addPhotoText: {fontSize: 10, color: Colors.primary, marginTop: 2},
  locationRow: {marginBottom: Spacing[2]},
  addressText: {fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2]},
  priorityRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  priorityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  priorityText: {fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary},
  submitBtn: {marginTop: Spacing[4]},
});
