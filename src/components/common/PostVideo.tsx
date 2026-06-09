import React, {useState} from 'react';
import {View, Image, Pressable, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useVideoPlayer, VideoView} from 'expo-video';

interface PostVideoProps {
  source: number | {uri: string};
  thumbnail?: number | {uri: string};
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline community-feed video player (expo-video). Shows a poster thumbnail with
 * a play button until tapped; then loops muted with native controls (play/seek/unmute).
 */
export const PostVideo: React.FC<PostVideoProps> = ({source, thumbnail, style}) => {
  const player = useVideoPlayer(source, p => {
    p.loop = true;
    p.muted = true;
  });
  const [started, setStarted] = useState(false);

  const startPlayback = () => {
    setStarted(true);
    player.play();
  };

  return (
    <View style={style}>
      <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="cover" nativeControls />
      {!started && (
        <Pressable style={styles.poster} onPress={startPlayback}>
          {thumbnail ? (
            <Image source={thumbnail} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.scrim} />
          <View style={styles.playButton}>
            <MaterialCommunityIcons name="play" size={34} color="#FFFFFF" />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const FILL = {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0} as const;

const styles = StyleSheet.create({
  poster: {...FILL, alignItems: 'center', justifyContent: 'center'},
  scrim: {...FILL, backgroundColor: 'rgba(0,0,0,0.18)'},
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
});
