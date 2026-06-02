module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@api': './src/api',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@constants': './src/constants',
          '@navigation': './src/navigation',
          '@appTypes': './src/types',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
