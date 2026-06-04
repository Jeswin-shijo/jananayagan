import {useState, useCallback, useMemo} from 'react';
import {Platform, Alert, ActionSheetIOS} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useTranslation} from '@hooks/useTranslation';

interface UseImagePickerOptions {
  allowVideos?: boolean;
}

interface UseImagePickerResult {
  selectedImages: ImagePicker.ImagePickerAsset[];
  isPickerLoading: boolean;
  openPicker: () => Promise<void>;
  removeImage: (uri: string) => void;
  clearImages: () => void;
}

export const useImagePicker = (
  maxImages = 5,
  options: UseImagePickerOptions = {},
): UseImagePickerResult => {
  const {t} = useTranslation();
  const allowVideos = options.allowVideos ?? false;
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const mediaTypes = useMemo<ImagePicker.MediaType[]>(
    () => (allowVideos ? ['images', 'videos'] : ['images']),
    [allowVideos],
  );

  const handleAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      setSelectedImages(prev => [...prev, ...assets].slice(0, maxImages));
    },
    [maxImages],
  );

  const openCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('permissionRequired'), t('cameraPermissionMessage'));
      return;
    }
    setIsPickerLoading(true);
    try {
      const response = await ImagePicker.launchCameraAsync({
        mediaTypes,
        quality: 0.8,
        allowsEditing: false,
      });
      if (!response.canceled) {
        handleAssets(response.assets);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }, [handleAssets, mediaTypes, t]);

  const openGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('permissionRequired'), t('galleryPermissionMessage'));
      return;
    }
    setIsPickerLoading(true);
    try {
      const remaining = Math.max(maxImages - selectedImages.length, 1);
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
      });
      if (!response.canceled) {
        handleAssets(response.assets);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }, [handleAssets, mediaTypes, maxImages, selectedImages.length, t]);

  const openPicker = useCallback(async () => {
    if (selectedImages.length >= maxImages) {
      Alert.alert(t('limitReached'), t('limitReachedMessage', {count: maxImages}));
      return;
    }

    const title = allowVideos ? t('addMedia') : t('addPhoto');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {options: [t('cancel'), t('camera'), t('gallery')], cancelButtonIndex: 0, title},
        idx => {
          if (idx === 1) openCamera();
          if (idx === 2) openGallery();
        },
      );
    } else {
      Alert.alert(title, '', [
        {text: t('camera'), onPress: openCamera},
        {text: t('gallery'), onPress: openGallery},
        {text: t('cancel'), style: 'cancel'},
      ]);
    }
  }, [selectedImages.length, maxImages, allowVideos, openCamera, openGallery, t]);

  const removeImage = useCallback((uri: string) => {
    setSelectedImages(prev => prev.filter(img => img.uri !== uri));
  }, []);

  const clearImages = useCallback(() => setSelectedImages([]), []);

  return {selectedImages, isPickerLoading, openPicker, removeImage, clearImages};
};
