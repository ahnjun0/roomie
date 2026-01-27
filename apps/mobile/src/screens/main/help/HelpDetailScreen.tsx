import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../../contexts';
import { Header, Button } from '../../../components';
import { getHelpPost, updateHelpPostStatus } from '../../../services/help';
import { createChatRoom } from '../../../services/chat';
import { HelpPost } from '../../../types';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../../constants/theme';

interface HelpDetailScreenProps {
  navigation: any;
  route: any;
}

export function HelpDetailScreen({ navigation, route }: HelpDetailScreenProps) {
  const { postId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<HelpPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const data = await getHelpPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch help post:', error);
      Alert.alert('오류', '게시글을 불러올 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsActionLoading(true);
      const updatedPost = await updateHelpPostStatus(postId, 'SOLVED');
      setPost(updatedPost);
      Alert.alert('성공', '해결 완료 처리되었습니다.');
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleHelpOffer = async () => {
    if (!post) return;
    
    try {
      setIsActionLoading(true);
      const response = await createChatRoom(post.authorId);
      navigation.navigate('Chat', {
        chatRoomId: response.chat_room_id,
        userId: post.authorId,
        userName: post.author.nickname,
      });
    } catch (error) {
      console.error('Failed to create chat room:', error);
      Alert.alert('오류', '채팅방 생성에 실패했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || !post) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const isAuthor = String(user?.id) === String(post.authorId);
  const isSolved = post.status === 'SOLVED';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="게시글 상세" showBack />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: post.category === 'BUG' ? themeColors.error : themeColors.secondary }]}>
            <Text style={styles.categoryText}>
              {post.category === 'BUG' ? '벌레퇴치' : '고장신고'}
            </Text>
          </View>
          <Text style={[styles.statusText, { color: isSolved ? themeColors.success : themeColors.primary }]}>
            {isSolved ? '해결됨' : '진행중'}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>{post.title}</Text>
        
        <View style={styles.metaInfo}>
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
            {post.author.nickname}
          </Text>
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
            {new Date(post.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.body, { color: colors.text.primary }]}>{post.content}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, borderTopColor: colors.border }]}>
        {isAuthor && !isSolved && (
          <Button
            title="해결 완료로 표시"
            onPress={handleStatusUpdate}
            loading={isActionLoading}
            variant="outline"
            fullWidth
          />
        )}
        
        {!isAuthor && !isSolved && post.category === 'BUG' && (
          <Button
            title="도와줄게요 (채팅하기)"
            onPress={handleHelpOffer}
            loading={isActionLoading}
            fullWidth
          />
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
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
