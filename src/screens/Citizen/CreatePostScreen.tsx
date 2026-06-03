import React, {useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useImagePicker} from '@hooks/useImagePicker';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

export const CreatePostScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const {selectedImages, openPicker, removeImage, clearImages, isPickerLoading} = useImagePicker(6);
  const [description, setDescription] = useState('');

  const publishPost = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      author: user?.name ?? t('citizen'),
      role: user?.role ? t(user.role) : t('citizen'),
      area: user?.constituency ?? 'JANANAYAGAN',
      content: trimmed,
      createdAt: t('justNow'),
      imageUris: selectedImages.map(image => image.uri).filter(Boolean),
    };

    clearImages();
    setDescription('');
    Alert.alert(t('postPublished'), t('postPublishedMessage'));

    const routeNames = navigation.getState?.().routeNames ?? [];
    if (routeNames.includes('CitizenTabs')) {
      navigation.navigate('CitizenTabs', {screen: 'CommunityFeed', params: {newPost}});
      return;
    }
    navigation.navigate('CommunityFeed', {newPost});
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('createPost')} showBack />
      <OfflineBanner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <LinearGradient
              colors={[Colors.primaryLight, Colors.surface, Colors.secondaryLight]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="image-plus-outline" size={28} color={Colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{t('shareUpdate')}</Text>
              <Text style={styles.heroSubtitle}>{t('communitySubtitle')}</Text>
            </View>
          </View>

          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('postPlaceholder')}
            placeholderTextColor={Colors.textDisabled}
            multiline
            maxLength={500}
            style={styles.descriptionInput}
          />
          <Text style={styles.counter}>{description.length}/500</Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.label}>{t('uploadImages')}</Text>
            <Text style={styles.photoCount}>{selectedImages.length}/6</Text>
          </View>

          <View style={[styles.imageGrid, selectedImages.length === 0 && styles.imageGridEmpty]}>
            {selectedImages.map(image => (
              <View key={image.uri} style={styles.imageThumb}>
                <Image source={{uri: image.uri}} style={styles.image} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(image.uri!)}>
                  <MaterialCommunityIcons name="close" size={15} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 6 && (
              <TouchableOpacity
                style={[styles.uploadTile, selectedImages.length === 0 && styles.uploadTileEmpty]}
                onPress={openPicker}
                disabled={isPickerLoading}>
                <MaterialCommunityIcons name="camera-plus-outline" size={28} color={Colors.primary} />
                <Text style={styles.uploadText}>{t('addPhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <AppButton
            title={t('publishPost')}
            onPress={publishPost}
            disabled={description.trim().length === 0}
            style={styles.publishButton}
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
  hero: {
    minHeight: 132,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[5],
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  heroCopy: {flex: 1},
  heroTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  heroSubtitle: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing[1]},
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  descriptionInput: {
    minHeight: 150,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: Spacing[4],
    fontSize: FontSize.base,
    textAlignVertical: 'top',
  },
  counter: {fontSize: FontSize.xs, color: Colors.textDisabled, textAlign: 'right', marginTop: Spacing[1], marginBottom: Spacing[4]},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  photoCount: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  imageGrid: {flexDirection: 'row', alignSelf: 'flex-start', flexWrap: 'wrap', gap: Spacing[2]},
  imageGridEmpty: {justifyContent: 'center'},
  imageThumb: {width: '31.5%', aspectRatio: 1, borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative'},
  image: {width: '100%', height: '100%'},
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTile: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTileEmpty: {width: 142, height: 122, aspectRatio: undefined},
  uploadText: {fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semiBold, marginTop: Spacing[1]},
  publishButton: {marginTop: Spacing[6]},
});
