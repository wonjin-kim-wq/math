import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Send, MessageSquare, Star, Sparkles } from 'lucide-react';
import { School, Cheer } from '../types';
import { playSelect } from './SoundEffects';

interface LeaderboardProps {
  schools: School[];
  cheers: Cheer[];
  currentSchool: School | null;
  onAddCheer: (text: string, author: string) => void;
}

export default function Leaderboard({
  schools,
  cheers,
  currentSchool,
  onAddCheer,
}: LeaderboardProps) {
  const [cheerText, setCheerText] = useState('');
  const [nickname, setNickname] = useState('');

  // Sort schools by score desc
  const sortedSchools = [...schools].sort((a, b) => b.score - a.score);
  const maxScore = sortedSchools[0]?.score || 1;

  const handleCheerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerText.trim()) return;

    playSelect();
    const authorName = nickname.trim() || '익명의초등생';
    onAddCheer(cheerText.trim(), authorName);
    
    // Reset inputs
    setCheerText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. ANIMATED LEADERBOARD COMPONENT (takes 2 cols on large screen) */}
      <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col border border-transparent">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-50" />
            <h2 className="text-lg font-extrabold text-[#191F28]">🏆 실시간 학교간 대항 리그 순위</h2>
          </div>
          <span className="text-[10px] bg-blue-50 text-[#3182F6] px-3 py-1 rounded-full font-sans font-extrabold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3182F6] fill-current" />
            실시간 집계 중
          </span>
        </div>

        {/* Dynamic School bars leaderboard */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[385px] pr-1 pb-2">
          {sortedSchools.length > 0 ? (
            sortedSchools.map((school, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const sizePercent = (school.score / maxScore) * 100;
              const isMyRepresentSchool = currentSchool?.id === school.id;

              const medalDict: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

              return (
                <motion.div
                  key={school.id}
                  id={`leaderboard-item-${school.id}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all relative overflow-hidden ${
                    isMyRepresentSchool
                      ? 'border-[#3182F6] bg-blue-50/20'
                      : 'border-[#F2F4F6] bg-white hover:border-[#E5E8EB]'
                  }`}
                >
                  {/* Ranking Index / Medal */}
                  <div className="flex items-center gap-2.5 shrink-0 z-10">
                    <div className="w-7 h-7 flex items-center justify-center font-mono font-black text-sm text-[#4E5968]">
                      {isTop3 ? (
                        <span className="text-xl select-none">{medalDict[rank]}</span>
                      ) : (
                        <span>{rank}</span>
                      )}
                    </div>

                    {/* Icon Shield representation */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${school.color} shadow-xs select-none relative`}>
                      <div className="absolute inset-0 bg-white/10 rounded-full" />
                      <span className="text-lg z-10">{school.mascot}</span>
                    </div>
                  </div>

                  {/* School title & progressive bar charts */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-baseline justify-between mb-1.5 gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-extrabold text-[#191F28] text-xs truncate">
                          {school.name}
                        </p>
                        {isMyRepresentSchool && (
                          <span className="text-[9px] bg-[#3182F6] text-white font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
                            My 등교
                          </span>
                        )}
                      </div>
                      
                      <p className="font-mono text-xs font-black text-[#191F28] shrink-0">
                        {school.score.toLocaleString()} <span className="text-[10px] font-semibold text-[#8B95A1]">점</span>
                      </p>
                    </div>

                    {/* Horizontal visual comparative bars */}
                    <div className="h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sizePercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${school.color}`}
                      />
                    </div>
                  </div>

                  {/* Rank change ▲/▼ indicators */}
                  <div className="w-12 shrink-0 text-center flex flex-col items-center justify-center z-10 font-medium">
                    {school.rankChange > 0 ? (
                      <span className="text-emerald-500 font-mono text-xs font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5 fill-current" />
                        {school.rankChange}
                      </span>
                    ) : school.rankChange < 0 ? (
                      <span className="text-rose-500 font-mono text-xs font-bold flex items-center gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5 fill-current" />
                        {Math.abs(school.rankChange)}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs font-mono">-</span>
                    )}
                    <p className="text-[9px] text-[#8B95A1] font-mono mt-0.5">{school.playerCount}명</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 text-[#8B95A1]">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto block mb-3 animate-pulse" />
              <p className="font-bold text-xs">현재 등록된 대항전 학교가 없습니다.</p>
              <p className="text-[10.5px] text-[#8B95A1]/70 mt-1">우리 학교를 등록하고 1위 스코어를 쟁취하세요! 🏆</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. SCHOOL CHEER MESSAGES WALL (takes 1 col on large screen) */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between border border-transparent">
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#3182F6] fill-blue-50" />
            <h2 className="text-lg font-extrabold text-[#191F28]">📣 실시간 응원 광장</h2>
          </div>
          <p className="text-[11px] text-[#8B95A1] mt-1 font-medium">
            동문들과 힘을 합쳐 학교의 점수 상승을 응원해보세요!
          </p>
        </div>

        {/* Cheers stream lists */}
        <div className="flex-1 overflow-y-auto max-h-[220px] mb-4 space-y-2.5 pr-1">
          {cheers.length > 0 ? (
            <AnimatePresence initial={false}>
              {cheers.map((cheer) => {
                const schoolMatch = schools.find((s) => s.id === cheer.schoolId);
                const mascot = schoolMatch?.mascot || '🏫';
                const themeClass = schoolMatch?.color || 'bg-slate-400';

                return (
                  <motion.div
                    key={cheer.id}
                    id={`cheer-line-${cheer.id}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-[#F9FAFB] border border-[#F2F4F6] rounded-2xl flex items-start gap-2.5 shrink-0"
                  >
                    {/* Small rounded circle mascot */}
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white ${themeClass} shadow-inner`}>
                      {mascot}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-bold text-[#191F28] truncate">
                          {cheer.schoolName} • <span className="font-extrabold text-[#3182F6]">{cheer.author}</span>
                        </span>
                        <span className="text-[8.5px] text-[#8B95A1] shrink-0 font-mono">{cheer.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#4E5968] font-semibold mt-1 leading-normal break-words">
                        {cheer.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 text-[#8B95A1] font-medium text-xs">
              아직 작성된 응원이 없습니다.<br />첫 한마디를 남겨보세요!
            </div>
          )}
        </div>

        {/* Input Form for adding cheers */}
        <form onSubmit={handleCheerSubmit} className="space-y-2.5 shrink-0 border-t border-[#F2F4F6] pt-4">
          <div className="grid grid-cols-3 gap-2">
            <input
              id="cheer-nickname-input"
              type="text"
              placeholder="상큼닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={6}
              className="col-span-1 bg-[#F2F4F6] border border-transparent outline-none rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#191F28] placeholder:text-[#8B95A1] focus:border-[#3182F6] transition-all"
            />
            {currentSchool ? (
              <span className="col-span-2 text-[10px] leading-tight text-[#3182F6] self-center font-extrabold px-1.5 py-1 truncate bg-blue-50 text-center rounded-xl">
                🏫 {currentSchool.name} 로 응원
              </span>
            ) : (
              <span className="col-span-2 text-[10px] leading-tight text-rose-500 self-center font-bold px-1.5 py-1 bg-rose-50 rounded-xl text-center">
                * 학교선택 필수
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#F2F4F6] border border-transparent rounded-xl px-3.5 py-2 focus-within:border-[#3182F6] focus-within:bg-white transition-all">
            <input
              id="cheer-text-input"
              type="text"
              placeholder={currentSchool ? '응원의 한 마디를 적어주세요' : '대표 학교를 등교하면 응원 가능해요!'}
              value={cheerText}
              onChange={(e) => setCheerText(e.target.value)}
              maxLength={30}
              required
              disabled={!currentSchool}
              className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#191F28] placeholder:text-[#8B95A1] disabled:opacity-50"
            />
            <button
              id="btn-cheer-submit"
              type="submit"
              disabled={!currentSchool || !cheerText.trim()}
              className="shrink-0 text-[#3182F6] hover:text-[#1b64da] disabled:opacity-30 cursor-pointer p-0.5"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
