import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { useTheme } from '../contexts';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface SliderProps {
  label?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  leftLabel,
  rightLabel,
  showValue = false,
  formatValue,
}: SliderProps) {
  const { colors, isDark } = useTheme();

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            {label}
          </Text>
          {showValue && (
            <Text style={[styles.value, { color: themeColors.primary }]}>
              {displayValue}
            </Text>
          )}
        </View>
      )}
      <RNSlider
        style={styles.slider}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={themeColors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={themeColors.primary}
      />
      {(leftLabel || rightLabel) && (
        <View style={styles.labelsRow}>
          <Text style={[styles.endLabel, { color: colors.text.secondary }]}>
            {leftLabel}
          </Text>
          <Text style={[styles.endLabel, { color: colors.text.secondary }]}>
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
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  value: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  endLabel: {
    fontSize: fontSize.xs,
  },
});
