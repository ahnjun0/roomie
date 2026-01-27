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
import { Button, RadioGroup, WeightAllocator, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../../constants/theme';
import { PREFERENCE_OPTIONS, WEIGHT_CATEGORIES } from '../../constants/data';

interface EditPreferencesScreenProps {
  navigation: any;
}

interface PreferenceData {
  prefNationality: string | null;
  prefStudentId: string | null;
  weightNoise: number;
  weightClean: number;
  weightFood: number;
  weightHabit: number;
  weightTime: number;
  weightTemp: number;
}

const TOTAL_BUDGET = 70000;
const UNIT_AMOUNT = 10000;

export function EditPreferencesScreen({ navigation }: EditPreferencesScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter preferences
  const [prefNationality, setPrefNationality] = useState<string | null>(null);
  const [prefStudentId, setPrefStudentId] = useState<string | null>(null);

  // Weight preferences (stored as 0-70 on backend, displayed as 0/1/3 on frontend)
  const [weights, setWeights] = useState<Record<string, number>>({
    noise: 2,
    cleanliness: 1,
    food: 1,
    habit: 1,
    time: 1,
    temp: 1,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const pref = await api.get<PreferenceData>(ENDPOINTS.USERS.PREFERENCES);

      // Map nationality value to radio option
      if (pref.prefNationality) {
        // Backend sends "KOREAN" or "FOREIGNER", map to "SAME" or "ANY" for radio
        setPrefNationality(pref.prefNationality === 'KOREAN' || pref.prefNationality === 'FOREIGNER' ? 'SAME' : 'ANY');
      }
      setPrefStudentId(pref.prefStudentId);

      // Convert backend weights (0-70) back to frontend units (0, 1, 3)
      setWeights({
        noise: pref.weightNoise / 10,
        cleanliness: pref.weightClean / 10,
        food: pref.weightFood / 10,
        habit: pref.weightHabit / 10,
        time: pref.weightTime / 10,
        temp: pref.weightTemp / 10,
      });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      Alert.alert('오류', '선호 조건 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const totalAllocated = Object.values(weights).reduce(
    (sum, v) => sum + v * UNIT_AMOUNT,
    0,
  );
  const isWeightValid = totalAllocated === TOTAL_BUDGET;

  const handleSave = async () => {
    if (!isWeightValid) {
      Alert.alert('알림', '7만원을 모두 배분해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // Save filters - 'SAME' means user's own nationality
      const nationalityValue = prefNationality === 'SAME' ? (user?.nationality || 'KOREAN') : null;
      await api.put(ENDPOINTS.USERS.PREFERENCE_FILTERS, {
        prefNationality: nationalityValue,
        prefStudentId,
      });

      // Save weights (convert frontend 0/1/3 to backend 0-70)
      await api.put(ENDPOINTS.USERS.PREFERENCE_WEIGHTS, {
        weightNoise: weights.noise * 10,
        weightClean: weights.cleanliness * 10,
        weightFood: weights.food * 10,
        weightHabit: weights.habit * 10,
        weightTime: weights.time * 10,
        weightTemp: weights.temp * 10,
      });

      Alert.alert('완료', '선호 조건이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '선호 조건 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="선호 조건 수정" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="선호 조건 수정" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* 필터 조건 */}
        <Text style={[styles.sectionHeader, { color: themeColors.primary }]}>
          룸메이트 조건
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            국적
          </Text>
          <RadioGroup
            options={PREFERENCE_OPTIONS.nationality}
            value={prefNationality}
            onChange={setPrefNationality}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            학년
          </Text>
          <RadioGroup
            options={PREFERENCE_OPTIONS.studentYear}
            value={prefStudentId}
            onChange={setPrefStudentId}
          />
        </View>

        {/* 가중치 설정 */}
        <Text style={[styles.sectionHeader, { color: themeColors.primary }]}>
          중요도 설정 (7만원 배분)
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          각 항목에 3만원, 1만원, 0원을 배분해주세요.
        </Text>

        <WeightAllocator
          categories={WEIGHT_CATEGORIES}
          values={weights}
          onChange={handleWeightChange}
          totalBudget={TOTAL_BUDGET}
          unitAmount={UNIT_AMOUNT}
        />

        <View style={styles.footer}>
          <Button
            title="저장"
            onPress={handleSave}
            disabled={!isWeightValid}
            loading={isSaving}
            fullWidth
          />
        </View>
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
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
    lineHeight: fontSize.md * 1.5,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
