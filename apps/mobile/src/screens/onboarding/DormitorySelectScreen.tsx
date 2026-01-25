import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding, useAuth } from '../../contexts';
import { Button, CheckboxGroup, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { ONBOARDING_STEPS } from '../../constants/data';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

interface DormitorySelectScreenProps {
  navigation: any;
}

interface Dormitory {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
}

export function DormitorySelectScreen({ navigation }: DormitorySelectScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedDorms, setSelectedDorms] = useState<string[]>(
    data.selectedDormitories.map(String)
  );
  const [dorms, setDorms] = useState<Dormitory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDormitories();
  }, []);

  const fetchDormitories = async () => {
    try {
      const response = await api.get<Dormitory[]>(ENDPOINTS.DORMITORIES.LIST);
      setDorms(response);
    } catch (error) {
      console.error('Failed to fetch dormitories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 성별에 따른 기숙사 필터링
  // OnboardingContext의 데이터가 없으면(새로고침 등) AuthContext의 유저 정보 사용
  const gender = data.gender || user?.gender?.toLowerCase();
  const userGenderUpper = gender?.toUpperCase();
  
  const availableDorms = dorms
    .filter(dorm => dorm.gender === userGenderUpper)
    .map(dorm => ({
      value: String(dorm.id),
      label: dorm.name,
    }));

  const handleNext = () => {
    updateData({
      selectedDormitories: selectedDorms.map(Number),
    });
    navigation.navigate('CoreHabits');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="기숙사 선택"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.DORMITORY_SELECT} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          입사 희망 기숙사를 선택해주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          복수 선택 가능합니다
        </Text>

        <View style={styles.form}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <CheckboxGroup
              options={availableDorms}
              values={selectedDorms}
              onChange={setSelectedDorms}
            />
          )}
        </View>

        <Button
          title="다음"
          onPress={handleNext}
          disabled={selectedDorms.length === 0}
          fullWidth
        />
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
    marginBottom: spacing.lg,
  },
});
