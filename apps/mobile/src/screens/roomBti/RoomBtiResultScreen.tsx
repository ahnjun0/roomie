import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { Header, Button, Card } from '../../components';
import { spacing, fontSize, fontWeight, borderRadius, colors } from '../../constants/theme';

interface RoomBtiResultScreenProps {
  route: {
    params: {
      result: string;
      animal: string;
      description: string;
      imageKey: string;
    };
  };
  navigation: any;
}

// 동물 이모지 매핑
const ANIMAL_EMOJIS: Record<string, string> = {
  meerkat: '🦔',
  beaver: '🦫',
  owl: '🦉',
  cat: '🐱',
  dog: '🐕',
  capybara: '🦛',
  parrot: '🦜',
  hippo: '🦛',
  squirrel: '🐿️',
  hedgehog: '🦔',
  fox: '🦊',
  panda: '🐼',
  sheep: '🐑',
  koala: '🐨',
  rabbit: '🐰',
  sloth: '🦥',
};

// 유형 설명 매핑
const TYPE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  0: { S: '공유형 (Social)', P: '개인형 (Private)' },
  1: { C: '청결형 (Clean)', F: '자유형 (Free)' },
  2: { D: '아침형 (Day)', N: '올빼미형 (Night)' },
  3: { S: '예민형 (Sensitive)', I: '둔감형 (Insensitive)' },
};

export function RoomBtiResultScreen({ route, navigation }: RoomBtiResultScreenProps) {
  const { result, animal, description, imageKey } = route.params;
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleApplyToProfile = () => {
    // 결과는 이미 백엔드에서 프로필에 저장됨
    navigation.navigate('MainTabs', { screen: 'MyPage' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏠 나의 Room-BTI 결과: ${animal} (${result})\n\n${description}\n\nRoomie 앱에서 나만의 룸메이트 성향을 알아보세요!`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRetakeTest = () => {
    navigation.replace('RoomBtiTest');
  };

  const getTypeDescription = (char: string, index: number): string => {
    const descriptions = TYPE_DESCRIPTIONS[index.toString()];
    return descriptions?.[char] || char;
  };

  const emoji = ANIMAL_EMOJIS[imageKey] || '🐾';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="테스트 결과" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* Result Card */}
        <Card style={styles.resultCard}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.animalName, { color: themeColors.text.primary }]}>
            {animal}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.typeText, { color: colors.primary }]}>{result}</Text>
          </View>
          <Text style={[styles.description, { color: themeColors.text.secondary }]}>
            {description}
          </Text>
        </Card>

        {/* Type Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={[styles.breakdownTitle, { color: themeColors.text.primary }]}>
            유형 분석
          </Text>
          {result.split('').map((char, index) => (
            <View
              key={index}
              style={[
                styles.breakdownItem,
                index < result.length - 1 && {
                  borderBottomWidth: 1,
                  borderColor: themeColors.border,
                },
              ]}>
              <View style={[styles.charBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.charText}>{char}</Text>
              </View>
              <Text style={[styles.breakdownText, { color: themeColors.text.primary }]}>
                {getTypeDescription(char, index)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="프로필에 적용하기" onPress={handleApplyToProfile} fullWidth />
          <Button
            title="결과 공유하기"
            variant="outline"
            onPress={handleShare}
            fullWidth
          />
          <Button
            title="다시 테스트하기"
            variant="ghost"
            onPress={handleRetakeTest}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  resultCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  animalName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  typeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 4,
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  breakdownCard: {
    marginBottom: spacing.lg,
  },
  breakdownTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  charBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  charText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  breakdownText: {
    fontSize: fontSize.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
