import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../contexts';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface RoomBtiBadgeProps {
  animal: string;
  result?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showLabel?: boolean;
  style?: ViewStyle;
}

// 동물 이모지 매핑
const ANIMAL_EMOJIS: Record<string, string> = {
  '부지런한 미어캣': '🦔',
  '활발한 비버': '🦫',
  '꼼꼼한 올빼미': '🦉',
  '사교적인 고양이': '🐱',
  '자유로운 강아지': '🐕',
  '느긋한 호랑이': '🐯',
  '파티피플 앵무새': '🦜',
  '마이페이스 하마': '🦛',
  '깔끔쟁이 다람쥐': '🐿️',
  '독립적인 고슴도치': '🦔',
  '예민한 여우': '🦊',
  '신비로운 판다': '🐼',
  '순한 양': '🐑',
  '평화로운 코알라': '🐨',
  '감성적인 토끼': '🐰',
  '느긋한 나무늘보': '🦥',
};

export function RoomBtiBadge({
  animal,
  result,
  size = 'medium',
  onPress,
  showLabel = true,
  style,
}: RoomBtiBadgeProps) {
  const { colors: themeColors } = useTheme();

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          paddingH: spacing.sm,
          paddingV: spacing.xs,
          emojiSize: 16,
          textSize: fontSize.xs,
          gap: spacing.xs,
        };
      case 'large':
        return {
          paddingH: spacing.lg,
          paddingV: spacing.md,
          emojiSize: 32,
          textSize: fontSize.lg,
          gap: spacing.md,
        };
      default:
        return {
          paddingH: spacing.md,
          paddingV: spacing.sm,
          emojiSize: 20,
          textSize: fontSize.sm,
          gap: spacing.sm,
        };
    }
  };

  const config = getSizeConfig();
  const emoji = ANIMAL_EMOJIS[animal] || '🐾';

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary + '15',
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
          gap: config.gap,
        },
        style,
      ]}>
      <Text style={{ fontSize: config.emojiSize }}>{emoji}</Text>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: colors.primary, fontSize: config.textSize },
          ]}
          numberOfLines={1}>
          {animal}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  label: {
    fontWeight: fontWeight.medium,
  },
});
