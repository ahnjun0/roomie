import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, ScaleSelector, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { LIFESTYLE_SCALES, ONBOARDING_STEPS } from '../../constants/data';

interface LifestyleScaleScreenProps {
  navigation: any;
}

export function LifestyleScaleScreen({ navigation }: LifestyleScaleScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [scales, setScales] = useState({
    noiseLevel: data.noiseLevel,
    cleanliness: data.cleanliness,
    indoorEating: data.indoorEating,
    lightsOut: data.lightsOut,
    temperature: data.temperature,
  });

  const handleScaleChange = (key: string, value: number) => {
    setScales(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    updateData(scales);
    navigation.navigate('RoommatePreferences');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="생활 방식"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.LIFESTYLE_SCALE} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          생활 방식을 평가해주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          1~5 단계로 선택해주세요
        </Text>

        <View style={styles.form}>
          {LIFESTYLE_SCALES.map(scale => (
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
