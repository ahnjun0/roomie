import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, colors as themeColors } from '../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const { colors } = useTheme();
  const progress = (current / total) * 100;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          {current} / {total}
        </Text>
      )}
      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: themeColors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  track: {
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
