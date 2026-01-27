export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  SignIn: { email?: string };
  ForgotPassword: { email?: string };
  VerifyEmail: { email: string; mode?: 'register' | 'reset' };
  Register: { email: string; tempToken: string };
  ResetPassword: { email: string; tempToken: string };

  // Onboarding Flow
  BasicInfo: undefined;
  DormitorySelect: undefined;
  CoreHabits: undefined;
  LifestyleScale: undefined;
  SleepPatterns: undefined;
  RoommatePreferences: undefined;
  PreferredLifestyle: undefined;
  WeightGame: undefined;

  // Main App
  MainTabs: undefined;

  // Stack Screens (accessible from tabs)
  MatchDetail: { userId: string };
  Chat: { chatRoomId: string; userId: string; userName?: string };
  Contract: { contractId: string };
  EditProfile: undefined;
  EditLifestyle: undefined;
  EditPreferences: undefined;
  MyReviews: undefined;
  NotificationSettings: undefined;
  Terms: undefined;
  Privacy: undefined;

  // Roommate Review
  RoommateReview: { targetUserId: string; targetNickname: string; bothEnded: boolean };

  // Help Center
  HelpCreate: undefined;
  HelpDetail: { postId: string };

  // Room-BTI Screens
  RoomBtiIntro: undefined;
  RoomBtiTest: undefined;
  RoomBtiResult: {
    result: string;
    animal: string;
    description: string;
    imageKey: string;
  };
};

export type MainTabParamList = {
  Matching: undefined;
  ChatList: undefined;
  HelpCenter: undefined;
  MyPage: undefined;
};
