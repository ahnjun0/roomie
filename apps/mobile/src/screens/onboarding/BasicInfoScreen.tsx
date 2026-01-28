import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding, useAuth } from '../../contexts';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
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
    studentId: data.studentId?.toString() || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    localData.gender &&
    localData.nationality &&
    localData.age &&
    localData.studentId &&
    localData.studentId.length === 2;

  const handleNext = async () => {
    const newData = {
      gender: localData.gender as 'MALE' | 'FEMALE',
      nationality: localData.nationality,
      age: parseInt(localData.age, 10),
      studentId: parseInt(localData.studentId, 10),
    };

    // 먼저 로컬 데이터를 OnboardingContext에 저장
    updateData(newData);

    if (isRegistrationMode) {
      // 회원가입 모드: API 호출
      setIsLoading(true);
      setError('');

      try {
        const response = await submitRegistration(newData);

        // 토큰 설정 후 전체 사용자 정보 가져오기
        api.setAccessToken(response.accessToken);
        const user = await api.get<User>(ENDPOINTS.USERS.ME);

        // AuthContext 상태 업데이트 - user를 먼저 설정한 후 토큰 설정
        // (setTokens가 isAuthenticated를 true로 만들어 화면 전환이 일어나므로, user가 먼저 설정되어야 함)
        await setUser(user);
        await setTokens(response.accessToken, response.refreshToken);

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
              { value: 'MALE', label: '남성' },
              { value: 'FEMALE', label: '여성' },
            ]}
            value={localData.gender}
            onChange={value =>
              setLocalData(prev => ({ ...prev, gender: value as 'MALE' | 'FEMALE' }))
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

          <Input
            label="입학년도"
            placeholder="25"
            value={localData.studentId}
            onChangeText={text =>
              setLocalData(prev => ({ ...prev, studentId: text.replace(/[^0-9]/g, '').slice(0, 2) }))
            }
            keyboardType="number-pad"
            maxLength={2}
            rightElement={
              <Text style={{ color: colors.text.secondary, fontWeight: fontWeight.medium }}>
                학번
              </Text>
            }
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
