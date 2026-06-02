import {Dimensions, Platform, StatusBar} from 'react-native';

const {width, height} = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const IS_SMALL_DEVICE = width <= 375;
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

export const STATUS_BAR_HEIGHT = IS_IOS
  ? 44
  : StatusBar.currentHeight ?? 0;

export const BOTTOM_TAB_HEIGHT = IS_IOS ? 83 : 60;
export const HEADER_HEIGHT = 56;

export const wp = (percent: number) => (width * percent) / 100;
export const hp = (percent: number) => (height * percent) / 100;
