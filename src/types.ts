export type GameType = 'arithmetic' | 'fraction' | 'pattern' | 'time' | 'seesaw';

export interface School {
  id: string;
  name: string;
  region: string;
  score: number;
  playerCount: number;
  mascot: string; // Emoji character
  color: string; // Tailwind class background
  textColor: string; // Tailwind class text
  rankChange: number; // For ▲/▼ styling
}

export interface Cheer {
  id: string;
  schoolId: string;
  schoolName: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface PlayerStats {
  schoolId: string;
  schoolName: string;
  nickname: string;
  totalScore: number;
  gamesPlayed: Record<GameType, number>;
}

export interface GameInfo {
  type: GameType;
  title: string;
  subtitle: string;
  desc: string;
  emoji: string;
  difficulty: '하' | '중' | '상';
  color: string;
  primaryBg: string;
}
