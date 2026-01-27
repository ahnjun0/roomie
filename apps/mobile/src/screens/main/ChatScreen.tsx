import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { ChatBubble, ChatInput, Header } from '../../components';
import { api, ApiError } from '../../services/api';
import { getContractByChatRoom, initContract } from '../../services/contract';
import { ENDPOINTS, WS_BASE_URL } from '../../constants/api';
import { spacing, colors as themeColors } from '../../constants/theme';

interface Message {
  id: string;
  content: string;
  senderId: number | string;
  createdAt: string;
}

interface ChatScreenProps {
  route: {
    params: {
      chatRoomId: string;
      userId: number | string;
      userName?: string;
    };
  };
  navigation: any;
}

export function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { chatRoomId, userName } = route.params;
  const { colors } = useTheme();
  const { user, accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await api.get<{ data: Message[] }>(
        `${ENDPOINTS.CHATS.MESSAGES(chatRoomId)}?page=${pageNum}&limit=50`
      );

      const items = response.data ?? [];

      if (pageNum === 1) {
        setMessages(items.reverse());
      } else {
        setMessages(prev => [...items.reverse(), ...prev]);
      }

      setHasMore(items.length === 50);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId]);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // WebSocket Connection
  useEffect(() => {
    if (!accessToken) return;

    const url = `${WS_BASE_URL}/ws/chats/${chatRoomId}?token=${accessToken}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WS Connected');
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'new_message') {
          const newMsg = data.data;
          setMessages(prev => {
            // Prevent duplicates if any
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Scroll to bottom on new message
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (err) {
        console.error('WS Parse error', err);
      }
    };

    ws.current.onerror = (e) => {
      console.log('WS Error', e);
    };

    return () => {
      ws.current?.close();
    };
  }, [chatRoomId, accessToken]);

  const handleSend = async (content: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'message', content }));
    } else {
      Alert.alert('오류', '채팅 서버와 연결되어 있지 않습니다.');
    }
  };

  const handleContract = async () => {
    try {
      const contract = await getContractByChatRoom(chatRoomId);
      navigation.navigate('Contract', { contractId: contract.id });
    } catch (error: any) {
      // 404 means no contract exists yet
      if (error.status === 404) {
        try {
          const newContract = await initContract(chatRoomId);
          navigation.navigate('Contract', { contractId: newContract.id });
        } catch (initError) {
          console.error('Init contract failed:', initError);
          Alert.alert('오류', '계약서 생성에 실패했습니다.');
        }
      } else {
        console.error('Get contract failed:', error);
        Alert.alert('오류', '계약서를 불러올 수 없습니다.');
      }
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
      isMine={String(item.senderId) === String(user?.id)}
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
        rightAction={{
          label: 'Becoming Roomie',
          onPress: handleContract,
        }}
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
          // Scroll to bottom on initial load
          if (messages.length > 0 && page === 1 && !isLoading) {
            // Optional: only scroll if we are near bottom?
            // For now, simple scroll on load might be enough or confusing if paging.
            // If page > 1, we are prepending, so we shouldn't scroll to end.
            // We need to maintain position. FlatList usually handles prepending well if keys are stable.
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