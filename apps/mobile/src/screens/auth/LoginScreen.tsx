import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { GradientBackground } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { sendVerificationCode } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);

  // 학교 도메인 → 학교명 매핑
  const SCHOOL_DOMAIN_MAP: Record<string, string> = {
    'kaist.ac.kr': 'KAIST',
    'pusan.ac.kr': '부산대학교',
    'snu.ac.kr': '서울대학교',
    'korea.ac.kr': '고려대학교',
    'yonsei.ac.kr': '연세대학교',
    'skku.edu': '성균관대학교',
    'hanyang.ac.kr': '한양대학교',
    'sogang.ac.kr': '서강대학교',
    'cau.ac.kr': '중앙대학교',
    'khu.ac.kr': '경희대학교',
    'ewha.ac.kr': '이화여자대학교',
    'hongik.ac.kr': '홍익대학교',
    'konkuk.ac.kr': '건국대학교',
    'sejong.ac.kr': '세종대학교',
    'inha.ac.kr': '인하대학교',
    'ajou.ac.kr': '아주대학교',
    'gnu.ac.kr': '경상국립대학교',
    'jnu.ac.kr': '전남대학교',
    'jbnu.ac.kr': '전북대학교',
    'knu.ac.kr': '경북대학교',
    'cnu.ac.kr': '충남대학교',
    'cbnu.ac.kr': '충북대학교',
    'kangwon.ac.kr': '강원대학교',
    'jejunu.ac.kr': '제주대학교',
    'gist.ac.kr': 'GIST',
    'unist.ac.kr': 'UNIST',
    'dgist.ac.kr': 'DGIST',
    'postech.ac.kr': 'POSTECH',
  };

  const getSchoolName = (emailValue: string): string | null => {
    const atIndex = emailValue.indexOf('@');
    if (atIndex === -1) return null;
    const domain = emailValue.slice(atIndex + 1).toLowerCase();
    return SCHOOL_DOMAIN_MAP[domain] || null;
  };

  const schoolName = getSchoolName(email);

  const validateEmail = (emailValue: string) => {
    // 학교 이메일 검증 (.ac.kr 또는 .edu)
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

      if (userExists) {
        // 이미 가입된 이메일 - 모달 표시
        setShowExistingUserModal(true);
      } else {
        // 신규 사용자 - 이메일 인증 화면으로 이동
        navigation.navigate('VerifyEmail', { email, mode: 'register' });
      }
    } catch (err: any) {
      setError(err.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowExistingUserModal(false);
    navigation.navigate('SignIn', { email });
  };

  const handleGoToResetPassword = async () => {
    setIsLoading(true);
    try {
      await sendVerificationCode(email, 'reset');
      setShowExistingUserModal(false);
      navigation.navigate('VerifyEmail', { email, mode: 'reset' });
    } catch (err: any) {
      setError(err.message || '인증 코드 발송에 실패했습니다.');
      setShowExistingUserModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image
              source={require('../../../assets/icon-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              학교 이메일로 시작하기
            </Text>
            <Text style={styles.subtitle}>
              안전한 매칭을 위해 학교 이메일 인증이 필요합니다
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>학교 이메일</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputField}
                  placeholder="example@university.ac.kr"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {schoolName && (
              <Text style={styles.schoolBadge}>
                {schoolName} Roomie로 확인되었습니다!
              </Text>
            )}

            <TouchableOpacity
              style={[styles.sendButton, (isLoading) && styles.sendButtonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
              activeOpacity={0.8}>
              <Text style={styles.sendButtonText}>
                {isLoading ? '전송 중...' : '인증 코드 받기'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn', {})}>
              <Text style={styles.footerText}>
                이미 계정이 있으신가요?{' '}
                <Text style={styles.footerLink}>로그인</Text>
              </Text>
            </TouchableOpacity>
            <Text style={[styles.termsText, { marginTop: spacing.md }]}>
              가입하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </Text>
          </View>
        </ScrollView>

        {/* 이미 가입된 이메일 모달 */}
        <Modal
          visible={showExistingUserModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExistingUserModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowExistingUserModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                    이미 가입된 이메일입니다
                  </Text>
                  <Text style={[styles.modalMessage, { color: colors.text.secondary }]}>
                    {email}로 이미 가입된 계정이 있습니다.{'\n'}
                    어떻게 하시겠어요?
                  </Text>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                      onPress={handleGoToLogin}>
                      <Text style={styles.modalButtonTextPrimary}>로그인하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonOutline, { borderColor: themeColors.primary }]}
                      onPress={handleGoToResetPassword}>
                      <Text style={[styles.modalButtonTextSecondary, { color: themeColors.primary }]}>
                        비밀번호 재설정
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowExistingUserModal(false)}>
                    <Text style={[styles.modalCancelText, { color: colors.text.tertiary }]}>
                      취소
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </GradientBackground>
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
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 100,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    color: 'rgba(255,255,255,0.75)',
  },
  form: {
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    color: 'rgba(255,255,255,0.85)',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  inputField: {
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    color: '#fecaca',
  },
  schoolBadge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: themeColors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
  },
  footerLink: {
    color: '#FFFFFF',
    fontWeight: fontWeight.semibold,
  },
  termsText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: fontSize.xs * 1.5,
    color: 'rgba(255,255,255,0.45)',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  modalButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  modalButtonTextSecondary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  modalCancelButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  modalCancelText: {
    fontSize: fontSize.sm,
  },
});
