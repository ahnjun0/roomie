import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { RoomBtiBadge } from './RoomBtiBadge';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors, shadows } from '../constants/theme';

interface MatchCardProps {
  id: string;
  nickname: string | null;
  studentId: number;
  matchRate: number;
  keywords: string[];
  dormNames: string;
  roomBtiAnimal?: string | null;
  onPress: () => void;
  onChat: () => void;
}

export function MatchCard({
  nickname,
  studentId,
  matchRate,
  keywords = [],
  dormNames,
  roomBtiAnimal,
  onPress,
  onChat,
}: MatchCardProps) {
  const { colors } = useTheme();

  const getScoreColor = () => {
    if (matchRate >= 80) return themeColors.matchHigh;
    if (matchRate >= 60) return themeColors.matchMedium;
    return themeColors.matchLow;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }, shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Text style={[styles.avatarText, { color: colors.text.secondary }]}>
              {nickname?.charAt(0) || '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.nickname, { color: colors.text.primary }]}>
              {nickname}
            </Text>
            <Text style={[styles.studentId, { color: colors.text.secondary }]}>
              {studentId}학번 | {dormNames}
            </Text>
          </View>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() + '20' }]}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>
            {matchRate}%
          </Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {keywords.slice(0, 4).map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: colors.tag.background }]}>
            <Text style={[styles.tagText, { color: colors.tag.text }]}>{tag}</Text>
          </View>
        ))}
      </View>

      {roomBtiAnimal && (
        <View style={styles.roomBtiContainer}>
          <RoomBtiBadge animal={roomBtiAnimal} size="small" />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
          onPress={onChat}
          activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>대화하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, { borderColor: colors.border }]}
          onPress={onPress}
          activeOpacity={0.7}>
          <Text style={[styles.actionButtonOutlineText, { color: colors.text.primary }]}>
            상세보기
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  nickname: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  studentId: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scoreText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  roomBtiContainer: {
    marginBottom: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  actionButtonOutline: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonOutlineText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
