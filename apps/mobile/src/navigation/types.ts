export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  VerifyEmail: { email: string };
  Register: { email: string; tempToken: string };

  // Onboarding Flow
  BasicInfo: undefined;
  DormitorySelect: undefined;
  CoreHabits: undefined;
  LifestyleScale: undefined;
  RoommatePreferences: undefined;
  SleepPatterns: undefined;
  WeightGame: undefined;

  // Main App
  MainTabs: undefined;

  // Stack Screens (accessible from tabs)
  MatchDetail: { userId: number };
  Chat: { chatRoomId: string; userId: number; userName?: string };
  EditProfile: undefined;
  EditLifestyle: undefined;
  EditPreferences: undefined;
  MyReviews: undefined;
  NotificationSettings: undefined;
  Terms: undefined;
  Privacy: undefined;
};

export type MainTabParamList = {
  Matching: undefined;
  ChatList: undefined;
  MyPage: undefined;
};
