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

const TOTAL_BUDGET = 50000;
const UNIT_AMOUNT = 10000;

export function WeightGameScreen({ navigation }: WeightGameScreenProps) {
  const { colors } = useTheme();
  const { submitLifestyle, submitPreferences } = useOnboarding();
  const { refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    smoking: 1,
    sleep: 1,
    cleanliness: 1,
    noise: 1,
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
      Alert.alert('알림', '5만원을 모두 배분해주세요.');
      return;
    }

    setIsLoading(true);
    console.log('[WeightGame] Starting profile submission...');

    try {
      // 가중치 데이터를 백엔드 형식으로 변환 (총합 50이 되도록)
      // 프론트엔드: 0-5 범위, 총합 5 (50000원 / 10000원)
      // 백엔드: 0-50 범위, 총합 50
      const weightData = {
        weightNoise: weights.noise * 10,
        weightClean: weights.cleanliness * 10,
        weightFood: 0, // 프론트엔드에서 미사용
        weightHabit: weights.smoking * 10, // 흡연 → 잠버릇으로 매핑
        weightTime: weights.sleep * 10, // 수면 → 취침시간으로 매핑
        weightLight: 0, // 프론트엔드에서 미사용
        weightTemp: 0, // 프론트엔드에서 미사용
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
        title="가중치 게임"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.WEIGHT_GAME} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            5만원 배분 게임
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            가상의 5만원을 중요하다고 생각하는 항목에 배분해주세요.
            배분 금액이 높을수록 해당 항목이 매칭에서 중요하게 반영됩니다.
          </Text>
        </View>

        <WeightAllocator
          categories={WEIGHT_CATEGORIES}
          values={weights}
          onChange={handleWeightChange}
          totalBudget={TOTAL_BUDGET}
          unitAmount={UNIT_AMOUNT}
        />

        {!isValid && (
          <Text style={[styles.hint, { color: themeColors.warning }]}>
            남은 금액: ₩{(TOTAL_BUDGET - totalAllocated).toLocaleString()}
          </Text>
        )}

        {/* 디버그 정보 */}
        <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 8 }}>
          [DEBUG] isValid: {isValid ? 'true' : 'false'}, total: {totalAllocated}, isLoading: {isLoading ? 'true' : 'false'}
        </Text>

        <View style={styles.footer}>
          <Button
            title="프로필 완성"
            onPress={() => {
              console.log('[WeightGame] Button pressed!');
              handleComplete();
            }}
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
  header: {
    marginTop: spacing.lg,
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
  hint: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: fontWeight.medium,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
