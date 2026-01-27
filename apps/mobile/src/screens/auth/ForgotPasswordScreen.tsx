import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { Button, Input } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { sendVerificationCode } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route.params?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(ac\.kr|edu)$/i;
    return emailRegex.test(emailValue);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('학교 이메일(.ac.kr 또는 .edu)을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { userExists } = await sendVerificationCode(email);

      if (!userExists) {
        setError('가입되지 않은 이메일입니다. 먼저 회원가입을 진행해주세요.');
        return;
      }

      // 인증 코드 발송 성공 - 이메일 인증 화면으로 이동 (reset 모드)
      navigation.navigate('VerifyEmail', { email, mode: 'reset' });
    } catch (err: any) {
      setError(err.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.logo, { color: themeColors.primary }]}>ROOMIE</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            비밀번호 재설정
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            가입한 학교 이메일을 입력해주세요.{'\n'}
            인증 후 새 비밀번호를 설정할 수 있습니다.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="학교 이메일"
            placeholder="example@university.ac.kr"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error}
          />

          <Button
            title="인증 코드 받기"
            onPress={handleSendCode}
            loading={isLoading}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleGoBack}>
            <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
              <Text style={{ color: themeColors.primary, fontWeight: fontWeight.semibold }}>
                뒤로 가기
              </Text>
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
