import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOnboarding } from '../../contexts';
import { Button, RadioGroup, Dropdown, Input, Header, ProgressBar } from '../../components';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { NATIONALITIES, ENTRANCE_YEARS, ONBOARDING_STEPS } from '../../constants/data';

interface BasicInfoScreenProps {
  navigation: any;
}

export function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { colors } = useTheme();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [localData, setLocalData] = useState({
    gender: data.gender,
    nationality: data.nationality,
    age: data.age?.toString() || '',
    studentId: data.studentId,
  });

  const isValid =
    localData.gender &&
    localData.nationality &&
    localData.age &&
    localData.studentId;

  const handleNext = () => {
    updateData({
      gender: localData.gender as 'male' | 'female',
      nationality: localData.nationality,
      age: parseInt(localData.age, 10),
      studentId: localData.studentId,
    });
    navigation.navigate('DormitorySelect');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="기본 정보"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <ProgressBar {...ONBOARDING_STEPS.BASIC_INFO} />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          기본 정보를 입력해주세요
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          정확한 매칭을 위해 필요한 정보입니다
        </Text>

        <View style={styles.form}>
          <RadioGroup
            label="성별"
            options={[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
            ]}
            value={localData.gender}
            onChange={value => setLocalData(prev => ({ ...prev, gender: value }))}
            horizontal
          />

          <Dropdown
            label="국적"
            placeholder="국적을 선택하세요"
            options={NATIONALITIES}
            value={localData.nationality}
            onChange={value => setLocalData(prev => ({ ...prev, nationality: value }))}
          />

          <Input
            label="나이"
            placeholder="만 나이를 입력하세요"
            value={localData.age}
            onChangeText={text =>
              setLocalData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }))
            }
            keyboardType="number-pad"
          />

          <Dropdown
            label="입학년도"
            placeholder="입학년도를 선택하세요"
            options={ENTRANCE_YEARS}
            value={localData.studentId}
            onChange={value => setLocalData(prev => ({ ...prev, studentId: value }))}
          />
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
});
