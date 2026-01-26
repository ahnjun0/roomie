import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { Header, ProgressBar } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors } from '../../constants/theme';

interface Question {
  id: number;
  axis: string;
  question: string;
  choiceA: string;
  choiceB: string;
}

interface RoomBtiTestScreenProps {
  navigation: any;
}

export function RoomBtiTestScreen({ navigation }: RoomBtiTestScreenProps) {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get<{ questions: Question[]; total: number }>(
        ENDPOINTS.ROOM_BTI.QUESTIONS,
      );
      setQuestions(response.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      Alert.alert('오류', '질문을 불러오는데 실패했습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      // 다음 질문으로
      setCurrentIndex(currentIndex + 1);
    } else {
      // 테스트 제출
      await submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers: number[]) => {
    setIsSubmitting(true);
    try {
      const response = await api.post<{
        result: string;
        animal: string;
        description: string;
        imageKey: string;
      }>(ENDPOINTS.ROOM_BTI.TEST, { answers: finalAnswers });

      navigation.replace('RoomBtiResult', {
        result: response.result,
        animal: response.animal,
        description: response.description,
        imageKey: response.imageKey,
      });
    } catch (error) {
      console.error('Failed to submit test:', error);
      Alert.alert('오류', '테스트 제출에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: themeColors.background },
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>
          질문을 불러오는 중...
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Room-BTI 테스트" showBack onBack={handleBack} />

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        <Text style={[styles.questionNumber, { color: themeColors.text.secondary }]}>
          Q{currentIndex + 1}
        </Text>

        <Text style={[styles.question, { color: themeColors.text.primary }]}>
          {currentQuestion.question}
        </Text>

        <View style={styles.choicesContainer}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              {
                backgroundColor: themeColors.card,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => handleAnswer(0)}
            disabled={isSubmitting}
            activeOpacity={0.8}>
            <View style={[styles.choiceLabelBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.choiceLabelText}>A</Text>
            </View>
            <Text style={[styles.choiceText, { color: themeColors.text.primary }]}>
              {currentQuestion.choiceA}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleAnswer(1)}
            disabled={isSubmitting}
            activeOpacity={0.8}>
            <View
              style={[
                styles.choiceLabelBadge,
                { backgroundColor: themeColors.text.secondary },
              ]}>
              <Text style={styles.choiceLabelText}>B</Text>
            </View>
            <Text style={[styles.choiceText, { color: themeColors.text.primary }]}>
              {currentQuestion.choiceB}
            </Text>
          </TouchableOpacity>
        </View>

        {isSubmitting && (
          <View style={styles.submitting}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.submittingText, { color: themeColors.text.secondary }]}>
              결과 분석 중...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  questionNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
    lineHeight: 36,
  },
  choicesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  choiceButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceLabelBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  choiceLabelText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  choiceText: {
    flex: 1,
    fontSize: fontSize.lg,
    lineHeight: 24,
  },
  submitting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  submittingText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
});
