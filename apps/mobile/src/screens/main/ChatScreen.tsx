import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { ChatBubble, ChatInput, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, colors as themeColors } from '../../constants/theme';

interface Message {
  id: string;
  content: string;
  senderId: number;
  createdAt: string;
}

interface ChatScreenProps {
  route: {
    params: {
      chatRoomId: string;
      userId: number;
      userName?: string;
    };
  };
  navigation: any;
}

export function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { chatRoomId, userName } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await api.get<{ items: Message[]; total: number }>(
        `${ENDPOINTS.CHATS.MESSAGES(chatRoomId)}?page=${pageNum}&limit=50`
      );

      if (pageNum === 1) {
        setMessages(response.items.reverse());
      } else {
        setMessages(prev => [...response.items.reverse(), ...prev]);
      }

      setHasMore(response.items.length === 50);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId]);

  useEffect(() => {
    fetchMessages(1);

    // 주기적으로 새 메시지 확인 (간단한 폴링)
    const interval = setInterval(() => {
      fetchMessages(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async (content: string) => {
    try {
      const response = await api.post<Message>(
        ENDPOINTS.CHATS.MESSAGES(chatRoomId),
        { content }
      );

      setMessages(prev => [...prev, response]);

      // 새 메시지로 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchMessages(page + 1);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble
      message={item.content}
      timestamp={formatTime(item.createdAt)}
      isMine={item.senderId === user?.id}
    />
  );

  if (isLoading && messages.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
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
        title={userName || '채팅'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: spacing.md },
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        inverted={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
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
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
