import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, CheckboxGroup, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { DORMITORIES, ONBOARDING_STEPS } from '../../constants/data';

interface DormitorySelectScreenProps {
  navigation: any;
}

export function DormitorySelectScreen({ navigation }: DormitorySelectScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [selectedDorms, setSelectedDorms] = useState<string[]>(
    data.selectedDormitories.map(String)
  );

  // 성별에 따른 기숙사 필터링
  const availableDorms = DORMITORIES.filter(
    dorm => dorm.gender === data.gender
  ).map(dorm => ({
    value: String(dorm.id),
    label: dorm.name,
  }));

  const handleNext = () => {
    updateData({
      selectedDormitories: selectedDorms.map(Number),
    });
    navigation.navigate('CoreHabits');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="기숙사 선택"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.DORMITORY_SELECT} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          입사 희망 기숙사를 선택해주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          복수 선택 가능합니다
        </Text>

        <View style={styles.form}>
          <CheckboxGroup
            options={availableDorms}
            values={selectedDorms}
            onChange={setSelectedDorms}
          />
        </View>

        <Button
          title="다음"
          onPress={handleNext}
          disabled={selectedDorms.length === 0}
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
});
