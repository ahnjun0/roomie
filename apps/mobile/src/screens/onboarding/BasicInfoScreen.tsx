import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding, useAuth } from '../../contexts';
import { api } from '../../services/api';
import { Button, RadioGroup, Dropdown, Input, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { NATIONALITIES, ENTRANCE_YEARS, ONBOARDING_STEPS } from '../../constants/data';
import { User } from '../../types';

interface BasicInfoScreenProps {
  navigation: any;
}

export function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { colors } = useTheme();
  const { data, updateData, submitRegistration } = useOnboarding();
  const { setTokens, setUser } = useAuth();
  const insets = useSafeAreaInsets();

  // tempToken이 있으면 회원가입 모드
  const isRegistrationMode = !!data.tempToken;

  const [localData, setLocalData] = useState({
    gender: data.gender,
    nationality: data.nationality,
    age: data.age?.toString() || '',
    studentId: data.studentId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    localData.gender &&
    localData.nationality &&
    localData.age &&
    localData.studentId;

  const handleNext = async () => {
    // 먼저 로컬 데이터를 OnboardingContext에 저장
    updateData({
      gender: localData.gender as 'male' | 'female',
      nationality: localData.nationality,
      age: parseInt(localData.age, 10),
      studentId: localData.studentId,
    });

    if (isRegistrationMode) {
      // 회원가입 모드: API 호출
      setIsLoading(true);
      setError('');

      try {
        const response = await submitRegistration();

        // User 객체 구성
        const user: User = {
          id: response.id,
          email: response.email,
          name: response.nickname,
          gender: localData.gender as 'male' | 'female',
          nationality: localData.nationality,
          birthYear: null,
          studentId: localData.studentId,
          schoolId: null, // 회원가입 시점에는 schoolId가 없음, API에서 이메일 도메인으로 조회
          persona: null,
          isEmailVerified: true,
          isProfileComplete: false,
        };

        // AuthContext 상태 업데이트 - 토큰과 user 모두 설정
        api.setAccessToken(response.accessToken);
        await setTokens(response.accessToken, response.refreshToken);
        await setUser(user);

        // 회원가입 완료 후 온보딩 계속 (RootNavigator가 자동으로 온보딩 플로우로 전환)
      } catch (err: any) {
        setError(err.message || '회원가입에 실패했습니다.');
        setIsLoading(false);
      }
    } else {
      // 온보딩 모드: 다음 화면으로 이동
      navigation.navigate('DormitorySelect');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="기본 정보"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.BASIC_INFO} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          기본 정보를 입력해주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          정확한 매칭을 위해 필요한 정보입니다
        </Text>

        <View style={styles.form}>
          <RadioGroup
            label="성별"
            options={[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
            ]}
            value={localData.gender}
            onChange={value =>
              setLocalData(prev => ({ ...prev, gender: value as 'male' | 'female' }))
            }
            horizontal
          />

          <Dropdown
            label="국적"
            placeholder="국적을 선택하세요"
            options={NATIONALITIES}
            value={localData.nationality}
            onChange={value => setLocalData(prev => ({ ...prev, nationality: value }))}
          />

          <Input
            label="나이"
            placeholder="만 나이를 입력하세요"
            value={localData.age}
            onChangeText={text =>
              setLocalData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }))
            }
            keyboardType="number-pad"
          />

          <Dropdown
            label="입학년도"
            placeholder="입학년도를 선택하세요"
            options={ENTRANCE_YEARS}
            value={localData.studentId}
            onChange={value => setLocalData(prev => ({ ...prev, studentId: value }))}
          />
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: themeColors.error + '20' }]}>
            <Text style={[styles.errorText, { color: themeColors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <Button
          title={isRegistrationMode ? '가입 완료' : '다음'}
          onPress={handleNext}
          disabled={!isValid}
          loading={isLoading}
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
  errorBanner: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
