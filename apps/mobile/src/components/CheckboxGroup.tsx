import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  label?: string;
  options: readonly CheckboxOption[] | CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
}

export function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  maxSelections,
}: CheckboxGroupProps) {
  const { colors } = useTheme();

  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue));
    } else {
      if (maxSelections && values.length >= maxSelections) {
        return;
      }
      onChange([...values, optionValue]);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      )}
      <View style={styles.optionsContainer}>
        {options.map(option => {
          const isSelected = values.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleToggle(option.value)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text.primary },
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
  },
});
