import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { Header } from '../../../components';
import { getDeliveryPosts } from '../../../services/delivery';
import { DeliveryPostListItem, FoodCategory } from '../../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  colors as themeColors,
} from '../../../constants/theme';

interface DeliveryListScreenProps {
  navigation: any;
}

const FOOD_CATEGORIES: { value: FoodCategory | undefined; label: string }[] = [
  { value: undefined, label: '전체' },
  { value: 'KOREAN', label: '한식' },
  { value: 'CHINESE', label: '중식' },
  { value: 'JAPANESE', label: '일식' },
  { value: 'WESTERN', label: '양식' },
  { value: 'CHICKEN', label: '치킨' },
  { value: 'PIZZA', label: '피자' },
  { value: 'DESSERT', label: '디저트' },
  { value: 'OTHER', label: '기타' },
];

const CATEGORY_COLORS: Record<string, string> = {
  KOREAN: '#D4A574',
  CHINESE: '#E74C3C',
  JAPANESE: '#3498DB',
  WESTERN: '#9B59B6',
  FASTFOOD: '#F39C12',
  CHICKEN: '#F39C12',
  PIZZA: '#E67E22',
  DESSERT: '#FF69B4',
  OTHER: '#95A5A6',
};

const getCategoryLabel = (category: string): string => {
  const found = FOOD_CATEGORIES.find(c => c.value === category);
  return found?.label || category;
};

export function DeliveryListScreen({ navigation }: DeliveryListScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<DeliveryPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    FoodCategory | undefined
  >(undefined);

  const fetchPosts = useCallback(
    async (refresh: boolean = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await getDeliveryPosts();
        let filteredPosts = response.data;

        if (selectedCategory) {
          filteredPosts = filteredPosts.filter(
            post => post.foodCategory === selectedCategory,
          );
        }

        setPosts(filteredPosts);
      } catch (error) {
        console.error('Failed to fetch delivery posts:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedCategory],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPosts();
    });
    return unsubscribe;
  }, [navigation, fetchPosts]);

  const renderItem = ({ item }: { item: DeliveryPostListItem }) => {
    const categoryColor =
      CATEGORY_COLORS[item.foodCategory] || CATEGORY_COLORS.OTHER;

    return (
      <TouchableOpacity
        style={[
          styles.postItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate('DeliveryDetail', { postId: item.id })}
        activeOpacity={0.7}>
        <View style={styles.postHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(item.foodCategory)}
            </Text>
          </View>
          <Text
            style={[
              styles.statusText,
              {
                color: item.isClosed
                  ? themeColors.error
                  : themeColors.success,
              },
            ]}>
            {item.isClosed ? '마감' : '모집중'}
          </Text>
        </View>

        <Text
          style={[styles.postTitle, { color: colors.text.primary }]}
          numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.participantInfo}>
          <Text style={[styles.participantText, { color: themeColors.primary }]}>
            {item.participantCount}/{item.maxParticipants}명 참여중
          </Text>
        </View>

        <View style={styles.postFooter}>
          <Text style={[styles.authorName, { color: colors.text.tertiary }]}>
            {item.author.nickname || '익명'}
          </Text>
          <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        배달 팟이 없습니다.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="배달 팟"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.filterWrapper, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}>
          {FOOD_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.label}
              style={[
                styles.filterButton,
                selectedCategory === category.value && {
                  backgroundColor: themeColors.primary,
                },
              ]}
              onPress={() => setSelectedCategory(category.value)}>
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category.value
                    ? { color: '#fff' }
                    : { color: colors.text.secondary },
                ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.listContentEmpty,
            { paddingBottom: insets.bottom + spacing.lg + 56 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchPosts(true)}
              tintColor={themeColors.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: '#FF6B35', bottom: insets.bottom + spacing.lg },
        ]}
        onPress={() => navigation.navigate('DeliveryForm')}
        activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterWrapper: {
    borderBottomWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  listContent: {
    padding: spacing.md,
  },
  listContentEmpty: {
    flex: 1,
  },
  postItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  postTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  participantInfo: {
    marginBottom: spacing.sm,
  },
  participantText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  authorName: {
    fontSize: fontSize.sm,
  },
  dateText: {
    fontSize: fontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
