export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  Register: undefined;
  VerifyEmail: {email: string};

  // Onboarding Flow
  BasicInfo: undefined;
  DormitorySelect: undefined;
  LifestyleChecklist: undefined;
  PreferenceSetup: undefined;
  WeightGame: undefined;

  // Main App
  MainTabs: undefined;

  // Matching
  MatchDetail: {userId: number};
  Chat: {matchId: number};
};

export type MainTabParamList = {
  Home: undefined;
  Matching: undefined;
  Community: undefined;
  MyPage: undefined;
};
