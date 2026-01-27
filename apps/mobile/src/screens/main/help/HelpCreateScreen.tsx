import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { Header, Input, Button } from '../../../components';
import { createHelpPost } from '../../../services/help';
import { HelpCategory } from '../../../types';
import { spacing, colors as themeColors } from '../../../constants/theme';

interface HelpCreateScreenProps {
  navigation: any;
}

export function HelpCreateScreen({ navigation }: HelpCreateScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<HelpCategory>('BUG');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await createHelpPost({
        category,
        title: title.trim(),
        content: content.trim(),
      });
      Alert.alert('성공', '게시글이 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to create help post:', error);
      Alert.alert('오류', '게시글 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="글쓰기" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.categoryContainer}>
            <Button
              title="벌레퇴치"
              variant={category === 'BUG' ? 'primary' : 'outline'}
              onPress={() => setCategory('BUG')}
              style={[styles.categoryButton, { marginRight: spacing.sm }]}
              size="small"
            />
            <Button
              title="고장신고"
              variant={category === 'REPAIR' ? 'primary' : 'outline'}
              onPress={() => setCategory('REPAIR')}
              style={styles.categoryButton}
              size="small"
            />
          </View>

          <Input
            label="제목"
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="내용"
            placeholder="자세한 내용을 입력하세요"
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.contentInput}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            title="등록하기"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  categoryButton: {
    flex: 1,
  },
  contentInput: {
    height: 200,
  },
  footer: {
    padding: spacing.md,
  },
});
