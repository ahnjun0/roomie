import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';

interface ChatRoom {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface ChatListScreenProps {
  navigation: any;
}

export function ChatListScreen({ navigation }: ChatListScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChatRooms = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      }

      // Backend returns { data: ChatRoomListItem[] }
      const response = await api.get<{ data: any[] }>(ENDPOINTS.CHATS.LIST);
      
      const formattedRooms: ChatRoom[] = response.data.map((item) => ({
        id: item.chatRoomId,
        otherUserId: item.participant.id,
        otherUserName: item.participant.nickname || '알 수 없음',
        lastMessage: item.lastMessage?.content || null,
        lastMessageAt: item.lastMessage?.createdAt || null,
        unreadCount: item.unreadCount,
      }));

      setChatRooms(formattedRooms);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate('Chat', {
          chatRoomId: item.id,
          userId: item.otherUserId,
          userName: item.otherUserName,
        })
      }
      activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
        <Text style={[styles.avatarText, { color: colors.text.secondary }]}>
          {item.otherUserName?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {item.otherUserName}
          </Text>
          {item.lastMessageAt && (
            <Text style={[styles.time, { color: colors.text.tertiary }]}>
              {formatTime(item.lastMessageAt)}
            </Text>
          )}
        </View>
        <View style={styles.chatFooter}>
          <Text
            style={[styles.lastMessage, { color: colors.text.secondary }]}
            numberOfLines={1}>
            {item.lastMessage || '대화를 시작하세요'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        아직 대화가 없습니다
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
        매칭 탭에서 룸메이트를 찾아보세요
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="메시지" />

      <FlatList
        data={chatRooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          chatRooms.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchChatRooms(true)}
            tintColor={themeColors.primary}
          />
        }
      />
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
  listContent: {
    paddingTop: spacing.sm,
  },
  listContentEmpty: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  time: {
    fontSize: fontSize.xs,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
  },
});
