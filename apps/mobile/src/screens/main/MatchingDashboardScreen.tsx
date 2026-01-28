import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useAuth } from '../../contexts';
import { MatchCard, Header, Button } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';

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
  roomBtiAnimal: string | null;
  roomBtiResult: string | null;
}

interface RoommateInfo {
  userId: string;
  nickname: string | null;
  studentId: number;
  nationality: string;
  dormNames: string;
  chatRoomId: string;
  endSemesterMe: boolean;
  endSemesterPartner: boolean;
}

interface ConnectionUser {
  userId: string;
  nickname: string | null;
  chatRoomId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface PastRoommateUser {
  userId: string;
  nickname: string | null;
  studentId: number;
}

interface MatchingDashboardScreenProps {
  navigation: any;
}

export function MatchingDashboardScreen({ navigation }: MatchingDashboardScreenProps) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [matches, setMatches] = useState<MatchingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Connections state
  const [activeChats, setActiveChats] = useState<ConnectionUser[]>([]);
  const [pastRoommates, setPastRoommates] = useState<PastRoommateUser[]>([]);

  // Roommate state (for MATCHED status)
  const [roommate, setRoommate] = useState<RoommateInfo | null>(null);
  const [isEndingSemester, setIsEndingSemester] = useState(false);

  const isMatched = user?.matchingStatus === 'MATCHED';

  // Refresh user on focus
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  const fetchRoommate = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<RoommateInfo>(ENDPOINTS.MATCHING.ROOMMATE);
      setRoommate(response);
    } catch (error: any) {
      // 서버에서 이미 SEARCHING으로 변경된 경우 사용자 상태 동기화
      if (error?.message?.includes('NOT_MATCHED')) {
        await refreshUser();
      }
      setRoommate(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const fetchConnections = useCallback(async () => {
    try {
      const response = await api.get<{
        activeChats: ConnectionUser[];
        pastRoommates: PastRoommateUser[];
      }>(ENDPOINTS.MATCHING.CONNECTIONS);
      setActiveChats(response.activeChats ?? []);
      setPastRoommates(response.pastRoommates ?? []);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  }, []);

  const fetchMatches = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      }

      const response = await api.get<{ data: MatchingUser[]; total: number }>(
        `${ENDPOINTS.MATCHING.RECOMMENDATIONS}?page=${pageNum}&limit=10&sortBy=matchRate`
      );

      const items = response.data ?? [];
      setTotalCount(response.total ?? 0);

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
    if (isMatched) {
      fetchRoommate();
    } else {
      fetchMatches(1, true);
      fetchConnections();
    }
  }, [isMatched, fetchRoommate, fetchMatches, fetchConnections]);

  const handleRefresh = () => {
    if (isMatched) {
      fetchRoommate();
    } else {
      fetchMatches(1, true);
      fetchConnections();
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading && !isMatched) {
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

  const handleEndSemester = () => {
    Alert.alert(
      '학기 끝내기',
      '학기를 끝내고 룸메이트를 평가하시겠습니까?\n상대방도 학기 끝내기를 해야 매칭이 해제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            setIsEndingSemester(true);
            try {
              const response = await api.post<{
                targetUserId: string;
                targetNickname: string | null;
                bothEnded: boolean;
              }>(ENDPOINTS.MATCHING.END_SEMESTER);

              // Navigate to review screen
              navigation.navigate('RoommateReview', {
                targetUserId: response.targetUserId,
                targetNickname: response.targetNickname ?? '룸메이트',
                bothEnded: response.bothEnded,
              });
            } catch (error: any) {
              Alert.alert('오류', error.message || '학기 끝내기에 실패했습니다.');
            } finally {
              setIsEndingSemester(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MatchingUser }) => (
    <MatchCard
      id={item.id}
      nickname={item.nickname}
      studentId={item.studentId}
      matchRate={item.matchRate}
      keywords={item.keywords}
      dormNames={item.dormNames}
      roomBtiAnimal={item.roomBtiAnimal}
      onPress={() => navigation.navigate('MatchDetail', { userId: item.id })}
      onChat={() => handleChat(item.id)}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Active Chats Section */}
      {activeChats.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            대화 중인 상대
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {activeChats.map(chat => (
              <TouchableOpacity
                key={chat.userId}
                style={[styles.connectionCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('Chat', {
                  chatRoomId: chat.chatRoomId,
                  userId: chat.userId,
                  userName: chat.nickname,
                })}
                activeOpacity={0.7}
              >
                <View style={[styles.connectionAvatar, { backgroundColor: themeColors.primary + '20' }]}>
                  <Text style={[styles.connectionAvatarText, { color: themeColors.primary }]}>
                    {chat.nickname?.charAt(0) || '?'}
                  </Text>
                </View>
                <Text
                  style={[styles.connectionName, { color: colors.text.primary }]}
                  numberOfLines={1}
                >
                  {chat.nickname ?? '알 수 없음'}
                </Text>
                {chat.lastMessage && (
                  <Text
                    style={[styles.connectionSubtext, { color: colors.text.tertiary }]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Past Roommates Section */}
      {pastRoommates.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            지난 룸메이트
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {pastRoommates.map(rm => (
              <TouchableOpacity
                key={rm.userId}
                style={[styles.connectionCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('MatchDetail', { userId: rm.userId })}
                activeOpacity={0.7}
              >
                <View style={[styles.connectionAvatar, { backgroundColor: themeColors.info + '20' }]}>
                  <Text style={[styles.connectionAvatarText, { color: themeColors.info }]}>
                    {rm.nickname?.charAt(0) || '?'}
                  </Text>
                </View>
                <Text
                  style={[styles.connectionName, { color: colors.text.primary }]}
                  numberOfLines={1}
                >
                  {rm.nickname ?? '알 수 없음'}
                </Text>
                <Text style={[styles.connectionSubtext, { color: colors.text.tertiary }]}>
                  {rm.studentId}학번
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Result Count */}
      <View style={styles.listHeader}>
        <Text style={[styles.resultCount, { color: colors.text.secondary }]}>
          {totalCount}명의 룸메이트 후보
        </Text>
      </View>
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

  if (isLoading && (isMatched ? !roommate : matches.length === 0)) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  // MATCHED status: show roommate info
  if (isMatched && roommate) {
    const nationalityLabel = roommate.nationality === 'KOREAN' ? '한국인' : '외국인';
    const iAlreadyEnded = roommate.endSemesterMe;
    const partnerEnded = roommate.endSemesterPartner;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="나의 룸메이트" />

        <View style={[styles.roommateContent, { paddingBottom: insets.bottom + spacing.lg }]}>
          {/* End semester status banner */}
          {(iAlreadyEnded || partnerEnded) && (
            <View style={[styles.statusBanner, { backgroundColor: themeColors.warning + '20', borderColor: themeColors.warning }]}>
              <Text style={[styles.statusBannerText, { color: themeColors.warning }]}>
                {iAlreadyEnded && !partnerEnded
                  ? '학기 끝내기 완료 - 상대방의 확인을 기다리고 있습니다'
                  : !iAlreadyEnded && partnerEnded
                  ? '상대방이 학기 끝내기를 요청했습니다'
                  : ''}
              </Text>
            </View>
          )}

          {/* Roommate profile card */}
          <View style={[styles.roommateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatarCircle, { backgroundColor: themeColors.primary + '20' }]}>
              <Text style={styles.avatarText}>
                {roommate.nickname ? roommate.nickname.charAt(0) : '?'}
              </Text>
            </View>

            <Text style={[styles.roommateName, { color: colors.text.primary }]}>
              {roommate.nickname ?? '알 수 없음'}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.text.tertiary }]}>학번</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {roommate.studentId}학번
                </Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.text.tertiary }]}>국적</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {nationalityLabel}
                </Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.text.tertiary }]}>기숙사</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {roommate.dormNames}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat button */}
          <Button
            title="채팅하기"
            onPress={() => navigation.navigate('Chat', {
              chatRoomId: roommate.chatRoomId,
              userId: roommate.userId,
              userName: roommate.nickname,
            })}
            fullWidth
          />

          {/* End semester button */}
          <View style={styles.endSemesterContainer}>
            <Button
              title={iAlreadyEnded ? '상대방 대기 중...' : '학기 끝내기'}
              onPress={handleEndSemester}
              variant="outline"
              loading={isEndingSemester}
              disabled={iAlreadyEnded}
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }

  // SEARCHING status: show matching list
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
  // Connections sections
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  horizontalScroll: {
    gap: spacing.sm,
  },
  connectionCard: {
    width: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  connectionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  connectionAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  connectionName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: 2,
  },
  connectionSubtext: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  // Match list
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
  // Roommate (MATCHED) styles
  roommateContent: {
    flex: 1,
    padding: spacing.lg,
  },
  statusBanner: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  roommateCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: themeColors.primary,
  },
  roommateName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  infoDivider: {
    width: 1,
    height: 32,
  },
  endSemesterContainer: {
    marginTop: spacing.sm,
  },
});
