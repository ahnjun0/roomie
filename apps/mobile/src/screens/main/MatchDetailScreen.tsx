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
import { Button, Card, ReviewCard, Header, RadarChart } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';
import type { MatchingDetailResponse } from '../../services/matching';

interface MatchDetailScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

const COMPARISON_LABELS: Record<string, string> = {
  smoking: '?°Ïó∞',
  sleepSchedule: '?òÎ©¥ ?ºÏ†ï',
  noise: '?åÏùå ÎØºÍ∞ê??,
  clean: 'Ï≤?≤∞??,
  food: '?§ÎÇ¥ Ï∑®Ïãù',
  temp: '?®ÎèÑ',
  sleepHabits: '?†Î≤ÑÎ¶?,
};

const formatValue = (key: string, value: any) => {
  if (typeof value === 'boolean') return value ? 'O' : 'X';
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
          ?ÑÎ°ú?ÑÏùÑ Î∂àÎü¨?????ÜÏäµ?àÎã§
        </Text>
      </View>
    );
  }

  const { user, lifestyle } = detail;

  const chartItems = [
    { key: 'noise', label: 'Noise' },
    { key: 'clean', label: 'Clean' },
    { key: 'food', label: 'Food' },
    { key: 'sleepHabits', label: 'Habit' },
    { key: 'sleepSchedule', label: 'Time' },
    { key: 'temp', label: 'Temp' },
  ];

  const toRadarValue = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    const clamped = Math.max(0, Math.min(2, value));
    return (clamped / 2) * 5;
  };

  const radarData = chartItems.map(item => ({
    label: item.label,
    myValue: toRadarValue(Number(detail.comparison[item.key]?.me ?? 0)),
    otherValue: toRadarValue(Number(detail.comparison[item.key]?.target ?? 0)),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="?ÅÏÑ∏ ?ÑÎ°ú??
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* ?ÑÎ°ú???§Îçî */}
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
                {user.studentId}?ôÎ≤à | {lifestyle?.dormNames}
              </Text>
              <Text style={[styles.subInfo, { color: colors.text.tertiary }]}>
                {user.nationality} | {user.gender === 'MALE' ? '?®ÏÑ±' : '?¨ÏÑ±'}
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
                ?†ÏÇ¨??
              </Text>
            </View>
          </View>
        </Card>

        {/* ?†ÏÇ¨???àÏù¥??Ï∞®Ìä∏ */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            ?†ÏÇ¨??ÎπÑÍµê
          </Text>
          <RadarChart data={radarData} />
        </Card>

        {/* ?ÅÏÑ∏ ÎπÑÍµê */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            ?ùÌôú ?µÍ? ÎπÑÍµê
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
                  ?? {formatValue(key, item.me)}
                </Text>
                <Text style={[styles.comparisonValue, { color: colors.text.tertiary }]}>
                  ?ÅÎ?: {formatValue(key, item.target)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Î¶¨Î∑∞ ?πÏÖò */}
        <Card style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              ?¥Ï†Ñ Î£∏Î©î?¥Ìä∏ Î¶¨Î∑∞
            </Text>
            <View style={styles.reviewSummary}>
              <Text style={[styles.avgScore, { color: themeColors.warning }]}>
                ??{detail.averageReviewScore.toFixed(1)}
              </Text>
              <Text style={[styles.reviewCountText, { color: colors.text.tertiary }]}>
                ({detail.reviewCount}Í∞?
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
              ?ÑÏßÅ ?ëÏÑ±??Î¶¨Î∑∞Í∞Ä ?ÜÏäµ?àÎã§
            </Text>
          )}
        </Card>

        <Button
          title="?Ä?îÌïòÍ∏?
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

