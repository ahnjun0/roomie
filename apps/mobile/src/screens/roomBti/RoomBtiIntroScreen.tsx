import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { Header, Button, Card } from '../../components';
import { spacing, fontSize, fontWeight, borderRadius, colors } from '../../constants/theme';

interface RoomBtiIntroScreenProps {
  navigation: any;
}

export function RoomBtiIntroScreen({ navigation }: RoomBtiIntroScreenProps) {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    navigation.navigate('RoomBtiTest');
  };

  const axes = [
    { left: 'S 공유형', right: 'P 개인형', desc: '사람들과 어울리기 vs 혼자만의 시간' },
    { left: 'C 청결형', right: 'F 자유형', desc: '깔끔하게 정리 vs 편안하게 생활' },
    { left: 'D 아침형', right: 'N 올빼미형', desc: '일찍 자고 일찍 vs 늦게 자고 늦게' },
    { left: 'S 예민형', right: 'I 둔감형', desc: '작은 것도 민감 vs 웬만하면 OK' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Room-BTI" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>
            나의 룸메이트 성향은?
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
            12개의 질문으로 알아보는{'\n'}나만의 기숙사 생활 유형
          </Text>
        </View>

        {/* Axis Explanation */}
        <Card style={styles.axisCard}>
          <Text style={[styles.axisTitle, { color: themeColors.text.primary }]}>
            4가지 성향 축
          </Text>
          {axes.map((axis, index) => (
            <View
              key={index}
              style={[
                styles.axisItem,
                index < axes.length - 1 && {
                  borderBottomWidth: 1,
                  borderColor: themeColors.border,
                },
              ]}>
              <View style={styles.axisLabels}>
                <View style={[styles.axisBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.axisLabel, { color: colors.primary }]}>
                    {axis.left}
                  </Text>
                </View>
                <Text style={[styles.axisVs, { color: themeColors.text.tertiary }]}>
                  vs
                </Text>
                <View style={[styles.axisBadge, { backgroundColor: themeColors.surface }]}>
                  <Text style={[styles.axisLabel, { color: themeColors.text.secondary }]}>
                    {axis.right}
                  </Text>
                </View>
              </View>
              <Text style={[styles.axisDesc, { color: themeColors.text.secondary }]}>
                {axis.desc}
              </Text>
            </View>
          ))}
        </Card>

        <Text style={[styles.timeInfo, { color: themeColors.text.tertiary }]}>
          예상 소요 시간: 약 2분
        </Text>

        <Button title="테스트 시작하기" onPress={handleStart} fullWidth />
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
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  axisCard: {
    marginBottom: spacing.lg,
  },
  axisTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  axisItem: {
    paddingVertical: spacing.md,
  },
  axisLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  axisBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  axisLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  axisVs: {
    marginHorizontal: spacing.sm,
    fontSize: fontSize.sm,
  },
  axisDesc: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
  timeInfo: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
