import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { Button, Card, RadarChart, ReviewCard, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';
import type { MatchingDetailResponse } from '../../services/matching';
import { formatSleepHour } from '../../utils/time';

interface MatchDetailScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

const COMPARISON_LABELS: Record<string, string> = {
  smoking: '흡연',
  sleepTime: '취침 시간',
  noise: '소음 민감도',
  clean: '청결도',
  food: '실내 취식',
  temp: '온도',
  sleepHabits: '잠버릇',
};

const formatValue = (key: string, value: any) => {
  if (typeof value === 'boolean') return value ? 'O' : 'X';
  if (key === 'sleepTime') return formatSleepHour(Number(value));
  return value;
};

export function MatchDetailScreen({ route, navigation }: MatchDetailScreenProps) {
  const { userId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [detail, setDetail] = useState<MatchingDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      const response = await api.get<MatchingDetailResponse>(
        ENDPOINTS.MATCHING.DETAIL(userId)
      );
      setDetail(response);
    } catch (error) {
      console.error('Failed to fetch match detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    try {
      const response = await api.post<{ chatRoomId: string }>(
        ENDPOINTS.CHATS.CREATE,
        { targetUserId: String(userId) }
      );
      navigation.navigate('Chat', {
        chatRoomId: response.chatRoomId,
        userId: String(userId),
        userName: detail?.user.nickname,
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return themeColors.matchHigh;
    if (score >= 60) return themeColors.matchMedium;
    return themeColors.matchLow;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text.secondary }]}>
          프로필을 불러올 수 없습니다
        </Text>
      </View>
    );
  }

  const { user, lifestyle } = detail;

  // RadarChart Data Transformation
  const radarData = Object.entries(detail.comparison)
    .filter(([key]) => !['smoking', 'sleepHabits', 'sleepTime'].includes(key))
    .map(([key, item]) => ({
      label: COMPARISON_LABELS[key] || key,
      myValue: Number(item.me) * 20, // 1-5 scale to 20-100
      otherValue: Number(item.target) * 20,
    }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="상세 프로필"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* 프로필 헤더 */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <Text style={[styles.avatarText, { color: colors.text.secondary }]}>
                {user.nickname?.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.nickname, { color: colors.text.primary }]}>
                {user.nickname}
              </Text>
              <Text style={[styles.subInfo, { color: colors.text.secondary }]}>
                {user.studentId}학번 | {lifestyle?.dormNames}
              </Text>
              <Text style={[styles.subInfo, { color: colors.text.tertiary }]}>
                {user.nationality} | {user.gender === 'MALE' ? '남성' : '여성'}
              </Text>
            </View>
            <View
              style={[
                styles.scoreBadge,
                { backgroundColor: getScoreColor(detail.matchRate) + '20' },
              ]}>
              <Text
                style={[styles.scoreText, { color: getScoreColor(detail.matchRate) }]}>
                {detail.matchRate}%
              </Text>
              <Text style={[styles.scoreLabel, { color: colors.text.secondary }]}>
                호환성
              </Text>
            </View>
          </View>
        </Card>

        {/* 호환성 레이더 차트 */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            호환성 비교
          </Text>
          <RadarChart data={radarData} />
        </Card>

        {/* 상세 비교 */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            생활 습관 비교
          </Text>
          {Object.entries(detail.comparison).map(([key, item]) => (
            <View
              key={key}
              style={[styles.comparisonRow, { borderColor: colors.border }]}>
              <Text style={[styles.comparisonLabel, { color: colors.text.primary }]}>
                {COMPARISON_LABELS[key] || key}
              </Text>
              <View style={styles.comparisonValues}>
                <Text style={[styles.comparisonValue, { color: themeColors.primary }]}>
                  나: {formatValue(key, item.me)}
                </Text>
                <Text style={[styles.comparisonValue, { color: colors.text.tertiary }]}>
                  상대: {formatValue(key, item.target)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* 리뷰 섹션 */}
        <Card style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              이전 룸메이트 리뷰
            </Text>
            <View style={styles.reviewSummary}>
              <Text style={[styles.avgScore, { color: themeColors.warning }]}>
                ★ {detail.averageReviewScore.toFixed(1)}
              </Text>
              <Text style={[styles.reviewCountText, { color: colors.text.tertiary }]}>
                ({detail.reviewCount}개)
              </Text>
            </View>
          </View>

          {detail.reviews.length > 0 ? (
            detail.reviews.map(review => (
              <ReviewCard
                key={review.id}
                content={review.content}
                score={review.score}
                createdAt={review.createdAt}
              />
            ))
          ) : (
            <Text style={[styles.noReviews, { color: colors.text.tertiary }]}>
              아직 작성된 리뷰가 없습니다
            </Text>
          )}
        </Card>

        <Button
          title="대화하기"
          onPress={handleChat}
          fullWidth
        />
      </ScrollView>
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
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nickname: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subInfo: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  scoreBadge: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  scoreText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  comparisonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  comparisonValues: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  comparisonValue: {
    fontSize: fontSize.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avgScore: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  reviewCountText: {
    fontSize: fontSize.sm,
  },
  noReviews: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
  },
});
