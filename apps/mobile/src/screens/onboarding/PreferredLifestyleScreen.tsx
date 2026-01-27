import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, ScaleSelector, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { PREFERRED_LIFESTYLE_SCALES, ONBOARDING_STEPS } from '../../constants/data';

interface PreferredLifestyleScreenProps {
  navigation: any;
}

export function PreferredLifestyleScreen({ navigation }: PreferredLifestyleScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [scales, setScales] = useState({
    prefNoiseLevel: data.prefNoiseLevel,
    prefCleanliness: data.prefCleanliness,
    prefIndoorEating: data.prefIndoorEating,
    prefTemperature: data.prefTemperature,
  });

  const handleScaleChange = (key: string, value: number) => {
    setScales(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    updateData(scales);
    navigation.navigate('WeightGame');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="원하는 생활 방식"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.PREFERRED_LIFESTYLE} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
            이런 사람이면 좋겠어요
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          원하는 룸메이트의 생활 방식
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          함께 살고 싶은 룸메이트의 생활 방식을 선택해주세요
        </Text>

        <View style={styles.form}>
          {PREFERRED_LIFESTYLE_SCALES.map(scale => (
            <ScaleSelector
              key={scale.key}
              label={scale.label}
              description={scale.description}
              value={scales[scale.key as keyof typeof scales]}
              onChange={value => handleScaleChange(scale.key, value)}
              leftLabel={scale.leftLabel}
              rightLabel={scale.rightLabel}
            />
          ))}
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
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
