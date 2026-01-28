import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import {
  Button,
  RadioGroup,
  CheckboxGroup,
  ScaleSelector,
  Header,
  TimeRangeSlider,
} from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import { SLEEP_HABITS, LIFESTYLE_SCALES } from '../../constants/data';
import { UserLifestyle } from '../../types';

interface EditLifestyleScreenProps {
  navigation: any;
}

// 온보딩과 동일한 시간 변환 함수 (0-24 -> 시간 문자열)
// 0 = 오후 4시(16시), 8 = 자정(24/0시), 20 = 정오(12시), 24 = 오후 4시(16시)
const formatSleepTime = (value: number): string => {
  const hour = (16 + value) % 24;
  return `${hour.toString().padStart(2, '0')}:00`;
};

export function EditLifestyleScreen({ navigation }: EditLifestyleScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lifestyle fields
  const [dormNames, setDormNames] = useState('');
  const [isSmoker, setIsSmoker] = useState<string | null>(null);
  const [sleepStart, setSleepStart] = useState(6);
  const [sleepEnd, setSleepEnd] = useState(14);
  const [sleepHabits, setSleepHabits] = useState<string[]>([]);
  const [noiseLevel, setNoiseLevel] = useState(3);
  const [cleanLevel, setCleanLevel] = useState(3);
  const [foodLevel, setFoodLevel] = useState(3);
  const [tempLevel, setTempLevel] = useState(3);
  const [homeVisit, setHomeVisit] = useState<string | null>(null);

  // Dormitory list for display
  const [availableDorms, setAvailableDorms] = useState<{ value: string; label: string }[]>([]);
  const [selectedDormIds, setSelectedDormIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch current lifestyle
      const lifestyle = await api.get<UserLifestyle>(ENDPOINTS.USERS.LIFESTYLE);

      setDormNames(lifestyle.dormNames || '');
      setIsSmoker(lifestyle.isSmoker ? 'yes' : 'no');
      setSleepStart(lifestyle.sleepStart);
      setSleepEnd(lifestyle.sleepEnd);
      setSleepHabits(lifestyle.sleepHabits ? lifestyle.sleepHabits.split(',') : []);
      setNoiseLevel(lifestyle.noiseLevel);
      setCleanLevel(lifestyle.cleanLevel);
      setFoodLevel(lifestyle.foodLevel);
      setTempLevel(lifestyle.tempLevel);
      setHomeVisit(lifestyle.homeVisit);

      // Fetch dormitories for selection
      try {
        let schoolId: number | undefined;
        if (user?.schoolId) {
          schoolId = user.schoolId;
        } else {
          const domain = user?.email?.split('@')[1];
          if (domain) {
            const school = await api.get<{ id: number }>(
              ENDPOINTS.SCHOOLS.BY_DOMAIN(domain),
            );
            schoolId = school.id;
          }
        }

        if (schoolId) {
          const userGender = user?.gender;
          const dorms = await api.get<{ id: number; name: string }[]>(
            `${ENDPOINTS.SCHOOLS.DORMS(schoolId)}?gender=${userGender}`,
          );
          const dormOptions = dorms.map(d => ({
            value: d.name,
            label: d.name,
          }));
          setAvailableDorms(dormOptions);

          // Set selected dorms from current lifestyle
          const currentDormNames = (lifestyle.dormNames || '').split(',').filter(Boolean);
          setSelectedDormIds(currentDormNames);
        }
      } catch (dormError) {
        console.error('Failed to fetch dorms:', dormError);
      }
    } catch (error) {
      console.error('Failed to fetch lifestyle:', error);
      Alert.alert('오류', '생활 습관 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const scaleValues: Record<string, number> = {
    noiseLevel,
    cleanliness: cleanLevel,
    indoorEating: foodLevel,
    temperature: tempLevel,
  };

  const handleScaleChange = (key: string, value: number) => {
    switch (key) {
      case 'noiseLevel':
        setNoiseLevel(value);
        break;
      case 'cleanliness':
        setCleanLevel(value);
        break;
      case 'indoorEating':
        setFoodLevel(value);
        break;
      case 'temperature':
        setTempLevel(value);
        break;
    }
  };

  // 온보딩 CoreHabitsScreen과 동일한 NONE 토글 로직
  const handleSleepHabitsChange = (newValues: string[]) => {
    const wasNoneSelected = sleepHabits.includes('NONE');
    const isNoneSelected = newValues.includes('NONE');

    if (!wasNoneSelected && isNoneSelected) {
      // "없음"을 새로 선택한 경우 -> 다른 선택 해제하고 "없음"만 선택
      setSleepHabits(['NONE']);
    } else if (wasNoneSelected && isNoneSelected && newValues.length > 1) {
      // "없음"이 선택된 상태에서 다른 것을 추가 선택한 경우 -> "없음" 해제
      setSleepHabits(newValues.filter(v => v !== 'NONE'));
    } else if (wasNoneSelected && !isNoneSelected) {
      // "없음"을 해제한 경우
      setSleepHabits(newValues);
    } else {
      // 일반적인 변경
      setSleepHabits(newValues);
    }
  };

  const handleTimeChange = (start: number, end: number) => {
    setSleepStart(start);
    setSleepEnd(end);
  };

  const handleSave = async () => {
    if (isSmoker === null) {
      Alert.alert('알림', '흡연 여부를 선택해주세요.');
      return;
    }
    if (sleepHabits.length === 0) {
      Alert.alert('알림', '수면 습관을 선택해주세요.');
      return;
    }

    const finalDormNames = selectedDormIds.join(',');
    if (!finalDormNames) {
      Alert.alert('알림', '기숙사를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(ENDPOINTS.USERS.LIFESTYLE, {
        dormNames: finalDormNames,
        isSmoker: isSmoker === 'yes',
        sleepStart,
        sleepEnd,
        sleepHabits: sleepHabits.join(','),
        noiseLevel,
        cleanLevel,
        foodLevel,
        tempLevel,
        homeVisit,
      });
      Alert.alert('완료', '생활 습관이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '생활 습관 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="생활 습관 수정" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="생활 습관 수정" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* 기숙사 선택 */}
        {availableDorms.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              입사 희망 기숙사
            </Text>
            <CheckboxGroup
              options={availableDorms}
              values={selectedDormIds}
              onChange={setSelectedDormIds}
            />
          </View>
        )}

        {/* 흡연 여부 */}
        <View style={styles.section}>
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
        </View>

        {/* 수면 습관 - 온보딩 CoreHabitsScreen과 동일한 UI */}
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
            onChange={handleSleepHabitsChange}
          />
        </View>

        {/* 수면 시간 - 온보딩 SleepPatternsScreen과 동일한 TimeRangeSlider */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>수면 시간</Text>
          <TimeRangeSlider
            startValue={sleepStart}
            endValue={sleepEnd}
            min={0}
            max={24}
            onValuesChange={handleTimeChange}
            formatValue={formatSleepTime}
          />
        </View>

        {/* 생활 스타일 척도 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            생활 방식
          </Text>
          {LIFESTYLE_SCALES.map(scale => (
            <ScaleSelector
              key={scale.key}
              label={scale.label}
              description={scale.description}
              value={scaleValues[scale.key as keyof typeof scaleValues]}
              onChange={value => handleScaleChange(scale.key, value)}
              leftLabel={scale.leftLabel}
              rightLabel={scale.rightLabel}
            />
          ))}
        </View>

        {/* 외박 빈도 - 온보딩 SleepPatternsScreen과 동일한 3개 옵션 */}
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

        <Button
          title="저장"
          onPress={handleSave}
          loading={isSaving}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
});
