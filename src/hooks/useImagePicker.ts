import {useState, useCallback} from 'react';
import {Platform, Alert, ActionSheetIOS} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  quality: 0.8,
  allowsEditing: false,
};

interface UseImagePickerResult {
  selectedImages: ImagePicker.ImagePickerAsset[];
  isPickerLoading: boolean;
  openPicker: () => Promise<void>;
  removeImage: (uri: string) => void;
  clearImages: () => void;
}

export const useImagePicker = (maxImages = 5): UseImagePickerResult => {
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const handleAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      setSelectedImages(prev => {
        const combined = [...prev, ...assets];
        return combined.slice(0, maxImages);
      });
    },
    [maxImages],
  );

  const openCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera Permission Required', 'Please allow camera access to take a photo.');
      return;
    }

    setIsPickerLoading(true);
    try {
      const response = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
      if (!response.canceled) {
        handleAssets(response.assets);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }, [handleAssets]);

  const openGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo Permission Required', 'Please allow photo library access to choose images.');
      return;
    }

    setIsPickerLoading(true);
    try {
      const response = await ImagePicker.launchImageLibraryAsync({
        ...IMAGE_OPTIONS,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
      });
      if (!response.canceled) {
        handleAssets(response.assets);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }, [handleAssets, maxImages]);

  const openPicker = useCallback(async () => {
    if (selectedImages.length >= maxImages) {
      Alert.alert('Limit reached', `You can add up to ${maxImages} images.`);
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0},
        idx => {
          if (idx === 1) openCamera();
          if (idx === 2) openGallery();
        },
      );
    } else {
      Alert.alert('Add Photo', '', [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openGallery},
        {text: 'Cancel', style: 'cancel'},
      ]);
    }
  }, [selectedImages.length, maxImages, openCamera, openGallery]);

  const removeImage = useCallback((uri: string) => {
    setSelectedImages(prev => prev.filter(img => img.uri !== uri));
  }, []);

  const clearImages = useCallback(() => setSelectedImages([]), []);

  return {selectedImages, isPickerLoading, openPicker, removeImage, clearImages};
};
