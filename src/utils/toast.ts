import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export const showToast = (type: ToastType, text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    position: 'bottom',
    visibilityTime: 2200,
    bottomOffset: 90,
  });
};

export const toastSuccess = (text1: string, text2?: string) => showToast('success', text1, text2);
export const toastInfo = (text1: string, text2?: string) => showToast('info', text1, text2);
export const toastError = (text1: string, text2?: string) => showToast('error', text1, text2);
