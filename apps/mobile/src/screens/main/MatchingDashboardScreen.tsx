import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { MatchCard, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';

interface MatchingUser {
  id: string;
  nickname: string | null;
  studentId: number;
  nationality: string;
  dormNames: string;
  matchRate: number;
  keywords: string[];
  isSmoker: boolean;
  sleepStart: number;
}

interface MatchingDashboardScreenProps {
  navigation: any;
}

export function MatchingDashboardScreen({ navigation }: MatchingDashboardScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [matches, setMatches] = useState<MatchingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMatches = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      }

      // 정렬은 항상 매칭률순으로 고정
      const response = await api.get<{ data: MatchingUser[]; total: number }>(
        `${ENDPOINTS.MATCHING.RECOMMENDATIONS}?page=${pageNum}&limit=10&sortBy=matchRate`
      );

      const items = response.data ?? [];

      if (refresh || pageNum === 1) {
        setMatches(items);
      } else {
        setMatches(prev => [...prev, ...items]);
      }

      setHasMore(items.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(1, true);
  }, []);

  const handleRefresh = () => {
    fetchMatches(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchMatches(page + 1);
    }
  };

  const handleChat = async (userId: string) => {
    try {
      const response = await api.post<{ chatRoomId: string }>(
        ENDPOINTS.CHATS.CREATE,
        { targetUserId: userId }
      );
      navigation.navigate('Chat', { chatRoomId: response.chatRoomId, userId });
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const renderItem = ({ item }: { item: MatchingUser }) => (
    <MatchCard
      id={item.id}
      nickname={item.nickname}
      studentId={item.studentId}
      matchRate={item.matchRate}
      keywords={item.keywords}
      dormNames={item.dormNames}
      onPress={() => navigation.navigate('MatchDetail', { userId: item.id })}
      onChat={() => handleChat(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.resultCount, { color: colors.text.secondary }]}>
        {matches?.length ?? 0}명의 룸메이트 후보
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        아직 매칭된 룸메이트가 없습니다
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={themeColors.primary} />
      </View>
    );
  };

  if (isLoading && matches.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="룸메이트 찾기" />

      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultCount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});