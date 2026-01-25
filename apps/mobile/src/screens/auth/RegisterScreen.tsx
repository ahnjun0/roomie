import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, Input, Header } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';

interface RegisterScreenProps {
  route: {
    params: {
      email: string;
      tempToken: string;
    };
  };
  navigation: any;
}

export function RegisterScreen({ route, navigation }: RegisterScreenProps) {
  const { email, tempToken } = route.params;
  const { colors } = useTheme();
  const { updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    // OnboardingContext에 회원가입 정보 저장
    updateData({
      email,
      password,
      tempToken,
    });

    // BasicInfoScreen으로 이동
    navigation.navigate('BasicInfo');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title="회원가입"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            비밀번호 설정
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {email}의 비밀번호를 설정해주세요
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="비밀번호"
            placeholder="8자 이상 입력"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="다음"
            onPress={handleNext}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  form: {
    gap: spacing.sm,
  },
});
