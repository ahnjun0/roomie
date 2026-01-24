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
  const { data, updateData, submitBasicInfo, submitLifestyle, submitPreferences } = useOnboarding();
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

  // 가중치 값을 API 형식(0.0~3.0)으로 변환
  const convertToApiWeight = (value: number): number => {
    // 0-5 단위를 0.0-3.0으로 변환
    return value * 0.6;
  };

  const handleComplete = async () => {
    if (!isValid) {
      Alert.alert('알림', '5만원을 모두 배분해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 가중치 데이터 업데이트
      updateData({
        weightSmoking: convertToApiWeight(weights.smoking),
        weightSleep: convertToApiWeight(weights.sleep),
        weightCleanliness: convertToApiWeight(weights.cleanliness),
        weightNoise: convertToApiWeight(weights.noise),
      });

      // 모든 데이터 제출
      await submitBasicInfo();
      await submitLifestyle();
      await submitPreferences();

      // 사용자 정보 새로고침
      await refreshUser();

      // 메인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
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
