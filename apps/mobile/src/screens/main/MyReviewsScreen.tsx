import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { ReviewCard, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight } from '../../constants/theme';

interface MyReviewsScreenProps {
  navigation: any;
}

interface ReviewItem {
  id: number;
  reviewerId: string;
  targetId: string;
  content: string;
  score: number;
  createdAt: string;
}

export function MyReviewsScreen({ navigation }: MyReviewsScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get<{ data: ReviewItem[] }>(
        ENDPOINTS.USERS.REVIEWS_WRITTEN,
      );
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      Alert.alert('오류', '리뷰를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
        작성한 리뷰가 없습니다.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="작성한 리뷰" showBack onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.secondary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
            reviews.length === 0 && styles.emptyList,
          ]}
          renderItem={({ item }) => (
            <ReviewCard
              reviewerName="나"
              content={item.content}
              score={item.score}
              createdAt={formatDate(item.createdAt)}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            reviews.length > 0 ? (
              <Text style={[styles.countText, { color: colors.text.secondary }]}>
                총 {reviews.length}개의 리뷰
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
});
