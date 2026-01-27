import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface WeightOption {
  label: string;
  title: string;
  desc: string;
}

interface WeightCategory {
  key: string;
  emoji: string;
  label: string;
  tag: string;
  options: {
    high: WeightOption;
    mid: WeightOption;
    low: WeightOption;
  };
}

interface WeightAllocatorProps {
  categories: readonly WeightCategory[] | WeightCategory[];
  values: Record<string, number>; // 3 = 3만원, 1 = 1만원, 0 = 0원
  onChange: (key: string, value: number) => void;
  totalBudget: number;
  unitAmount: number;
}

// 선택된 금액에 따른 색상
const getOptionColor = (value: number, selected: boolean) => {
  if (!selected) return { bg: 'transparent', border: '#E0E0E0', text: '#9E9E9E', subText: '#BDBDBD' };

  switch (value) {
    case 3: // 3만원 - 완벽한 룸메 (primary)
      return { bg: themeColors.primary + '15', border: themeColors.primary, text: themeColors.primary, subText: themeColors.primary + 'CC' };
    case 1: // 1만원 - 적당한 인간미 (yellow/orange)
      return { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00', subText: '#FB8C00' };
    case 0: // 0원 - 지옥의 룸메 (gray)
      return { bg: '#F5F5F5', border: '#9E9E9E', text: '#757575', subText: '#9E9E9E' };
    default:
      return { bg: 'transparent', border: '#E0E0E0', text: '#9E9E9E', subText: '#BDBDBD' };
  }
};

export function WeightAllocator({
  categories,
  values,
  onChange,
  totalBudget,
  unitAmount,
}: WeightAllocatorProps) {
  const { colors } = useTheme();

  const totalAllocated = Object.values(values).reduce(
    (sum, v) => sum + v * unitAmount,
    0,
  );
  const remaining = totalBudget - totalAllocated;
  const isComplete = remaining === 0;

  const handleSelect = (key: string, value: number) => {
    const currentValue = values[key] || 1;
    const diff = (value - currentValue) * unitAmount;

    // 예산 초과 체크 (값을 올릴 때만)
    if (diff > 0 && diff > remaining) {
      return;
    }

    onChange(key, value);
  };

  const getSelectedOption = (category: WeightCategory) => {
    const value = values[category.key] ?? 1;
    if (value === 3) return category.options.high;
    if (value === 0) return category.options.low;
    return category.options.mid;
  };

  return (
    <View style={styles.container}>
      {/* 남은 금액 표시 */}
      <View style={[styles.budgetContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.budgetLabel, { color: colors.text.secondary }]}>
          남은 금액
        </Text>
        <Text
          style={[
            styles.budgetAmount,
            { color: isComplete ? themeColors.success : themeColors.primary },
          ]}>
          ₩{remaining.toLocaleString()}
        </Text>
        {!isComplete && (
          <Text style={[styles.budgetHint, { color: colors.text.tertiary }]}>
            6만원을 모두 배분해주세요
          </Text>
        )}
      </View>

      {/* 카테고리 카드들 */}
      <View style={styles.categoriesContainer}>
        {categories.map(category => {
          const currentValue = values[category.key] ?? 1;
          const selectedOption = getSelectedOption(category);

          return (
            <View
              key={category.key}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* 카드 헤더 */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                  <Text style={styles.emoji}>{category.emoji}</Text>
                </View>
                <View style={styles.headerText}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.categoryLabel, { color: colors.text.primary }]}>
                      {category.label}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: themeColors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: themeColors.primary }]}>
                        {category.tag}
                      </Text>
                    </View>
                  </View>
                  {/* 선택된 옵션의 상세 설명 */}
                  <Text style={[styles.selectedDesc, { color: colors.text.secondary }]} numberOfLines={2}>
                    {selectedOption.desc}
                  </Text>
                </View>
              </View>

              {/* 3만원 / 1만원 / 0원 선택 버튼들 */}
              <View style={styles.optionsRow}>
                {/* 3만원 버튼 (High) */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: getOptionColor(3, currentValue === 3).bg,
                      borderColor: getOptionColor(3, currentValue === 3).border,
                    },
                  ]}
                  onPress={() => handleSelect(category.key, 3)}
                  disabled={currentValue !== 3 && remaining < (3 - currentValue) * unitAmount}>
                  <Text style={[styles.optionAmount, { color: getOptionColor(3, currentValue === 3).text }]}>3만원</Text>
                  <Text style={[styles.optionTitle, { color: getOptionColor(3, currentValue === 3).text }]} numberOfLines={1}>{category.options.high.title}</Text>
                </TouchableOpacity>

                {/* 1만원 버튼 (Mid) */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: getOptionColor(1, currentValue === 1).bg,
                      borderColor: getOptionColor(1, currentValue === 1).border,
                    },
                  ]}
                  onPress={() => handleSelect(category.key, 1)}>
                  <Text style={[styles.optionAmount, { color: getOptionColor(1, currentValue === 1).text }]}>1만원</Text>
                  <Text style={[styles.optionTitle, { color: getOptionColor(1, currentValue === 1).text }]} numberOfLines={1}>{category.options.mid.title}</Text>
                </TouchableOpacity>

                {/* 0원 버튼 (Low) */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: getOptionColor(0, currentValue === 0).bg,
                      borderColor: getOptionColor(0, currentValue === 0).border,
                    },
                  ]}
                  onPress={() => handleSelect(category.key, 0)}>
                  <Text style={[styles.optionAmount, { color: getOptionColor(0, currentValue === 0).text }]}>0원</Text>
                  <Text style={[styles.optionTitle, { color: getOptionColor(0, currentValue === 0).text }]} numberOfLines={1}>{category.options.low.title}</Text>
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
    gap: spacing.md,
  },
  budgetContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
  },
  budgetHint: {
    fontSize: 10,
    marginTop: 2,
  },
  categoriesContainer: {
    gap: spacing.sm,
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  selectedDesc: {
    fontSize: 10,
    lineHeight: 12,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  optionTitle: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});
