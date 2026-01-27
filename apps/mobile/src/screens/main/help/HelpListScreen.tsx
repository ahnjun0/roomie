import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { Header } from '../../../components';
import { getHelpPosts } from '../../../services/help';
import { HelpCategory, HelpPost, HelpStatus } from '../../../types';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../../constants/theme';

interface HelpListScreenProps {
  navigation: any;
}

export function HelpListScreen({ navigation }: HelpListScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<HelpPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | undefined>(undefined);

  const fetchPosts = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await getHelpPosts(1, 20, selectedCategory);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch help posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderItem = ({ item }: { item: HelpPost }) => {
    const isSolved = item.status === 'SOLVED';
    
    return (
      <TouchableOpacity
        style={[styles.postItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('HelpDetail', { postId: item.id })}
        activeOpacity={0.7}>
        <View style={styles.postHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: item.category === 'BUG' ? themeColors.error : themeColors.secondary }]}>
            <Text style={styles.categoryText}>
              {item.category === 'BUG' ? '벌레퇴치' : '고장신고'}
            </Text>
          </View>
          <Text style={[styles.statusText, { color: isSolved ? themeColors.success : themeColors.primary }]}>
            {isSolved ? '해결됨' : '진행중'}
          </Text>
        </View>

        <Text style={[styles.postTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.postContent, { color: colors.text.secondary }]} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <Text style={[styles.authorName, { color: colors.text.tertiary }]}>
            {item.author.nickname}
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
        게시글이 없습니다.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="게시판" 
        rightIcon="plus" 
        onRightPress={() => navigation.navigate('HelpCreate')} 
      />

      <View style={[styles.filterContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterButton, 
            !selectedCategory && { backgroundColor: themeColors.primary }
          ]}
          onPress={() => setSelectedCategory(undefined)}>
          <Text style={[styles.filterText, !selectedCategory ? { color: '#fff' } : { color: colors.text.secondary }]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton, 
            selectedCategory === 'BUG' && { backgroundColor: themeColors.primary }
          ]}
          onPress={() => setSelectedCategory('BUG')}>
          <Text style={[styles.filterText, selectedCategory === 'BUG' ? { color: '#fff' } : { color: colors.text.secondary }]}>벌레퇴치</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton, 
            selectedCategory === 'REPAIR' && { backgroundColor: themeColors.primary }
          ]}
          onPress={() => setSelectedCategory('REPAIR')}>
          <Text style={[styles.filterText, selectedCategory === 'REPAIR' ? { color: '#fff' } : { color: colors.text.secondary }]}>고장신고</Text>
        </TouchableOpacity>
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
            { paddingBottom: insets.bottom + spacing.lg },
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
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
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
  postContent: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
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
});
