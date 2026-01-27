import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  options: readonly RadioOption[] | RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  horizontal?: boolean;
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  horizontal = false,
}: RadioGroupProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      )}
      <View style={[styles.optionsContainer, horizontal && styles.horizontal]}>
        {options.map(option => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                horizontal && styles.horizontalOption,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? '#FFFFFF' : colors.text.primary },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalOption: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
