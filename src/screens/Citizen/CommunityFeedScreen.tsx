import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import {AppCard} from '@components/common/AppCard';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {useNotificationStore} from '@store/notificationStore';
import {CitizenTabParamList} from '@appTypes/navigation';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontSize, FontWeight} from '@constants/typography';

type CommunityRoute = RouteProp<CitizenTabParamList, 'CommunityFeed'>;

type FeedComment = {
  id: string;
  author: string;
  text: string;
};

type AccentToken = 'tileGreen' | 'tileTeal' | 'tileAmber' | 'tileBlue' | 'tilePurple';

type CommunityPost = {
  id: string;
  author: string;
  role: string;
  area: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  accent: AccentToken;
  imageUris?: string[];
  comments: FeedComment[];
};

const SAMPLE_POST_IMAGE = 'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=900&q=80';

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Meena K',
    role: 'Resident',
    area: 'Anna Nagar',
    content: 'Street lights near 4th Avenue are working again tonight. Thanks to everyone who reported and followed up.',
    createdAt: '18 min',
    likes: 42,
    isLiked: false,
    accent: 'tileGreen',
    comments: [
      {id: 'c1', author: 'Arun', text: 'Great update. This area feels safer now.'},
      {id: 'c2', author: 'Priya', text: 'We should check the next lane too.'},
    ],
  },
  {
    id: 'post-2',
    author: 'Ward Volunteer',
    role: 'Volunteer',
    area: 'T. Nagar',
    content: 'Water tanker schedule for tomorrow: 7:30 AM near the community hall and 8:15 AM near West Street.',
    createdAt: '1 hr',
    likes: 87,
    isLiked: true,
    accent: 'tileTeal',
    imageUris: [SAMPLE_POST_IMAGE],
    comments: [
      {id: 'c3', author: 'Siva', text: 'Please add South Street if possible.'},
    ],
  },
  {
    id: 'post-3',
    author: 'JANANAYAGAN Desk',
    role: 'Official',
    area: 'City Updates',
    content: 'Public poll is open for pedestrian crossing improvements. Share your vote before Friday evening.',
    createdAt: '3 hr',
    likes: 126,
    isLiked: false,
    accent: 'tileAmber',
    comments: [],
  },
];

const DOUBLE_TAP_DELAY = 280;
const HEART_CLEAR_DELAY = 720;

export const CommunityFeedScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const route = useRoute<CommunityRoute>();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const isCitizen = user?.role === 'citizen';
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [heartPostId, setHeartPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const lastTapByPost = useRef<Record<string, number>>({});
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentsSheetRef = useRef<BottomSheetModal>(null);
  const heartScale = useSharedValue(0);
  const commentSheetSnapPoints = useMemo(() => ['45%', '78%'], []);

  const selectedPost = useMemo(
    () => posts.find(post => post.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  );

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartScale.value}],
    opacity: heartScale.value,
  }));

  const renderCommentsBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.48}
      pressBehavior="close"
    />
  ), []);

  useEffect(() => {
    const newPost = route.params?.newPost;
    if (newPost) {
      setPosts(prev => {
        if (prev.some(post => post.id === newPost.id)) {
          return prev;
        }
        return [{
          ...newPost,
          likes: 0,
          isLiked: false,
          accent: 'tileGreen',
          comments: [],
        }, ...prev];
      });
    }
  }, [Colors.secondaryLight, route.params?.newPost]);

  useEffect(() => {
    setPosts(prev => prev.map(post => (
      post.id === 'post-2' && !post.imageUris?.length
        ? {...post, imageUris: [SAMPLE_POST_IMAGE]}
        : post
    )));
  }, []);

  useEffect(() => () => {
    if (heartTimer.current) {
      clearTimeout(heartTimer.current);
    }
  }, []);

  const toggleLike = (postId: string, forceLike = false) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) {
        return post;
      }

      if (forceLike && post.isLiked) {
        return post;
      }

      const nextLiked = forceLike ? true : !post.isLiked;
      return {
        ...post,
        isLiked: nextLiked,
        likes: post.likes + (nextLiked ? 1 : -1),
      };
    }));
  };

  const handlePostPress = (postId: string) => {
    const now = Date.now();
    const lastTap = lastTapByPost.current[postId] ?? 0;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      toggleLike(postId, true);
      setHeartPostId(postId);
      heartScale.value = 0;
      heartScale.value = withSequence(
        withSpring(1.18, {damping: 8, stiffness: 360}),
        withSpring(1, {damping: 12, stiffness: 260}),
        withDelay(320, withTiming(0, {duration: 180})),
      );
      if (heartTimer.current) {
        clearTimeout(heartTimer.current);
      }
      heartTimer.current = setTimeout(() => setHeartPostId(null), HEART_CLEAR_DELAY);
      lastTapByPost.current[postId] = 0;
      return;
    }

    lastTapByPost.current[postId] = now;
  };

  const addComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed || !selectedPostId) {
      return;
    }

    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      author: user?.name ?? t('citizen'),
      text: trimmed,
    };

    setPosts(prev => prev.map(post => (
      post.id === selectedPostId
        ? {...post, comments: [...post.comments, newComment]}
        : post
    )));
    setCommentText('');
  };

  const openComments = (postId: string) => {
    setSelectedPostId(postId);
    setCommentText('');
    requestAnimationFrame(() => commentsSheetRef.current?.present());
  };

  const renderPost = ({item, index}: {item: CommunityPost; index: number}) => (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <AppCard style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={[styles.avatar, {backgroundColor: Colors[item.accent]}]}>
            <Text style={styles.avatarText}>{item.author.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.authorBlock}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.postMeta}>{item.role} · {item.area} · {item.createdAt}</Text>
          </View>
          {/* <MaterialCommunityIcons name="dots-horizontal" size={22} color={Colors.textSecondary} /> */}
        </View>

        <Pressable
          onPress={() => handlePostPress(item.id)}
          style={item.imageUris?.length ? styles.postMediaBody : styles.postBody}>
          {item.imageUris?.length ? (
            <>
              <Image source={{uri: item.imageUris[0]}} style={styles.postMainImage} />
              {item.imageUris.length > 1 && (
                <View style={styles.moreImagesBadge}>
                  <MaterialCommunityIcons name="image-multiple-outline" size={14} color={Colors.white} />
                  <Text style={styles.moreImagesText}>+{item.imageUris.length - 1}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <LinearGradient
                colors={[Colors[item.accent], Colors.surface, Colors.primaryLight]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.postContent}>{item.content}</Text>
            </>
          )}
          {heartPostId === item.id && (
            <Animated.View pointerEvents="none" style={[styles.doubleTapHeart, heartStyle]}>
              <MaterialCommunityIcons name="heart" size={72} color={Colors.danger} />
            </Animated.View>
          )}
        </Pressable>

        {item.imageUris?.length ? (
          <Text style={styles.postCaption}>{item.content}</Text>
        ) : null}

        <Text style={styles.hint}>{t('doubleTapToLike')}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
            <MaterialCommunityIcons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={item.isLiked ? Colors.danger : Colors.textSecondary}
            />
            <Text style={[styles.actionText, item.isLiked && {color: Colors.danger}]}>
              {t('likesCount', {count: item.likes})}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openComments(item.id)}>
            <MaterialCommunityIcons name="comment-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{item.comments.length} {t('comments')}</Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          isCitizen ? (
            <Animated.View entering={FadeInUp.duration(420)} style={styles.quickBanner}>
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary, Colors.secondary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.quickTitle}>{t('quickLinks')}</Text>
              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Dashboard')}>
                  <View style={styles.quickIcon}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.quickLabel}>{t('dashboard')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Notifications')}>
                  <View style={styles.quickIcon}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.primary} />
                    {unreadCount > 0 && (
                      <View style={styles.quickBadge}>
                        <Text style={styles.quickBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.quickLabel}>{t('notifications')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
              <LinearGradient
                colors={[Colors.primaryLight, Colors.surface, Colors.secondaryLight]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.headerText}>
                <Text style={styles.title}>{t('communityFeed')}</Text>
                <Text style={styles.subtitle}>{t('communitySubtitle')}</Text>
              </View>
              <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CreatePost')}>
                <MaterialCommunityIcons name="plus" size={24} color={Colors.textOnPrimary} />
              </TouchableOpacity>
            </Animated.View>
          )
        }
      />

      <CitizenCreateFab />

      <BottomSheetModal
        ref={commentsSheetRef}
        snapPoints={commentSheetSnapPoints}
        backdropComponent={renderCommentsBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        onDismiss={() => {
          setSelectedPostId(null);
          setCommentText('');
        }}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('comments')}</Text>
            <TouchableOpacity onPress={() => commentsSheetRef.current?.dismiss()}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedPost?.comments.length ? (
            <View style={styles.commentsList}>
              {selectedPost.comments.map(comment => (
                <View key={comment.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{comment.author.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentBody}>{comment.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyComments}>{t('noCommentsYet')}</Text>
          )}

          <View style={styles.commentInputRow}>
            <BottomSheetTextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={t('writeComment')}
              placeholderTextColor={Colors.textDisabled}
              style={styles.commentInput}
            />
            <TouchableOpacity style={styles.commentSend} onPress={addComment}>
              <MaterialCommunityIcons name="send" size={20} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  list: {padding: Spacing[4], paddingBottom: Spacing[16]},
  header: {
    minHeight: 142,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    padding: Spacing[5],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  headerText: {flex: 1, paddingRight: Spacing[3]},
  title: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  subtitle: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing[1]},
  headerButton: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBanner: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    padding: Spacing[4],
    marginBottom: Spacing[4],
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  quickTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnPrimary, marginBottom: Spacing[3]},
  quickRow: {flexDirection: 'row', gap: Spacing[3]},
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  quickBadgeText: {color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold},
  quickLabel: {color: Colors.textOnPrimary, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
  postCard: {marginHorizontal: 0},
  postHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[3]},
  avatar: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary},
  authorBlock: {flex: 1},
  authorName: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  postMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  postBody: {
    minHeight: 190,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    justifyContent: 'center',
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postMediaBody: {
    minHeight: 240,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.borderLight,
  },
  postMainImage: {
    width: '100%',
    height: 260,
  },
  postContent: {
    fontSize: FontSize.lg,
    lineHeight: 27,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
  },
  postCaption: {
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.text,
    marginTop: Spacing[3],
  },
  moreImagesBadge: {
    position: 'absolute',
    right: Spacing[2],
    top: Spacing[2],
    backgroundColor: Colors.overlay,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreImagesText: {fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.white},
  doubleTapHeart: {
    position: 'absolute',
    alignSelf: 'center',
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    marginTop: Spacing[2],
    textAlign: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing[3],
  },
  actionButton: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
  actionText: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  bottomSheetBackground: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
  },
  bottomSheetHandle: {
    backgroundColor: Colors.border,
    width: 46,
  },
  bottomSheetContent: {paddingHorizontal: Spacing[4], paddingBottom: Spacing[4]},
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  sheetTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  commentsList: {gap: Spacing[3], marginBottom: Spacing[4]},
  commentRow: {flexDirection: 'row', alignItems: 'flex-start'},
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[2],
  },
  commentAvatarText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold},
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  commentAuthor: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text},
  commentBody: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 19},
  emptyComments: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing[6],
  },
  commentInputRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  commentInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSoft,
    paddingHorizontal: Spacing[4],
    color: Colors.text,
  },
  commentSend: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const);
