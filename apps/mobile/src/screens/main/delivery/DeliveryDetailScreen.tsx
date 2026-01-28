import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../../contexts';
import { Header, Button } from '../../../components';
import {
  getDeliveryPost,
  joinDeliveryPost,
  leaveDeliveryPost,
  closeDeliveryPost,
} from '../../../services/delivery';
import { DeliveryPost, FoodCategory } from '../../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  colors as themeColors,
} from '../../../constants/theme';

interface DeliveryDetailScreenProps {
  navigation: any;
  route: any;
}

const CATEGORY_LABELS: Record<string, string> = {
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식',
  FASTFOOD: '패스트푸드',
  CHICKEN: '치킨',
  PIZZA: '피자',
  DESSERT: '디저트',
  OTHER: '기타',
};

const CATEGORY_COLORS: Record<string, string> = {
  KOREAN: '#D4A574',
  CHINESE: '#E74C3C',
  JAPANESE: '#3498DB',
  WESTERN: '#9B59B6',
  FASTFOOD: '#F39C12',
  CHICKEN: '#F39C12',
  PIZZA: '#E67E22',
  DESSERT: '#FF69B4',
  OTHER: '#95A5A6',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
};

export function DeliveryDetailScreen({
  navigation,
  route,
}: DeliveryDetailScreenProps) {
  const { postId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<DeliveryPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPost();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const data = await getDeliveryPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch delivery post:', error);
      Alert.alert('오류', '게시글을 불러올 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setIsActionLoading(true);
      await joinDeliveryPost(postId);
      await fetchPost();
      Alert.alert('성공', '배달 팟에 참여했습니다.');
    } catch (error: any) {
      console.error('Failed to join:', error);
      const message =
        error?.response?.data?.detail?.message || '참여에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert('나가기', '정말 배달 팟에서 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsActionLoading(true);
            await leaveDeliveryPost(postId);
            await fetchPost();
            Alert.alert('알림', '배달 팟에서 나왔습니다.');
          } catch (error: any) {
            console.error('Failed to leave:', error);
            const message =
              error?.response?.data?.detail?.message || '나가기에 실패했습니다.';
            Alert.alert('오류', message);
          } finally {
            setIsActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleClose = async () => {
    Alert.alert('모집 마감', '모집을 마감하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '마감하기',
        onPress: async () => {
          try {
            setIsActionLoading(true);
            await closeDeliveryPost(postId);
            await fetchPost();
            Alert.alert('성공', '모집이 마감되었습니다.');
          } catch (error: any) {
            console.error('Failed to close:', error);
            const message =
              error?.response?.data?.detail?.message || '마감에 실패했습니다.';
            Alert.alert('오류', message);
          } finally {
            setIsActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleOpenOrderLink = async () => {
    if (!post?.orderLink) return;

    try {
      const supported = await Linking.canOpenURL(post.orderLink);
      if (supported) {
        await Linking.openURL(post.orderLink);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  };

  const handleEnterChat = () => {
    if (!post) return;
    navigation.navigate('DeliveryGroupChat', {
      postId: post.id,
      postTitle: post.title,
    });
  };

  if (isLoading || !post) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const isAuthor = String(user?.id) === String(post.author.id);
  const isParticipant = post.participants.some(
    p => String(p.id) === String(user?.id),
  );
  const isFull = post.participants.length >= post.maxParticipants;
  const categoryColor =
    CATEGORY_COLORS[post.foodCategory] || CATEGORY_COLORS.OTHER;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="배달 팟" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[post.foodCategory] || post.foodCategory}
            </Text>
          </View>
          <Text
            style={[
              styles.statusText,
              {
                color: post.isClosed ? themeColors.error : themeColors.success,
              },
            ]}>
            {post.isClosed ? '마감' : '모집중'}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {post.title}
        </Text>

        <View style={styles.metaInfo}>
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
            {post.author.nickname || '익명'}
          </Text>
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
            {formatDate(post.createdAt)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.body, { color: colors.text.primary }]}>
          {post.content}
        </Text>

        {post.orderLink && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: '#FF6B35' }]}
            onPress={handleOpenOrderLink}>
            <Text style={styles.linkButtonText}>주문 링크 열기</Text>
          </TouchableOpacity>
        )}

        {post.bankAccount && (
          <View
            style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>
              정산 계좌
            </Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>
              {post.bankAccount}
            </Text>
          </View>
        )}

        <View
          style={[styles.participantBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.participantTitle, { color: colors.text.primary }]}>
            참여자 ({post.participants.length}/{post.maxParticipants})
          </Text>
          <View style={styles.participantList}>
            {post.participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantItem}>
                <Text style={[styles.participantName, { color: colors.text.secondary }]}>
                  {participant.nickname || '익명'}
                  {String(participant.id) === String(post.author.id) && (
                    <Text style={{ color: themeColors.primary }}> (방장)</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + spacing.md, borderTopColor: colors.border },
        ]}>
        {!isParticipant && !post.isClosed && !isFull && (
          <Button
            title="참여하기"
            onPress={handleJoin}
            loading={isActionLoading}
            fullWidth
          />
        )}

        {isParticipant && !isAuthor && (
          <View style={styles.buttonRow}>
            <Button
              title="채팅방 입장"
              onPress={handleEnterChat}
              style={styles.buttonHalf}
            />
            <Button
              title="나가기"
              onPress={handleLeave}
              loading={isActionLoading}
              variant="outline"
              style={styles.buttonHalf}
            />
          </View>
        )}

        {isAuthor && (
          <View style={styles.buttonRow}>
            <Button
              title="채팅방 입장"
              onPress={handleEnterChat}
              style={styles.buttonHalf}
            />
            {!post.isClosed && (
              <Button
                title="마감하기"
                onPress={handleClose}
                loading={isActionLoading}
                variant="outline"
                style={styles.buttonHalf}
              />
            )}
          </View>
        )}

        {isFull && !isParticipant && !post.isClosed && (
          <Text style={[styles.fullText, { color: colors.text.tertiary }]}>
            모집 인원이 가득 찼습니다.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  linkButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  participantBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  participantTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  participantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantItem: {
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  participantName: {
    fontSize: fontSize.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  fullText: {
    textAlign: 'center',
    fontSize: fontSize.md,
  },
});
