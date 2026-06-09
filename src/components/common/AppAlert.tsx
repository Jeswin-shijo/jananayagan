import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {Modal, Pressable, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type AlertVariant = 'info' | 'success' | 'warning' | 'danger';
type AlertActionStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertAction = {
  text: string;
  style?: AlertActionStyle;
  onPress?: () => void;
};

export type AppAlertConfig = {
  title: string;
  message?: string;
  variant?: AlertVariant;
  icon?: MaterialCommunityIconName;
  actions?: AppAlertAction[];
};

type AppAlertContextValue = {
  showAlert: (config: AppAlertConfig) => void;
  hideAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

const variantTokens: Record<AlertVariant, {icon: MaterialCommunityIconName; color: keyof AppColors; bg: keyof AppColors}> = {
  info: {icon: 'information-outline', color: 'primary', bg: 'primaryLight'},
  success: {icon: 'check-circle-outline', color: 'success', bg: 'successLight'},
  warning: {icon: 'alert-circle-outline', color: 'warning', bg: 'warningLight'},
  danger: {icon: 'logout', color: 'danger', bg: 'dangerLight'},
};

const inferVariant = (actions?: AppAlertAction[]): AlertVariant =>
  actions?.some(action => action.style === 'destructive') ? 'danger' : 'info';

export const AppAlertProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [config, setConfig] = useState<AppAlertConfig | null>(null);

  const hideAlert = useCallback(() => setConfig(null), []);
  const showAlert = useCallback((nextConfig: AppAlertConfig) => setConfig(nextConfig), []);

  const value = useMemo(() => ({showAlert, hideAlert}), [showAlert, hideAlert]);
  const variant = config?.variant ?? inferVariant(config?.actions);
  const token = variantTokens[variant];
  const actions = config?.actions?.length ? config.actions : [{text: t('ok')}];
  const cancelAction = actions.find(action => action.style === 'cancel');

  const runAction = (action: AppAlertAction) => {
    hideAlert();
    requestAnimationFrame(() => action.onPress?.());
  };

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <Modal visible={!!config} transparent animationType="fade" onRequestClose={hideAlert}>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} onPress={() => (cancelAction ? runAction(cancelAction) : hideAlert())} />
          {!!config && (
            <View style={styles.card}>
              <View style={[styles.iconWrap, {backgroundColor: styles.colors[token.bg]}]}>
                <MaterialCommunityIcons name={config.icon ?? token.icon} size={30} color={styles.colors[token.color]} />
              </View>
              <Text style={styles.title}>{config.title}</Text>
              {!!config.message && <Text style={styles.message}>{config.message}</Text>}
              <View style={styles.actions}>
                {actions.map((action, index) => {
                  const isPrimary = action.style !== 'cancel' && index === actions.length - 1;
                  const isDestructive = action.style === 'destructive';
                  const button = (
                    <TouchableOpacity
                      key={`${action.text}-${index}`}
                      activeOpacity={0.82}
                      style={[
                        styles.action,
                        !isPrimary && styles.actionSecondary,
                        isDestructive && styles.actionDanger,
                      ]}
                      onPress={() => runAction(action)}>
                      {isPrimary && !isDestructive && (
                        <LinearGradient
                          colors={[styles.colors.primaryDark, styles.colors.primary, styles.colors.secondary]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.actionFill}
                        />
                      )}
                      <Text
                        style={[
                          styles.actionText,
                          !isPrimary && styles.actionTextSecondary,
                          isDestructive && styles.actionTextDanger,
                        ]}>
                        {action.text}
                      </Text>
                    </TouchableOpacity>
                  );
                  return button;
                })}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </AppAlertContext.Provider>
  );
};

export const useAppAlert = () => {
  const context = useContext(AppAlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }
  return context;
};

const createStyles = (Colors: AppColors) => ({
  colors: Colors,
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing[5],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.overlay,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing[5],
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 14,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: Spacing[2],
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: Spacing[5],
    gap: Spacing[2],
  },
  action: {
    minHeight: 52,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  actionFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  actionSecondary: {
    backgroundColor: Colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionDanger: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  actionText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  actionTextSecondary: {
    color: Colors.textSecondary,
  },
  actionTextDanger: {
    color: Colors.danger,
  },
} as const);
