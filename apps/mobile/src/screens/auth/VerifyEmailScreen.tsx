import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { CodeInput, Header } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ route, navigation }: Props) {
  const { email, mode = 'register' } = route.params;
  const { colors } = useTheme();
  const { verifyCode, sendVerificationCode } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeComplete = async (enteredCode: string) => {
    setIsLoading(true);
    setError('');

    try {
      const tempToken = await verifyCode(email, enteredCode);

      // mode에 따라 다음 화면 분기
      if (mode === 'reset') {
        navigation.navigate('ResetPassword', { email, tempToken });
      } else {
        navigation.navigate('Register', { email, tempToken });
      }
    } catch (err: any) {
      setError(err.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await sendVerificationCode(email);
      setResendTimer(60);
      setError('');
    } catch (err: any) {
      setError(err.message || '인증 코드 재발송에 실패했습니다.');
    }
  };

  const headerTitle = mode === 'reset' ? '비밀번호 재설정' : '이메일 인증';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title={headerTitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            인증 코드 입력
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {email}로 전송된 6자리 코드를 입력하세요
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <CodeInput
            length={6}
            onComplete={handleCodeComplete}
            error={!!error}
          />
          {error && <Text style={[styles.error, { color: themeColors.error }]}>{error}</Text>}
        </View>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.text.secondary }]}>
            코드를 받지 못하셨나요?
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendTimer > 0}>
            <Text
              style={[
                styles.resendButton,
                {
                  color: resendTimer > 0 ? colors.text.tertiary : themeColors.primary,
                },
              ]}>
              {resendTimer > 0 ? `${resendTimer}초 후 재전송` : '재전송'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              인증 중...
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxl,
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
  codeContainer: {
    marginBottom: spacing.xl,
  },
  error: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resendText: {
    fontSize: fontSize.md,
  },
  resendButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  loadingContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
  },
});
