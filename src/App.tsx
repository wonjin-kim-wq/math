import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Zap, Trophy, HelpCircle, School as SchoolIcon, Star, Sparkles, Smile, RefreshCw, Feather } from 'lucide-react';
import { School, Cheer, GameType } from './types';
import { INITIAL_SCHOOLS, INITIAL_CHEERS, GAMES } from './data/schools';
import { playSelect, playVictory } from './components/SoundEffects';

// Lazy imports or explicit components imports
import GameContainer from './components/GameContainer';
import GameArithmetic from './components/GameArithmetic';
import GameFraction from './components/GameFraction';
import GamePattern from './components/GamePattern';
import GameTime from './components/GameTime';
import GameSeesaw from './components/GameSeesaw';
import SchoolSelection from './components/SchoolSelection';
import Leaderboard from './components/Leaderboard';
import AudioToggle from './components/AudioToggle';

export default function App() {
  // Application Data States
  const [schools, setSchools] = useState<School[]>([]);
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [nickname, setNickname] = useState('새싹수학자');
  const [myContribution, setMyContribution] = useState(0);

  // View States
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 1. Initial State Loading from localStorage
  useEffect(() => {
    try {
      const storedSchools = localStorage.getItem('math_olympiad_schools');
      if (storedSchools) {
        setSchools(JSON.parse(storedSchools));
      } else {
        setSchools(INITIAL_SCHOOLS);
        localStorage.setItem('math_olympiad_schools', JSON.stringify(INITIAL_SCHOOLS));
      }

      const storedCheers = localStorage.getItem('math_olympiad_cheers');
      if (storedCheers) {
        setCheers(JSON.parse(storedCheers));
      } else {
        setCheers(INITIAL_CHEERS);
        localStorage.setItem('math_olympiad_cheers', JSON.stringify(INITIAL_CHEERS));
      }

      const storedSchoolId = localStorage.getItem('math_olympiad_current_school_id');
      const storedNickname = localStorage.getItem('math_olympiad_nickname');
      const storedContribution = localStorage.getItem('math_olympiad_contribution');

      if (storedNickname) setNickname(storedNickname);
      if (storedContribution) setMyContribution(Number(storedContribution));

      if (storedSchoolId && storedSchools) {
        const parsed: School[] = JSON.parse(storedSchools);
        const match = parsed.find((s) => s.id === storedSchoolId);
        if (match) setCurrentSchool(match);
      } else if (storedSchoolId && !storedSchools) {
        const match = INITIAL_SCHOOLS.find((s) => s.id === storedSchoolId);
        if (match) setCurrentSchool(match);
      }
    } catch (e) {
      // safe fallback on schema parse failures
      setSchools(INITIAL_SCHOOLS);
      setCheers(INITIAL_CHEERS);
    }
  }, []);

  // Update profile attributes helper
  const handleSelectSchool = (school: School) => {
    setCurrentSchool(school);
    localStorage.setItem('math_olympiad_current_school_id', school.id);
  };

  const handleUpdateNickname = (name: string) => {
    const clean = name.trim().slice(0, 8) || '새싹수학자';
    setNickname(clean);
    localStorage.setItem('math_olympiad_nickname', clean);
  };

  // Submit/Add score function
  const handleAddScore = (points: number) => {
    if (!currentSchool) return;

    const updatedSchools = schools.map((s) => {
      if (s.id === currentSchool.id) {
        const nextScore = s.score + points;
        return {
          ...s,
          score: nextScore,
          playerCount: s.playerCount + 1,
        };
      }
      return s;
    });

    setSchools(updatedSchools);
    localStorage.setItem('math_olympiad_schools', JSON.stringify(updatedSchools));

    // Update active School reference
    const updatedMySchool = updatedSchools.find((s) => s.id === currentSchool.id);
    if (updatedMySchool) setCurrentSchool(updatedMySchool);

    // Track contribution score points
    const nextContribution = myContribution + points;
    setMyContribution(nextContribution);
    localStorage.setItem('math_olympiad_contribution', String(nextContribution));

    // Post automatic celebrate cheer to the timeline!
    const automaticCheer: Cheer = {
      id: `cheer_auto_${Date.now()}`,
      schoolId: currentSchool.id,
      schoolName: currentSchool.name,
      author: nickname,
      text: `🎉 수학 올림피아드에서 무려 ${points.toLocaleString()}점을 우리 학교에 보탰습니다! 최고!`,
      timestamp: '방금 전',
    };

    const nextCheers = [automaticCheer, ...cheers].slice(0, 20); // Keep max 20 cheers
    setCheers(nextCheers);
    localStorage.setItem('math_olympiad_cheers', JSON.stringify(nextCheers));
  };

  // Register New School
  const handleRegisterSchool = (newSchoolData: Omit<School, 'score' | 'playerCount' | 'rankChange'>) => {
    const newSchool: School = {
      ...newSchoolData,
      score: 100, // Starts with a small layout bonus!
      playerCount: 1,
      rankChange: 0,
    };

    const nextSchools = [...schools, newSchool];
    setSchools(nextSchools);
    localStorage.setItem('math_olympiad_schools', JSON.stringify(nextSchools));

    // Auto log player into newly registered school!
    setCurrentSchool(newSchool);
    localStorage.setItem('math_olympiad_current_school_id', newSchool.id);
  };

  // Register Custom Cheer Message
  const handleAddCheerMsg = (text: string, author: string) => {
    if (!currentSchool) return;

    const newCheer: Cheer = {
      id: `cheer_${Date.now()}`,
      schoolId: currentSchool.id,
      schoolName: currentSchool.name,
      author,
      text,
      timestamp: '방금 전',
    };

    const nextCheers = [newCheer, ...cheers].slice(0, 20);
    setCheers(nextCheers);
    localStorage.setItem('math_olympiad_cheers', JSON.stringify(nextCheers));
  };

  // Reset local championship state to default list
  const handleResetStorage = () => {
    if (window.confirm('게임의 모든 데이터(등록된 학교, 응원글, 개인 기여 점수)를 초기화할까요?')) {
      playSelect();
      localStorage.clear();
      setSchools(INITIAL_SCHOOLS);
      setCheers(INITIAL_CHEERS);
      setCurrentSchool(null);
      setNickname('새싹수학자');
      setMyContribution(0);
      setSelectedGame(null);
    }
  };

  return (
    <div id="application-root" className="min-h-screen bg-[#F2F4F6] text-[#191F28] font-sans selection:bg-blue-100 antialiased flex flex-col justify-between">
      
      {/* ---------------------------------------------------- */}
      {/* 1. PRIMARY APP HEADERS BAR (Lobby & Game selection) */}
      {/* ---------------------------------------------------- */}
      {!selectedGame && (
        <header id="main-lobby-header" className="bg-[#F2F4F6] pt-10 pb-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-[#3182F6] font-bold text-sm tracking-wider uppercase">MATH CHAMPIONS LEAGUE</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#191F28] mt-1">
                초등수학 대항전 올림피아드
              </h1>
              <p className="text-[#8B95A1] font-medium text-sm sm:text-base mt-1.5">
                전국 초등학교 대표들이 겨루는 실시간 수학 계산 리그
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {/* Toss styles: flat white bg, soft gray labels, bold text, high roundness */}
              <div className="bg-white px-6 py-3.5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex-1 md:flex-none border border-transparent">
                <span className="block text-xs font-semibold text-[#8B95A1] mb-0.5">참여 학교</span>
                <span className="text-lg font-extrabold text-[#191F28]">{schools.length}개교</span>
              </div>
              <div className="bg-[#3182F6] px-6 py-3.5 rounded-[20px] shadow-[0_8px_20px_rgba(49,130,246,0.15)] flex-1 md:flex-none text-white">
                <span className="block text-xs font-semibold text-blue-100 mb-0.5">다음 경기까지</span>
                <span className="text-lg font-extrabold">14:22:05</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN HUB WORKSPACE LAYOUT */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 pb-16 pt-2 px-4 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!selectedGame ? (
            /* ==================================================== */
            /* LOBBY VIEW LAYOUT                                    */
            /* ==================================================== */
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Profile Card & School Selection Widget Column wrapper */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* REPRESENTATIVE ATHELTE CARD PROFILE */}
                <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between md:col-span-1 min-h-[260px] border border-transparent">
                  <div>
                    <span className="text-xs bg-blue-50 text-[#3182F6] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      나의 대표 프로필 🏅
                    </span>

                    <div className="mt-5 flex items-center gap-4">
                      {/* Avatar container - Toss clean circular style */}
                      <div className="w-16 h-16 rounded-full bg-[#F2F4F6] flex items-center justify-center relative shadow-inner shrink-0">
                        <span className="text-3xl select-none">
                          {currentSchool ? currentSchool.mascot : '⚡'}
                        </span>
                        {currentSchool && (
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white font-black flex items-center justify-center text-xs shadow-sm border border-white ${currentSchool.color}`}>
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <label htmlFor="nickname-input-field" className="text-xs font-bold text-[#8B95A1] block mb-0.5">네임텍 설정</label>
                        <input
                          id="nickname-input-field"
                          type="text"
                          value={nickname}
                          onChange={(e) => handleUpdateNickname(e.target.value)}
                          maxLength={8}
                          className="w-full text-lg font-extrabold text-[#191F28] outline-none border-b-2 border-transparent focus:border-[#3182F6] bg-transparent py-0.5 transition-colors"
                          placeholder="수학천재 입력"
                        />
                        <p className="text-[11px] text-[#8B95A1] mt-1 flex items-center gap-1 font-medium">
                          <Feather className="w-3 h-3 text-[#3182F6]" />
                          언제든 터치해서 이름 변경 가능
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#F2F4F6] w-full my-6" />

                  {/* Registered School Score card block */}
                  <div>
                    {currentSchool ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#8B95A1] uppercase">내가 등교한 대표 학교</p>
                        <h4 className="text-lg font-extrabold text-[#191F28]">{currentSchool.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className="bg-[#F9FAFB] rounded-xl p-3 border border-transparent">
                            <span className="text-[10px] text-[#8B95A1] block font-bold leading-none">학교 총 점수</span>
                            <span className="font-mono text-sm font-extrabold text-[#191F28] mt-1 block">
                              {currentSchool.score.toLocaleString()} 점
                            </span>
                          </div>
                          
                          <div className="bg-blue-50/40 rounded-xl p-3 border border-transparent">
                            <span className="text-[10px] text-[#3182F6] block font-bold leading-none">개인 점수 기여도</span>
                            <span className="font-mono text-sm font-extrabold text-[#3182F6] mt-1 block flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current text-amber-500 stroke-amber-500" />
                              +{myContribution.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50/50 rounded-2xl p-4 text-center border border-rose-100">
                        <p className="text-xs text-rose-600 font-bold leading-snug">
                          ⚠️ 아직 내 대표 학교를 정하지 않았어요!
                        </p>
                        <p className="text-[11px] text-rose-500 mt-1 leading-normal">
                          대항전에 참여하려면 우측 학교 목록에서 원하는 학교를 골라 등록(등교) 버튼을 눌러보세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* INLINE SCHOOL SELECTOR & CREATOR */}
                <div className="md:col-span-2">
                  <SchoolSelection
                    schools={schools}
                    currentSchool={currentSchool}
                    onSelectSchool={handleSelectSchool}
                    onRegisterSchool={handleRegisterSchool}
                  />
                </div>
              </div>

              {/* 5가지 게임 카테고리 챌린지 맵 */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-blue-50 rounded-2xl text-[#3182F6] shadow-sm">
                      <Star className="w-5 h-5 fill-current text-[#3182F6] stroke-[#3182F6]" />
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#191F28] leading-none">🏆 올림피아드 5대 공식 과목</h2>
                      <p className="text-xs text-[#8B95A1] mt-1.5 font-medium">풀고 싶은 수학 과목을 선택하고 최고 단계 스테이지에 도전하세요!</p>
                    </div>
                  </div>
                  
                  {/* Quick Guide Trigger */}
                  <button
                    id="btn-info-small"
                    onClick={() => {
                      playSelect();
                      setShowInfoModal(true);
                    }}
                    className="py-2 px-4 bg-white text-[#3182F6] border border-[#E5E8EB] rounded-2xl hover:bg-slate-50 transition-colors font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4 text-[#3182F6]" />
                    <span>리그 가이드</span>
                  </button>
                </div>

                {/* Layout Grid of 5 Games - Toss Service Catalog concept */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {GAMES.map((game) => {
                    const schoolGrades: Record<string, string> = {
                      arithmetic: '1~6학년 추천',
                      fraction: '3~4학년 추천',
                      pattern: '3~6학년 추천',
                      time: '1~2학년 추천',
                      seesaw: '4~6학년 추천',
                    };

                    const gradeRec = schoolGrades[game.type] || '전 학년 추천';

                    // Clean Toss palette for category badges
                    const paletteMap: Record<string, {
                      iconBg: string;
                      accentColor: string;
                      hoverColor: string;
                    }> = {
                      arithmetic: {
                        iconBg: 'bg-[#FFF0F2] text-[#FF4B65]',
                        accentColor: '#FF4B65',
                        hoverColor: 'bg-[#FFF0F2]/80',
                      },
                      fraction: {
                        iconBg: 'bg-[#FFF5E6] text-[#FF9500]',
                        accentColor: '#FF9500',
                        hoverColor: 'bg-[#FFF5E6]/80',
                      },
                      pattern: {
                        iconBg: 'bg-[#EAF9F1] text-[#2ECC71]',
                        accentColor: '#2ECC71',
                        hoverColor: 'bg-[#EAF9F1]/80',
                      },
                      time: {
                        iconBg: 'bg-[#EEF1FF] text-[#5C6FFD]',
                        accentColor: '#5C6FFD',
                        hoverColor: 'bg-[#EEF1FF]/80',
                      },
                      seesaw: {
                        iconBg: 'bg-[#E5F5FF] text-[#0091FF]',
                        accentColor: '#0091FF',
                        hoverColor: 'bg-[#E5F5FF]/80',
                      },
                    };

                    const p = paletteMap[game.type] || paletteMap.arithmetic;

                    return (
                      <motion.div
                        key={game.type}
                        id={`game-choice-card-${game.type}`}
                        whileHover={{ y: -6, shadow: '0_12px_28px_rgba(0,0,0,0.04)' }}
                        whileTap={{ scale: 0.985 }}
                        className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] border border-[#F2F4F6] flex flex-col justify-between min-h-[295px] relative overflow-hidden group transition-shadow"
                      >
                        {/* Header metadata inside card */}
                        <div className="flex justify-between items-center z-10">
                          <span className="text-[11px] bg-[#F2F4F6] text-[#4E5968] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {gradeRec}
                          </span>
                          
                          {/* Circular Badge holding game asset logo */}
                          <div className={`w-11 h-11 rounded-full ${p.iconBg} flex items-center justify-center text-xl shrink-0 font-sans shadow-sm`}>
                            {game.emoji}
                          </div>
                        </div>

                        {/* Middle Text Information */}
                        <div className="z-10 flex-1 flex flex-col justify-between mt-5">
                          <div>
                            <h3 className="text-lg font-extrabold text-[#191F28] tracking-tight leading-tight">
                              {game.title}
                            </h3>
                            <p className="text-xs text-[#8B95A1] font-semibold mt-1 font-sans">
                              {game.subtitle}
                            </p>
                            <p className="text-[11.5px] text-[#4E5968] mt-3.5 leading-relaxed font-medium">
                              {game.desc}
                            </p>
                          </div>

                          <div className="pt-6 relative z-15">
                            <button
                              id={`btn-play-game-${game.type}`}
                              onClick={() => {
                                playSelect();
                                setSelectedGame(game.type);
                              }}
                              className="w-full py-3 bg-[#EBF4FF] hover:bg-[#D4E8FF] text-[#3182F6] text-xs font-bold rounded-2xl shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 active:scale-95 font-sans"
                            >
                              <span>🎮 도전 풀기</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE LEADERBOARD STATS & RECENT CHEERSTIMELINE */}
              <Leaderboard
                schools={schools}
                cheers={cheers}
                currentSchool={currentSchool}
                onAddCheer={handleAddCheerMsg}
              />

              {/* Bento Stats Banner - Toss styled summary widget */}
              <div id="bento-stats-footer" className="bg-white rounded-[24px] p-6 border border-[#F2F4F6] shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  {/* Toss soft light-indigo/blue circle */}
                  <div className="w-8 h-8 rounded-full bg-[#EBF4FF] flex items-center justify-center text-sm font-sans animate-pulse shrink-0">
                    📈
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8B95A1] font-bold uppercase tracking-wider">누적 학업 성취율</span>
                    <span className="text-sm font-extrabold text-[#4E5968]">94.6% 달성 중</span>
                  </div>
                </div>
                <div className="hidden sm:block h-8 w-[1px] bg-[#F2F4F6]" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F2] flex items-center justify-center text-sm shrink-0">
                    🔥
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8B95A1] font-bold uppercase tracking-wider">가장 인기있는 부스</span>
                    <span className="text-sm font-extrabold text-[#4E5968]">사칙연산 버블팝</span>
                  </div>
                </div>
                <div className="hidden sm:block h-8 w-[1px] bg-[#F2F4F6]" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAF9F1] flex items-center justify-center text-sm shrink-0">
                    👨‍💻
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8B95A1] font-bold uppercase tracking-wider">실시간 대결 수학자</span>
                    <span className="text-sm font-extrabold text-[#4E5968]">4,521명 계산 중</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==================================================== */
            /* IN-GAME ACTIVE SCREEN VIEW                           */
            /* ==================================================== */
            <motion.div
              key="game-room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-2"
            >
              {(() => {
                const gameInfo = GAMES.find((g) => g.type === selectedGame)!;
                return (
                  <GameContainer
                    gameType={selectedGame}
                    gameTitle={gameInfo.title}
                    emoji={gameInfo.emoji}
                    difficulty={gameInfo.difficulty}
                    colorClasses={gameInfo.color}
                    school={currentSchool}
                    onClose={() => setSelectedGame(null)}
                    onAddScore={handleAddScore}
                  >
                    {({ level, questionIndex, onAnswer }) => {
                      switch (selectedGame) {
                        case 'arithmetic':
                          return (
                            <GameArithmetic
                              level={level}
                              questionIndex={questionIndex}
                              onAnswer={onAnswer}
                            />
                          );
                        case 'fraction':
                          return (
                            <GameFraction
                              level={level}
                              questionIndex={questionIndex}
                              onAnswer={onAnswer}
                            />
                          );
                        case 'pattern':
                          return (
                            <GamePattern
                              level={level}
                              questionIndex={questionIndex}
                              onAnswer={onAnswer}
                            />
                          );
                        case 'time':
                          return (
                            <GameTime
                              level={level}
                              questionIndex={questionIndex}
                              onAnswer={onAnswer}
                            />
                          );
                        case 'seesaw':
                          return (
                            <GameSeesaw
                              level={level}
                              questionIndex={questionIndex}
                              onAnswer={onAnswer}
                            />
                          );
                        default:
                          return null;
                      }
                    }}
                  </GameContainer>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ---------------------------------------------------- */}
      {/* 3. LIGHTWEIGHT FOOTER PANEL */}
      {/* ---------------------------------------------------- */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-450 py-6 px-4 text-center text-xs shrink-0 mt-8">
        <div className="max-w-7xl mx-auto space-y-1">
          <p className="font-semibold text-slate-400">🏅 Elementary Math Olympiad Series</p>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            본 수학 게임은 초등 교육 자문을 기초 삼아 사칙 연산, 수열 규칙성, 분수의 이해, 시계 읽기론 및 저울 수식 부등비를 배양합니다.
          </p>
          <p className="text-slate-600 text-[10px] pt-2">© 2026 Google AI Studio Applet Corp. All Rights Reserved.</p>
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* 4. MODAL DIALOGS: HELP / GUIDE DIALOG */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 relative overflow-hidden z-10 border border-gray-150"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl select-none">🏆</span>
                <h3 className="text-lg font-black text-slate-800">초등수학 대항전 올림픽 안내 가이드</h3>
              </div>
              
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed overflow-y-auto max-h-[350px] pr-1">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">1. 대항전 랭킹 시스템 (학교 연합전) 🏫</p>
                  <p>이용자는 대표하고 싶은 초등학교를 선택하여 등록할 수 있어요. 수학 게임을 완료할 때마다 획득한 고득점 산수 포인트가 선택된 초등학교 누적 스코어에 완벽히 저장됩니다! 실시간으로 학교들의 등위 순위 변동을 구경해보세요!</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800">2. 5가지 과목별 커리큘럼 소개 📚</p>
                  <ul className="list-disc list-inside space-y-1 pt-1 pl-1">
                    <li><strong>사칙연산 버블팝:</strong> 기본적인 +, -, ×, ÷ 순발력 계산 (구구단 및 나눗셈 완비)</li>
                    <li><strong>분수 피자 가게:</strong> 피자 판의 이분할, 삼분할, 사분할을 통한 비례 등가 분수 마스터</li>
                    <li><strong>규칙 기차 레일:</strong> 가속, 감속 수열의 산술적/기하적 규칙 성향 추론 탐구</li>
                    <li><strong>시간 요정의 시계:</strong> 시침과 분침 각도 가각을 이용한 아날로그 및 디지털 단위 변환론</li>
                    <li><strong>무게 균형 시소:</strong> 식의 부등호 연산 기호 배치 및 시소 균형 무게 추 연산</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800">3. 연속 콤보 보너스 시스템 🔥</p>
                  <p>정답을 연속으로 틀림없이 빠르게 맞출수록 콤보 게이지가 불타오르며, 최종 합산 점수에 <strong>최대 2.0배 보너스 스코어 개런티</strong>가 부가적인 가치로 적용됩니다!</p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
                <button
                  id="btn-close-info"
                  onClick={() => {
                    playSelect();
                    setShowInfoModal(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  확인했어요! 게임하러 가기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
