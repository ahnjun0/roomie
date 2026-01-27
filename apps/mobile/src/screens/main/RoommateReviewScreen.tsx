import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { Button, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';
import { CommonActions } from '@react-navigation/native';

interface RoommateReviewScreenProps {
  route: {
    params: {
      targetUserId: string;
      targetNickname: string;
    };
  };
  navigation: any;
}

export function RoommateReviewScreen({ route, navigation }: RoommateReviewScreenProps) {
  const { targetUserId, targetNickname } = route.params;
  const { colors } = useTheme();
  const { refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(ENDPOINTS.REVIEWS.CREATE, {
        targetId: targetUserId,
        content,
        score,
      });

      await refreshUser();

      Alert.alert('완료', '평가가 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            );
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '평가 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await refreshUser();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="룸메이트 평가" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {targetNickname ?? '룸메이트'}님과의 생활은 어떠셨나요?
        </Text>

        {/* 별점 선택 */}
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setScore(star)}
              style={styles.starButton}>
              <Text style={[
                styles.starText,
                { color: star <= score ? themeColors.warning : colors.border },
              ]}>
                {star <= score ? '\u2605' : '\u2606'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.scoreLabel, { color: colors.text.secondary }]}>
          {score > 0 ? `${score}점` : '별점을 선택해주세요'}
        </Text>

        {/* 리뷰 텍스트 */}
        <Text style={[styles.inputLabel, { color: colors.text.primary }]}>
          한줄 리뷰 (선택)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text.primary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          value={content}
          onChangeText={setContent}
          placeholder="룸메이트에 대한 솔직한 후기를 남겨주세요"
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* 제출 버튼 */}
        <View style={styles.actions}>
          <Button
            title="평가 완료"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={score === 0}
            fullWidth
          />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.text.tertiary }]}>
              건너뛰기
            </Text>
          </TouchableOpacity>
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
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  starButton: {
    paddingHorizontal: spacing.sm,
  },
  starText: {
    fontSize: 40,
  },
  scoreLabel: {
    textAlign: 'center',
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 120,
    marginBottom: spacing.xl,
  },
  actions: {
    marginTop: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.md,
  },
});
