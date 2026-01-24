// 앱에서 사용하는 정적 데이터
export const NATIONALITIES = [
  { value: 'korean', label: '한국' },
  { value: 'chinese', label: '중국' },
  { value: 'japanese', label: '일본' },
  { value: 'vietnamese', label: '베트남' },
  { value: 'american', label: '미국' },
  { value: 'other', label: '기타' },
] as const;

export const DORMITORIES = [
  { id: 1, name: '성실관', gender: 'male' },
  { id: 2, name: '봉사관', gender: 'male' },
  { id: 3, name: '진리관', gender: 'female' },
  { id: 4, name: '화원관', gender: 'female' },
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
  { key: 'smoking', label: '흡연 여부', icon: 'smoking_rooms' },
  { key: 'sleep', label: '수면 시간', icon: 'bedtime' },
  { key: 'cleanliness', label: '청소 습관', icon: 'cleaning_services' },
  { key: 'noise', label: '소음 민감도', icon: 'volume_up' },
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
