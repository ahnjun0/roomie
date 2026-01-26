import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth, useTheme } from '../contexts';
import { RootStackParamList, MainTabParamList } from './types';
import {
  LoginScreen,
  VerifyEmailScreen,
  RegisterScreen,
  BasicInfoScreen,
  DormitorySelectScreen,
  CoreHabitsScreen,
  LifestyleScaleScreen,
  RoommatePreferencesScreen,
  SleepPatternsScreen,
  WeightGameScreen,
  MatchingDashboardScreen,
  ChatScreen,
  ChatListScreen,
  MatchDetailScreen,
  MyPageScreen,
  RoomBtiIntroScreen,
  RoomBtiTestScreen,
  RoomBtiResultScreen,
} from '../screens';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { colors: themeColors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: themeColors.text.tertiary,
      }}>
      <Tab.Screen
        name="Matching"
        component={MatchingDashboardScreen}
        options={{
          tabBarLabel: '매칭',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: '메시지',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const { colors: themeColors } = useTheme();

  if (isLoading) {
    return null; // 또는 스플래시 스크린
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}>
      {!isAuthenticated ? (
        // Auth Flow (회원가입 + 기본 정보 입력)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        </>
      ) : !isOnboardingComplete ? (
        // Onboarding Flow (추가 정보 입력)
        <>
          <Stack.Screen name="DormitorySelect" component={DormitorySelectScreen} />
          <Stack.Screen name="CoreHabits" component={CoreHabitsScreen} />
          <Stack.Screen name="LifestyleScale" component={LifestyleScaleScreen} />
          <Stack.Screen name="RoommatePreferences" component={RoommatePreferencesScreen} />
          <Stack.Screen name="SleepPatterns" component={SleepPatternsScreen} />
          <Stack.Screen name="WeightGame" component={WeightGameScreen} />
        </>
      ) : (
        // Main App
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="RoomBtiIntro" component={RoomBtiIntroScreen} />
          <Stack.Screen name="RoomBtiTest" component={RoomBtiTestScreen} />
          <Stack.Screen name="RoomBtiResult" component={RoomBtiResultScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
