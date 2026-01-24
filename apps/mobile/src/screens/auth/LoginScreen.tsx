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
import { useTheme, useAuth } from '../../contexts';
import { Button, Input } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';

interface LoginScreenProps {
  navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { colors } = useTheme();
  const { sendVerificationCode } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // 학교 이메일 검증 (.ac.kr 또는 .edu)
    const emailRegex = /^[^\s@]+@[^\s@]+\.(ac\.kr|edu)$/i;
    return emailRegex.test(email);
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
      await sendVerificationCode(email);
      navigation.navigate('VerifyEmail', { email });
    } catch (err: any) {
      setError(err.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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
            학교 이메일로 시작하기
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            안전한 매칭을 위해 학교 이메일 인증이 필요합니다
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
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            가입하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </Text>
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
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: fontSize.xs * 1.5,
  },
});
