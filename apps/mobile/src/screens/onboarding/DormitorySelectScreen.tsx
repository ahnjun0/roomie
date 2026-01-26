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
      // 1. 유저 이메일 도메인 추출
      const userEmail = user?.email || '';
      const domain = userEmail.split('@')[1];

      if (!domain) {
        throw new Error('Invalid email domain');
      }

      // 2. 도메인으로 학교 정보 조회
      const school = await api.get<{ id: number; name: string }>(
        ENDPOINTS.SCHOOLS.BY_DOMAIN(domain)
      );

      // 3. 학교 ID로 기숙사 목록 조회
      // 성별 필터링은 API 레벨에서 할 수도 있지만, 기존 로직 유지를 위해 클라이언트 필터링 사용 
      // 혹은 API에 gender 파라미터를 보낼 수도 있음 (API 명세 확인 필요)
      // 여기서는 API가 지원하므로 gender 파라미터 사용 권장
      const userGender = data.gender || user?.gender?.toLowerCase();
      const userGenderUpper = userGender?.toUpperCase();

      const response = await api.get<Dormitory[]>(
        `${ENDPOINTS.SCHOOLS.DORMS(school.id)}?gender=${userGenderUpper}`
      );
      
      setDorms(response);
    } catch (error) {
      console.error('Failed to fetch dormitories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 이미 API에서 성별 필터링된 데이터를 받아오므로, 여기서는 포맷팅만 수행
  const availableDorms = dorms.map(dorm => ({
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
