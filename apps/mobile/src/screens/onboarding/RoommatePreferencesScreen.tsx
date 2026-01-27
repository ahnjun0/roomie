import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, RadioGroup, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { PREFERENCE_OPTIONS, ONBOARDING_STEPS } from '../../constants/data';

interface RoommatePreferencesScreenProps {
  navigation: any;
}

export function RoommatePreferencesScreen({ navigation }: RoommatePreferencesScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState({
    nationality: data.preferredNationality,
    studentYear: data.preferredStudentYear,
  });

  const handleNext = () => {
    updateData({
      preferredNationality: preferences.nationality,
      preferredStudentYear: preferences.studentYear,
    });
    navigation.navigate('PreferredLifestyle');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="룸메이트 선호"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.ROOMMATE_PREFERENCES} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderTitle, { color: themeColors.primary }]}>
            이런 사람이면 좋겠어요
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          원하는 룸메이트 조건이 있나요?
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          선호하는 조건을 선택해주세요
        </Text>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              국적
            </Text>
            <RadioGroup
              options={PREFERENCE_OPTIONS.nationality}
              value={preferences.nationality}
              onChange={value =>
                setPreferences(prev => ({ ...prev, nationality: value }))
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              학년
            </Text>
            <RadioGroup
              options={PREFERENCE_OPTIONS.studentYear}
              value={preferences.studentYear}
              onChange={value =>
                setPreferences(prev => ({ ...prev, studentYear: value }))
              }
            />
          </View>
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
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
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
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
});
