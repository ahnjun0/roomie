import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, RadioGroup, CheckboxGroup, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { SLEEP_HABITS, ONBOARDING_STEPS } from '../../constants/data';

interface CoreHabitsScreenProps {
  navigation: any;
}

export function CoreHabitsScreen({ navigation }: CoreHabitsScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [isSmoker, setIsSmoker] = useState<string | null>(
    data.isSmoker === null ? null : data.isSmoker ? 'yes' : 'no'
  );
  const [sleepHabits, setSleepHabits] = useState<string[]>(data.sleepHabits);

  const isValid = isSmoker !== null && sleepHabits.length > 0;

  const handleNext = () => {
    updateData({
      isSmoker: isSmoker === 'yes',
      sleepHabits,
    });
    navigation.navigate('LifestyleScale');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="생활 습관"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.CORE_HABITS} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          핵심 생활 습관을 알려주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          룸메이트 매칭에 중요한 정보입니다
        </Text>

        <View style={styles.form}>
          <RadioGroup
            label="흡연 여부"
            options={[
              { value: 'no', label: '비흡연' },
              { value: 'yes', label: '흡연' },
            ]}
            value={isSmoker}
            onChange={setIsSmoker}
            horizontal
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              수면 습관
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              해당되는 항목을 모두 선택해주세요
            </Text>
            <CheckboxGroup
              options={SLEEP_HABITS}
              values={sleepHabits}
              onChange={setSleepHabits}
            />
          </View>
        </View>

        <Button
          title="다음"
          onPress={handleNext}
          disabled={!isValid}
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
});
