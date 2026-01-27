// 앱에서 사용하는 정적 데이터
export const NATIONALITIES = [
  { value: 'KOREAN', label: '한국인' },
  { value: 'FOREIGNER', label: '외국인' },
] as const;

export const DORMITORIES = [
  { id: 1, name: '성실관', gender: 'MALE' },
  { id: 2, name: '봉사관', gender: 'MALE' },
  { id: 3, name: '진리관', gender: 'FEMALE' },
  { id: 4, name: '화원관', gender: 'FEMALE' },
] as const;

export const SLEEP_HABITS = [
  { value: 'SNORING', label: '코골이' },
  { value: 'GRINDING', label: '이갈이' },
  { value: 'TALKING', label: '잠꼬대' },
  { value: 'TOSSING', label: '뒤척임' },
  { value: 'NONE', label: '없음' },
] as const;

export const CLEANING_HABITS = [
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKLY', label: '주 1회' },
  { value: 'WHEN_DIRTY', label: '더러우면' },
  { value: 'NEVER', label: '거의 안함' },
] as const;

export const PREFERENCE_OPTIONS = {
  nationality: [
    { value: 'SAME', label: '동일 국적' },
    { value: 'ANY', label: '상관없음' },
  ],
  studentYear: [
    { value: 'SAME', label: '동일 학년' },
    { value: 'SENIOR', label: '선배' },
    { value: 'JUNIOR', label: '후배' },
    { value: 'ANY', label: '상관없음' },
  ],
} as const;

export const WEIGHT_CATEGORIES = [
  {
    key: 'noise',
    emoji: '🔇',
    label: '소음도',
    tag: '궁합',
    options: {
      high: { label: '완벽한 룸메', title: '데시벨 소울메이트', desc: '우리 방의 적정 볼륨이 똑같음' },
      mid: { label: '적당한 인간미', title: '노캔으로 커버 가능', desc: '거슬리긴 한데 이어폰 끼면 됨' },
      low: { label: '지옥의 룸메', title: '도서관 vs 클럽', desc: '정적을 원하는데 상대는 시끄러움' },
    },
  },
  {
    key: 'cleanliness',
    emoji: '✨',
    label: '청결도',
    tag: '궁합',
    options: {
      high: { label: '완벽한 룸메', title: '청소 주기 동기화', desc: '더러움을 느끼는 타이밍이 일치' },
      mid: { label: '적당한 인간미', title: '흐린 눈 가능', desc: '조금 안 맞지만 참고 넘어갈 만함' },
      low: { label: '지옥의 룸메', title: '무균실 vs 쓰레기장', desc: '결벽증과 귀차니즘의 환장 콜라보' },
    },
  },
  {
    key: 'food',
    emoji: '🍔',
    label: '음식 섭취',
    tag: '궁합',
    options: {
      high: { label: '완벽한 룸메', title: '쩝쩝박사 파트너', desc: '허용하는 메뉴/냄새 기준이 같음' },
      mid: { label: '적당한 인간미', title: '환기 타임 협상가', desc: '냄새 차이는 있지만 조율 가능' },
      low: { label: '지옥의 룸메', title: '후각 테러리스트', desc: '냄새 극혐 vs 청국장/마라탕 러버' },
    },
  },
  {
    key: 'habit',
    emoji: '💤',
    label: '잠버릇',
    tag: '습관',
    options: {
      high: { label: '완벽한 룸메', title: '기절 후 시체', desc: '업어가도 모르게 조용함' },
      mid: { label: '적당한 인간미', title: '가끔 뒤척임', desc: '피곤하면 코 살짝 곯음' },
      low: { label: '지옥의 룸메', title: '코골이 오케스트라', desc: '이갈이+잠꼬대+코골이 3중주' },
    },
  },
  {
    key: 'time',
    emoji: '🌙',
    label: '취침 시간',
    tag: '패턴',
    options: {
      high: { label: '완벽한 룸메', title: '수면 패턴 도플갱어', desc: '생활 패턴 완벽 동기화' },
      mid: { label: '적당한 인간미', title: '우원재 (시차 있음)', desc: '2~3시간 정도 시차 발생' },
      low: { label: '지옥의 룸메', title: '유럽인 (완전 반대)', desc: '파리의 시간을 사는 친구' },
    },
  },
  {
    key: 'light',
    emoji: '💡',
    label: '소등 매너',
    tag: '습관',
    options: {
      high: { label: '완벽한 룸메', title: '인간 조도 센서', desc: '내가 눕는 순간 알아서 불 꺼짐' },
      mid: { label: '적당한 인간미', title: '새벽의 반딧불이', desc: '전체 소등은 OK, 스탠드는 켬' },
      low: { label: '지옥의 룸메', title: '24시간 편의점', desc: '불 끄면 죽는 병 걸림 (형광등 ON)' },
    },
  },
  {
    key: 'temp',
    emoji: '🌡️',
    label: '실내 온도',
    tag: '체질',
    options: {
      high: { label: '완벽한 룸메', title: '인간 온도계', desc: '너한테 다 맞춰줌 (체질 비슷)' },
      mid: { label: '적당한 인간미', title: '계절 타는 편', desc: '가끔 안 맞지만 이불로 조절' },
      low: { label: '지옥의 룸메', title: '북극곰 or 사막여우', desc: '에어컨 18도 vs 히터 풀가동' },
    },
  },
] as const;

export const LIFESTYLE_SCALES = [
  {
    key: 'noiseLevel',
    label: '소음 수준',
    description: '생활 소음에 대한 민감도',
    leftLabel: '조용한 환경 선호',
    rightLabel: '소음에 관대함',
  },
  {
    key: 'cleanliness',
    label: '청결도',
    description: '청소 및 정리 습관',
    leftLabel: '깔끔함 중시',
    rightLabel: '다소 어질러도 OK',
  },
  {
    key: 'indoorEating',
    label: '실내 취식',
    description: '방 안에서 음식 먹기',
    leftLabel: '취식 불가',
    rightLabel: '자유롭게 취식',
  },
  {
    key: 'lightsOut',
    label: '소등 시간',
    description: '밤에 불 끄는 시간',
    leftLabel: '일찍 소등',
    rightLabel: '늦게 소등',
  },
  {
    key: 'temperature',
    label: '방 온도',
    description: '선호하는 실내 온도',
    leftLabel: '시원하게',
    rightLabel: '따뜻하게',
  },
] as const;

export const ENTRANCE_YEARS = [
  { value: '2020', label: '20학번' },
  { value: '2021', label: '21학번' },
  { value: '2022', label: '22학번' },
  { value: '2023', label: '23학번' },
  { value: '2024', label: '24학번' },
  { value: '2025', label: '25학번' },
] as const;

export const ONBOARDING_STEPS = {
  // 1단계: 내 정보 입력
  BASIC_INFO: { current: 1, total: 8, label: '기본 정보' },
  DORMITORY_SELECT: { current: 2, total: 8, label: '기숙사 선택' },
  CORE_HABITS: { current: 3, total: 8, label: '핵심 습관' },
  LIFESTYLE_SCALE: { current: 4, total: 8, label: '생활 스타일' },
  SLEEP_PATTERNS: { current: 5, total: 8, label: '수면 패턴' },
  // 2단계: 원하는 상대방 정보 입력
  ROOMMATE_PREFERENCES: { current: 6, total: 8, label: '룸메이트 조건' },
  PREFERRED_LIFESTYLE: { current: 7, total: 8, label: '원하는 생활 방식' },
  // 3단계: 중요도 입력
  WEIGHT_GAME: { current: 8, total: 8, label: '중요도 설정' },
} as const;

// 원하는 룸메이트의 생활 방식 (LIFESTYLE_SCALES와 동일한 구조)
export const PREFERRED_LIFESTYLE_SCALES = [
  {
    key: 'prefNoiseLevel',
    label: '소음 수준',
    description: '원하는 룸메이트의 소음 민감도',
    leftLabel: '조용한 환경 선호',
    rightLabel: '소음에 관대함',
  },
  {
    key: 'prefCleanliness',
    label: '청결도',
    description: '원하는 룸메이트의 청소 습관',
    leftLabel: '깔끔함 중시',
    rightLabel: '다소 어질러도 OK',
  },
  {
    key: 'prefIndoorEating',
    label: '실내 취식',
    description: '원하는 룸메이트의 실내 취식 여부',
    leftLabel: '취식 불가',
    rightLabel: '자유롭게 취식',
  },
  {
    key: 'prefLightsOut',
    label: '소등 시간',
    description: '원하는 룸메이트의 소등 시간',
    leftLabel: '일찍 소등',
    rightLabel: '늦게 소등',
  },
  {
    key: 'prefTemperature',
    label: '방 온도',
    description: '원하는 룸메이트의 온도 선호',
    leftLabel: '시원하게',
    rightLabel: '따뜻하게',
  },
] as const;
