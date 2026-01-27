import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useAuth } from '../../contexts';
import { Card, Header, Button, RoomBtiBadge } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';

interface MyPageScreenProps {
  navigation: any;
}

export function MyPageScreen({ navigation }: MyPageScreenProps) {
  const { colors, setThemeMode, themeMode } = useTheme();
  const { user, logout, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();

  // Room-BTI 상태
  const [roomBti, setRoomBti] = useState<{
    animal: string;
    result: string;
  } | null>(null);

  // 화면 포커스 시 Room-BTI 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchRoomBti();
    }, []),
  );

  const fetchRoomBti = async () => {
    try {
      const response = await api.get<{
        roomBtiAnimal: string | null;
        roomBtiResult: string | null;
      }>(ENDPOINTS.ROOM_BTI.ME);
      if (response.roomBtiAnimal && response.roomBtiResult) {
        setRoomBti({
          animal: response.roomBtiAnimal,
          result: response.roomBtiResult,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Room-BTI:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      ' ',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              console.error('Delete account failed:', error);
              Alert.alert('오류', '회원 탈퇴 중 문제가 발생했습니다.');
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    {
      title: '프로필 수정',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: '생활 습관 수정',
      onPress: () => navigation.navigate('EditLifestyle'),
    },
    {
      title: '선호 조건 수정',
      onPress: () => navigation.navigate('EditPreferences'),
    },
    {
      title: '작성한 리뷰',
      onPress: () => navigation.navigate('MyReviews'),
    },
  ];

  const settingsItems = [
    {
      title: '다크모드',
      value: themeMode,
      onPress: () => {
        const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
        const currentIndex = modes.indexOf(themeMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setThemeMode(nextMode);
      },
    },
    {
      title: '알림 설정',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      title: '이용약관',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      title: '개인정보 처리방침',
      onPress: () => navigation.navigate('Privacy'),
    },
  ];

  const getThemeModeLabel = (mode: string) => {
    switch (mode) {
      case 'light':
        return '라이트';
      case 'dark':
        return '다크';
      case 'system':
        return '시스템';
      default:
        return mode;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="마이페이지" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* 프로필 카드 */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <Text style={[styles.avatarText, { color: colors.text.secondary }]}>
                {user?.nickname?.charAt(0) || user?.email?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.nickname, { color: colors.text.primary }]}>
                {user?.nickname || '이름 없음'}
              </Text>
              <Text style={[styles.email, { color: colors.text.secondary }]}>
                {user?.email}
              </Text>
              {roomBti && (
                <View style={styles.profileBadge}>
                  <RoomBtiBadge
                    animal={roomBti.animal}
                    result={roomBti.result}
                    size="small"
                  />
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Room-BTI 섹션 */}
        <Card style={styles.roomBtiCard}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
            Room-BTI
          </Text>
          {roomBti ? (
            <TouchableOpacity
              style={styles.roomBtiContent}
              onPress={() => navigation.navigate('RoomBtiIntro')}
              activeOpacity={0.7}>
              <RoomBtiBadge
                animal={roomBti.animal}
                result={roomBti.result}
                size="medium"
              />
              <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>
                →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.roomBtiButton, { backgroundColor: themeColors.primary + '10' }]}
              onPress={() => navigation.navigate('RoomBtiIntro')}
              activeOpacity={0.7}>
              <Text style={styles.roomBtiEmoji}>🏠</Text>
              <Text style={[styles.roomBtiButtonText, { color: themeColors.primary }]}>
                나의 룸BTI 알아보기
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* 메뉴 */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: colors.text.primary }]}>
                {item.title}
              </Text>
              <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>
                →
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* 설정 */}
        <Card style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
            설정
          </Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                index < settingsItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: colors.text.primary }]}>
                {item.title}
              </Text>
              {'value' in item ? (
                <Text style={[styles.menuValue, { color: themeColors.primary }]}>
                  {getThemeModeLabel(item.value)}
                </Text>
              ) : (
                <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>
                  →
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* 로그아웃 */}
        <Button
          title="로그아웃"
          variant="outline"
          onPress={handleLogout}
          fullWidth
          style={{ marginBottom: spacing.sm }}
        />

        {/* 회원 탈퇴 */}
        <Button
          title="회원 탈퇴"
          variant="ghost"
          onPress={handleDeleteAccount}
          fullWidth
          textStyle={{ color: themeColors.error }}
        />

        <Text style={[styles.version, { color: colors.text.tertiary }]}>
          버전 1.0.0
        </Text>
      </ScrollView>
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
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nickname: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
  },
  profileBadge: {
    marginTop: spacing.sm,
  },
  roomBtiCard: {
    marginBottom: spacing.md,
  },
  roomBtiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomBtiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  roomBtiEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  roomBtiButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  menuCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuText: {
    fontSize: fontSize.md,
  },
  menuArrow: {
    fontSize: fontSize.md,
  },
  menuValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  version: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});