import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface WeightCategory {
  key: string;
  label: string;
  icon?: string;
}

interface WeightAllocatorProps {
  categories: readonly WeightCategory[] | WeightCategory[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  totalBudget: number;
  unitAmount: number;
  currencySymbol?: string;
}

export function WeightAllocator({
  categories,
  values,
  onChange,
  totalBudget,
  unitAmount,
  currencySymbol = '₩',
}: WeightAllocatorProps) {
  const { colors } = useTheme();

  const totalAllocated = Object.values(values).reduce(
    (sum, v) => sum + v * unitAmount,
    0,
  );
  const remaining = totalBudget - totalAllocated;

  const handleIncrement = (key: string) => {
    if (remaining >= unitAmount) {
      onChange(key, (values[key] || 0) + 1);
    }
  };

  const handleDecrement = (key: string) => {
    if ((values[key] || 0) > 0) {
      onChange(key, (values[key] || 0) - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.budgetContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.budgetLabel, { color: colors.text.secondary }]}>
          남은 금액
        </Text>
        <Text
          style={[
            styles.budgetAmount,
            { color: remaining > 0 ? themeColors.primary : themeColors.success },
          ]}>
          {currencySymbol}
          {remaining.toLocaleString()}
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map(category => {
          const allocated = (values[category.key] || 0) * unitAmount;
          return (
            <View
              key={category.key}
              style={[styles.categoryRow, { borderColor: colors.border }]}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryLabel, { color: colors.text.primary }]}>
                  {category.label}
                </Text>
                <Text style={[styles.categoryAmount, { color: themeColors.primary }]}>
                  {currencySymbol}
                  {allocated.toLocaleString()}
                </Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    {
                      backgroundColor:
                        values[category.key] > 0 ? colors.surface : colors.border,
                    },
                  ]}
                  onPress={() => handleDecrement(category.key)}
                  disabled={!values[category.key]}>
                  <Text
                    style={[
                      styles.controlText,
                      { color: colors.text.primary },
                    ]}>
                    -
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.countText, { color: colors.text.primary }]}>
                  {values[category.key] || 0}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    {
                      backgroundColor:
                        remaining >= unitAmount ? themeColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleIncrement(category.key)}
                  disabled={remaining < unitAmount}>
                  <Text style={styles.controlTextWhite}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  budgetContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  budgetAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  categoriesContainer: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  categoryAmount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  controlTextWhite: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  countText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    minWidth: 24,
    textAlign: 'center',
  },
});
