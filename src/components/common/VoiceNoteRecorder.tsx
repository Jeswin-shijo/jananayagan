import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

// Voice notes are capped at 60 seconds, then recording auto-stops.
const MAX_DURATION_MS = 60_000;

const fmt = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface VoiceNoteRecorderProps {
  value: string | null;
  onChange: (uri: string | null) => void;
}

// Playback row — mounted only when a recording exists so the player gets a stable uri.
const VoicePlayer: React.FC<{uri: string; onDelete: () => void}> = ({uri, onDelete}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || status.currentTime >= (status.duration || 0)) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const durationMs = (status.duration || 0) * 1000;

  return (
    <View style={styles.playerCard}>
      <TouchableOpacity style={styles.playBtn} onPress={toggle}>
        <MaterialCommunityIcons name={status.playing ? 'pause' : 'play'} size={22} color={Colors.textOnPrimary} />
      </TouchableOpacity>
      <View style={styles.playerInfo}>
        <Text style={styles.playerLabel}>{t('voiceNote')}</Text>
        <Text style={styles.playerDuration}>{fmt(durationMs)}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({value, onChange}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);

  const startRecording = async () => {
    // Guard: only ever one recording — ignore taps while busy, already recording, or one exists.
    if (busy || recorderState.isRecording || value) {
      return;
    }
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('micPermissionNeeded'), t('micPermissionMessage'));
        return;
      }
      setBusy(true);
      await setAudioModeAsync({allowsRecording: true, playsInSilentMode: true});
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      Alert.alert(t('recordingError'), String(e));
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = async () => {
    try {
      setBusy(true);
      await recorder.stop();
      await setAudioModeAsync({allowsRecording: false});
      if (recorder.uri) {
        onChange(recorder.uri);
      }
    } catch (e) {
      Alert.alert(t('recordingError'), String(e));
    } finally {
      setBusy(false);
    }
  };

  // Auto-stop once the 60s cap is reached.
  useEffect(() => {
    if (recorderState.isRecording && (recorderState.durationMillis ?? 0) >= MAX_DURATION_MS) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.isRecording, recorderState.durationMillis]);

  if (value) {
    return <VoicePlayer uri={value} onDelete={() => onChange(null)} />;
  }

  if (recorderState.isRecording) {
    return (
      <View style={[styles.recordCard, styles.recordingActive]}>
        <View style={styles.pulseDot} />
        <Text style={styles.recordingText}>
          {t('recording')} · {fmt(recorderState.durationMillis ?? 0)} / {fmt(MAX_DURATION_MS)}
        </Text>
        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording} disabled={busy}>
          <MaterialCommunityIcons name="stop" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.recordCard} onPress={startRecording} disabled={busy}>
      <View style={styles.micBubble}>
        <MaterialCommunityIcons name="microphone" size={22} color={Colors.primary} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{t('recordVoiceNote')}</Text>
        <Text style={styles.recordHint}>{t('tapToRecord')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (Colors: AppColors) => ({
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing[2],
  },
  recordingActive: {
    borderStyle: 'solid',
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  micBubble: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {flex: 1},
  recordTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  recordHint: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  pulseDot: {width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.danger},
  recordingText: {flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.danger},
  stopBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing[2],
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {flex: 1},
  playerLabel: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  playerDuration: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const);
