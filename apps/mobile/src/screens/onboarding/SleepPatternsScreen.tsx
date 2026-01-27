import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, Slider, RadioGroup, Header, ProgressBar, TimeRangeSlider } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { ONBOARDING_STEPS } from '../../constants/data';

interface SleepPatternsScreenProps {
  navigation: any;
}

// 시간 변환 함수 (0-24 -> 시간 문자열)
// 0 = 오후 4시(16시), 8 = 자정(24/0시), 20 = 정오(12시), 24 = 오후 4시(16시)
const formatSleepTime = (value: number): string => {
  const hour = (16 + value) % 24;
  // 24시간제 표시 (디자인 시안 스타일)
  return `${hour.toString().padStart(2, '0')}:00`;
};

export function SleepPatternsScreen({ navigation }: SleepPatternsScreenProps) {
  const { colors } = useTheme();
  const { data, updateData, submitLifestyle } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [sleepStart, setSleepStart] = useState(data.sleepStart);
  const [sleepEnd, setSleepEnd] = useState(data.sleepEnd);
  const [homeVisit, setHomeVisit] = useState(data.homeVisitFrequency || 'RARELY');
  const [sensitivity, setSensitivity] = useState(data.sensitivity);

  const handleNext = async () => {
    updateData({
      sleepStart,
      sleepEnd,
      homeVisitFrequency: homeVisit,
      sensitivity,
    });
    navigation.navigate('RoommatePreferences');
  };

  const handleTimeChange = (start: number, end: number) => {
    setSleepStart(start);
    setSleepEnd(end);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="수면 패턴"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.SLEEP_PATTERNS} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          수면 패턴과 민감도
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          평소 수면 시간을 알려주세요
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text.primary }]}>수면 시간</Text>
          <TimeRangeSlider
            startValue={sleepStart}
            endValue={sleepEnd}
            min={0}
            max={24}
            onValuesChange={handleTimeChange}
            formatValue={formatSleepTime}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              외박/귀가 빈도
            </Text>
            <RadioGroup
              options={[
                { value: 'RARELY', label: '거의 없음' },
                { value: 'SOMETIMES', label: '가끔' },
                { value: 'OFTEN', label: '자주' },
              ]}
              value={homeVisit}
              onChange={setHomeVisit}
              horizontal
            />
          </View>

          <Slider
            label="소음 민감도"
            value={sensitivity}
            minimumValue={1}
            maximumValue={5}
            onValueChange={value => setSensitivity(Math.round(value))}
            showValue
            leftLabel="둔감"
            rightLabel="민감"
          />
        </View>

        <Button title="다음" onPress={handleNext} fullWidth />
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
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
});
