import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface ReviewCardProps {
  reviewerName?: string;
  content: string;
  score: number;
  createdAt: string;
}

export function ReviewCard({ reviewerName, content, score, createdAt }: ReviewCardProps) {
  const { colors } = useTheme();

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Text
        key={i}
        style={[
          styles.star,
          { color: i < score ? themeColors.warning : colors.border },
        ]}>
        ★
      </Text>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.reviewerName, { color: colors.text.primary }]}>
          {reviewerName}
        </Text>
        <View style={styles.starsContainer}>{renderStars()}</View>
      </View>
      <Text style={[styles.content, { color: colors.text.secondary }]}>{content}</Text>
      <Text style={[styles.date, { color: colors.text.tertiary }]}>{createdAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: fontSize.md,
    marginLeft: 2,
  },
  content: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: fontSize.xs,
  },
});
