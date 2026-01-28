import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { Header, Input, Button } from '../../../components';
import { createDeliveryPost } from '../../../services/delivery';
import { FoodCategory } from '../../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  colors as themeColors,
} from '../../../constants/theme';

interface DeliveryFormScreenProps {
  navigation: any;
}

const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'KOREAN', label: '한식' },
  { value: 'CHINESE', label: '중식' },
  { value: 'JAPANESE', label: '일식' },
  { value: 'WESTERN', label: '양식' },
  { value: 'CHICKEN', label: '치킨' },
  { value: 'PIZZA', label: '피자' },
  { value: 'DESSERT', label: '디저트' },
  { value: 'OTHER', label: '기타' },
];

const PARTICIPANT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function DeliveryFormScreen({ navigation }: DeliveryFormScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [bankAccount, setBankAccount] = useState('');
  const [orderLink, setOrderLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '가게 이름을 입력해주세요.');
      return;
    }
    if (!foodCategory) {
      Alert.alert('알림', '음식 카테고리를 선택해주세요.');
      return;
    }
    if (!maxParticipants) {
      Alert.alert('알림', '모집 인원을 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await createDeliveryPost({
        title: title.trim(),
        content: content.trim(),
        foodCategory,
        maxParticipants,
        bankAccount: bankAccount.trim() || undefined,
        orderLink: orderLink.trim() || undefined,
      });
      Alert.alert('성공', '배달 팟이 생성되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to create delivery post:', error);
      Alert.alert('오류', '배달 팟 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="배달 팟 모집" showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Input
            label="가게 이름"
            placeholder="가게 이름을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.text.primary }]}>
            음식 카테고리
          </Text>
          <View style={styles.categoryGrid}>
            {FOOD_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      foodCategory === category.value
                        ? themeColors.primary
                        : colors.card,
                    borderColor:
                      foodCategory === category.value
                        ? themeColors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setFoodCategory(category.value)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        foodCategory === category.value
                          ? '#fff'
                          : colors.text.secondary,
                    },
                  ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text.primary }]}>
            모집 인원
          </Text>
          <View style={styles.participantGrid}>
            {PARTICIPANT_OPTIONS.map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.participantChip,
                  {
                    backgroundColor:
                      maxParticipants === num
                        ? themeColors.primary
                        : colors.card,
                    borderColor:
                      maxParticipants === num
                        ? themeColors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setMaxParticipants(num)}>
                <Text
                  style={[
                    styles.participantChipText,
                    {
                      color:
                        maxParticipants === num
                          ? '#fff'
                          : colors.text.secondary,
                    },
                  ]}>
                  {num}명
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="내용"
            placeholder="배달 팟에 대한 설명을 입력하세요 (주문 시간, 픽업 장소 등)"
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.contentInput}
            textAlignVertical="top"
          />

          <Input
            label="정산 계좌 (선택)"
            placeholder="카카오뱅크 3333-00-0000000"
            value={bankAccount}
            onChangeText={setBankAccount}
          />

          <Input
            label="배달 앱 링크 (선택)"
            placeholder="배달의민족, 쿠팡이츠 등 공유 링크"
            value={orderLink}
            onChangeText={setOrderLink}
          />
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            title="등록하기"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  categoryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  participantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  participantChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    minWidth: 50,
    alignItems: 'center',
  },
  participantChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  contentInput: {
    height: 120,
  },
  footer: {
    padding: spacing.md,
  },
});
