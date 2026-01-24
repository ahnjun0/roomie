import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface ScaleSelectorProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function ScaleSelector({
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 5,
  leftLabel,
  rightLabel,
}: ScaleSelectorProps) {
  const { colors } = useTheme();
  const levels = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          {description}
        </Text>
      )}
      <View style={styles.scaleContainer}>
        {levels.map(level => {
          const isSelected = value === level;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.scaleButton,
                {
                  backgroundColor: isSelected ? themeColors.primary : colors.surface,
                  borderColor: isSelected ? themeColors.primary : colors.border,
                },
              ]}
              onPress={() => onChange(level)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.scaleText,
                  { color: isSelected ? '#FFFFFF' : colors.text.primary },
                ]}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {(leftLabel || rightLabel) && (
        <View style={styles.labelsRow}>
          <Text style={[styles.endLabel, { color: colors.text.tertiary }]}>
            {leftLabel}
          </Text>
          <Text style={[styles.endLabel, { color: colors.text.tertiary }]}>
            {rightLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  endLabel: {
    fontSize: fontSize.xs,
  },
});
