import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../../contexts';
import { ChatInput, Header } from '../../../components';
import { getDeliveryPost } from '../../../services/delivery';
import { WS_BASE_URL } from '../../../constants/api';
import {
  DeliveryPost,
  DeliveryMessage,
  DeliveryWebSocketMessage,
} from '../../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  colors as themeColors,
} from '../../../constants/theme';

interface DeliveryGroupChatScreenProps {
  route: {
    params: {
      postId: string;
      postTitle?: string;
    };
  };
  navigation: any;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderNickname: string | null;
  content: string;
  createdAt: string;
  isSystem?: boolean;
}

export function DeliveryGroupChatScreen({
  route,
  navigation,
}: DeliveryGroupChatScreenProps) {
  const { postId, postTitle } = route.params;
  const { colors } = useTheme();
  const { user, accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);

  const [post, setPost] = useState<DeliveryPost | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const data = await getDeliveryPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch delivery post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket Connection for Delivery Group Chat
  useEffect(() => {
    if (!accessToken || !postId) return;

    const url = `${WS_BASE_URL}/ws/delivery/${postId}?token=${accessToken}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('Delivery WS Connected');
      setIsConnected(true);
    };

    ws.current.onmessage = e => {
      try {
        const data: DeliveryWebSocketMessage = JSON.parse(e.data);

        if (data.type === 'message') {
          const msg = data.data as DeliveryMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [
              {
                id: msg.id,
                senderId: msg.senderId,
                senderNickname: msg.senderNickname,
                content: msg.content,
                createdAt: msg.createdAt,
              },
              ...prev,
            ];
          });
        } else if (data.type === 'system') {
          const systemData = data.data as { message: string; userId?: string };
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            senderId: 'system',
            senderNickname: null,
            content: systemData.message,
            createdAt: new Date().toISOString(),
            isSystem: true,
          };
          setMessages(prev => [systemMessage, ...prev]);
        }
      } catch (err) {
        console.error('Delivery WS Parse error', err);
      }
    };

    ws.current.onerror = e => {
      console.log('Delivery WS Error', e);
      setIsConnected(false);
    };

    ws.current.onclose = e => {
      console.log('Delivery WS Closed', e.code, e.reason);
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [postId, accessToken]);

  const handleSend = async (content: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'message', content }));
    } else {
      Alert.alert('오류', '채팅 서버와 연결되어 있지 않습니다.');
    }
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={[styles.systemMessageText, { color: colors.text.tertiary }]}>
            {item.content}
          </Text>
        </View>
      );
    }

    const isMine = String(item.senderId) === String(user?.id);

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isMine ? styles.messageRight : styles.messageLeft,
        ]}>
        {!isMine && (
          <Text style={[styles.senderName, { color: colors.text.secondary }]}>
            {item.senderNickname || '익명'}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMine
              ? { backgroundColor: themeColors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
          ]}>
          <Text
            style={[
              styles.messageText,
              { color: isMine ? '#fff' : colors.text.primary },
            ]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, { color: colors.text.tertiary }]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <Header
        title={postTitle || post?.title || '배달 팟'}
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          post?.orderLink ? (
            <TouchableOpacity
              onPress={handleOpenOrderLink}
              style={[styles.orderButton, { backgroundColor: '#FF6B35' }]}>
              <Text style={styles.orderButtonText}>주문</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View
        style={[
          styles.statusBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}>
        <Text style={[styles.statusText, { color: colors.text.secondary }]}>
          {post?.isClosed ? '마감됨' : '모집중'} |{' '}
          {post?.participants.length}/{post?.maxParticipants}명
        </Text>
        {!isConnected && (
          <Text style={[styles.connectionStatus, { color: themeColors.error }]}>
            연결 끊김
          </Text>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: spacing.md },
        ]}
        inverted={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
              아직 메시지가 없습니다.{'\n'}첫 메시지를 보내보세요!
            </Text>
          </View>
        }
      />

      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
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
  orderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  statusText: {
    fontSize: fontSize.sm,
  },
  connectionStatus: {
    fontSize: fontSize.xs,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemMessageText: {
    fontSize: fontSize.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageBubbleContainer: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: fontSize.xs,
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  messageText: {
    fontSize: fontSize.md,
  },
  messageTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
});
