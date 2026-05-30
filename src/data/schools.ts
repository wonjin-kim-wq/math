import { School, Cheer, GameInfo } from '../types';

export const INITIAL_SCHOOLS: School[] = [];

export const INITIAL_CHEERS: Cheer[] = [];

export const GAMES: GameInfo[] = [
  {
    type: 'arithmetic',
    title: '사칙연산 버블팝',
    subtitle: '빠른 연산 순발력 게임',
    desc: '화면에 떠오르는 버블 중 올바른 정답을 가진 버블을 팡! 터뜨리세요. 갈수록 빨라집니다!',
    emoji: '🎈',
    difficulty: '하',
    color: 'from-pink-400 to-rose-500',
    primaryBg: 'bg-rose-50 border-rose-200',
  },
  {
    type: 'fraction',
    title: '분수 피자 셰프',
    subtitle: '피자 조각으로 배우는 분수',
    desc: '배고픈 손님들이 요구하는 분수만큼 피자 조각을 구워 서빙하세요! 분수 크기 비교 챌린지.',
    emoji: '🍕',
    difficulty: '중',
    color: 'from-amber-400 to-orange-500',
    primaryBg: 'bg-amber-50 border-amber-200',
  },
  {
    type: 'pattern',
    title: '규칙 기차 레일',
    subtitle: '수열 패턴 빈칸 채우기',
    desc: '기차가 역에 멈추기 전에 끊어진 철로의 수열 규칙을 찾아 올바른 다음 숫자를 채우세요!',
    emoji: '🚂',
    difficulty: '중',
    color: 'from-emerald-400 to-teal-500',
    primaryBg: 'bg-emerald-50 border-emerald-200',
  },
  {
    type: 'time',
    title: '시간 요정의 시계',
    subtitle: '아날로그 시간 보기 게임',
    desc: '시간 요정이 주는 시간 미션에 맞춰 시계의 분침과 시침을 직접 돌려 시각을 맞춰보아요!',
    emoji: '⏰',
    difficulty: '하',
    color: 'from-indigo-400 to-violet-500',
    primaryBg: 'bg-indigo-50 border-indigo-200',
  },
  {
    type: 'seesaw',
    title: '무게 균형 시소',
    subtitle: '부등호와 비례식 저울',
    desc: '시소가 어느 쪽으로 기울지 부등호(<, =, >)를 선택하거나, 시소를 수평으로 만들 무게 추를 골라 저울질해요!',
    emoji: '⚖️',
    difficulty: '상',
    color: 'from-sky-400 to-blue-500',
    primaryBg: 'bg-sky-50 border-sky-200',
  },
];
