import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useNotificationStore} from '@store/notificationStore';
import {Navy} from '@constants/colors';

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 22,
  color = '#FFFFFF',
}) => {
  const navigation = useNavigation<any>();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <TouchableOpacity
      style={styles.btn}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Notifications')}>
      <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Navy.base,
  },
  badgeText: {color: '#FFFFFF', fontSize: 9, fontWeight: '700'},
});
