import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding, useAuth } from '../../contexts';
import { Button, WeightAllocator, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { WEIGHT_CATEGORIES, ONBOARDING_STEPS } from '../../constants/data';

interface WeightGameScreenProps {
  navigation: any;
}

const TOTAL_BUDGET = 70000; // 7만원
const UNIT_AMOUNT = 10000; // 1만원 단위

export function WeightGameScreen({ navigation }: WeightGameScreenProps) {
  const { colors } = useTheme();
  const { submitLifestyle, submitPreferences } = useOnboarding();
  const { refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  // 초기값: 각 항목 1만원씩 (총 7만원)
  // 값 의미: 3 = 3만원, 1 = 1만원, 0 = 0원
  const [weights, setWeights] = useState<Record<string, number>>({
    noise: 2,
    cleanliness: 1,
    food: 1,
    habit: 1,
    time: 1,
    temp: 1,
  });

  const totalAllocated = Object.values(weights).reduce(
    (sum, v) => sum + v * UNIT_AMOUNT,
    0
  );
  const isValid = totalAllocated === TOTAL_BUDGET;

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = async () => {
    console.log('[WeightGame] handleComplete called');
    console.log('[WeightGame] isValid:', isValid, 'totalAllocated:', totalAllocated);
    console.log('[WeightGame] weights:', weights);

    if (!isValid) {
      Alert.alert('알림', '7만원을 모두 배분해주세요.');
      return;
    }

    setIsLoading(true);
    console.log('[WeightGame] Starting profile submission...');

    try {
      // 가중치 데이터를 백엔드 형식으로 변환
      // 프론트엔드: 0, 1, 3 (만원 단위)
      // 백엔드: 0-70 범위, 총합 70 (10배)
      const weightData = {
        weightNoise: weights.noise * 10,
        weightClean: weights.cleanliness * 10,
        weightFood: weights.food * 10,
        weightHabit: weights.habit * 10,
        weightTime: weights.time * 10,
        weightTemp: weights.temp * 10,
      };
      console.log('[WeightGame] weightData:', weightData);

      // 모든 데이터 제출
      console.log('[WeightGame] Submitting lifestyle...');
      await submitLifestyle();
      console.log('[WeightGame] Lifestyle submitted');

      console.log('[WeightGame] Submitting preferences...');
      await submitPreferences(weightData);
      console.log('[WeightGame] Preferences submitted');

      // 사용자 정보 새로고침 (isProfileComplete가 true가 되어야 메인 화면으로 전환)
      console.log('[WeightGame] Refreshing user...');
      await refreshUser();
      console.log('[WeightGame] User refreshed, profile complete!');
    } catch (error: any) {
      console.error('[WeightGame] Profile completion error:', error);
      Alert.alert('오류', error.message || '프로필 설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="중요도 설정"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.WEIGHT_GAME} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
            이것만은 양보 못 해
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            7만원 배분 게임
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            각 항목에 3만원, 1만원, 0원을 배분해주세요.{'\n'}
            배분 금액이 높을수록 해당 조건이 중요하게 반영됩니다.
          </Text>
        </View>

        <WeightAllocator
          categories={WEIGHT_CATEGORIES}
          values={weights}
          onChange={handleWeightChange}
          totalBudget={TOTAL_BUDGET}
          unitAmount={UNIT_AMOUNT}
        />

        <View style={styles.footer}>
          <Button
            title="프로필 완성"
            onPress={handleComplete}
            disabled={!isValid}
            loading={isLoading}
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
