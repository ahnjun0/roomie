import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { Button, Input, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight } from '../../constants/theme';

interface EditProfileScreenProps {
  navigation: any;
}

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [age, setAge] = useState(String(user?.age || ''));
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const updateData: Record<string, any> = {};
    if (nickname && nickname !== user?.nickname) {
      updateData.nickname = nickname;
    }
    const ageNum = parseInt(age, 10);
    if (!isNaN(ageNum) && ageNum >= 1 && ageNum <= 100 && ageNum !== user?.age) {
      updateData.age = ageNum;
    }

    if (Object.keys(updateData).length === 0) {
      Alert.alert('알림', '변경된 내용이 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch(ENDPOINTS.USERS.ME, updateData);
      await refreshUser();
      Alert.alert('완료', '프로필이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="프로필 수정" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          프로필 정보를 수정하세요
        </Text>

        <View style={styles.form}>
          <Input
            label="닉네임"
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력하세요"
          />

          <Input
            label="나이"
            value={age}
            onChangeText={setAge}
            placeholder="나이를 입력하세요"
            keyboardType="number-pad"
          />

          <View style={styles.readOnlySection}>
            <Text style={[styles.readOnlyLabel, { color: colors.text.secondary }]}>
              이메일
            </Text>
            <Text style={[styles.readOnlyValue, { color: colors.text.tertiary }]}>
              {user?.email}
            </Text>
          </View>

          <View style={styles.readOnlySection}>
            <Text style={[styles.readOnlyLabel, { color: colors.text.secondary }]}>
              성별
            </Text>
            <Text style={[styles.readOnlyValue, { color: colors.text.tertiary }]}>
              {user?.gender === 'MALE' ? '남성' : '여성'}
            </Text>
          </View>

          <View style={styles.readOnlySection}>
            <Text style={[styles.readOnlyLabel, { color: colors.text.secondary }]}>
              국적
            </Text>
            <Text style={[styles.readOnlyValue, { color: colors.text.tertiary }]}>
              {user?.nationality === 'KOREAN' ? '한국인' : '외국인'}
            </Text>
          </View>
        </View>

        <Button
          title="저장"
          onPress={handleSave}
          loading={isLoading}
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
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  readOnlySection: {
    marginBottom: spacing.md,
  },
  readOnlyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  readOnlyValue: {
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
});
