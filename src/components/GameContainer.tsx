import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trophy, Zap, Clock, ArrowLeft, RefreshCw, Star, Share2 } from 'lucide-react';
import { GameType, School } from '../types';
import { playCorrect, playIncorrect, playCombo, playVictory, playGameOver, playSelect } from './SoundEffects';

interface GameContainerProps {
  gameType: GameType;
  gameTitle: string;
  emoji: string;
  difficulty: string;
  colorClasses: string; // From-to Tailwind gradient (optional usage)
  school: School | null;
  onClose: () => void;
  onAddScore: (points: number) => void;
  children: (props: {
    level: number;
    questionIndex: number;
    onAnswer: (correct: boolean, scoreAdd?: number) => void;
  }) => React.ReactNode;
}

export default function GameContainer({
  gameType,
  gameTitle,
  emoji,
  difficulty,
  colorClasses,
  school,
  onClose,
  onAddScore,
  children,
}: GameContainerProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showComboAnim, setShowComboAnim] = useState(false);
  const [shakeContainer, setShakeContainer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const startGame = () => {
    playSelect();
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setTimeLeft(60);
    setLevel(1);
    setQuestionIndex(0);
    setSubmitted(false);
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && lives > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, lives]);

  // Check Game Over by Lives
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      endGame();
    }
  }, [lives, gameState]);

  const endGame = () => {
    setGameState('ended');
    if (lives > 0) {
      playVictory();
    } else {
      playGameOver();
    }
  };

  const handleAnswer = (correct: boolean, scoreAdd = 100) => {
    setQuestionIndex((prev) => prev + 1);

    if (correct) {
      playCorrect();
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }

      // Combo bonus (10% extra per combo, max 2x multiplier)
      const multiplier = Math.min(1 + newCombo * 0.1, 2.0);
      const finalPoints = Math.round(scoreAdd * multiplier);
      
      setScore((prev) => prev + finalPoints);
      
      // Level Up every 5 correct answers
      const nextLevel = Math.floor((questionIndex + 1) / 5) + 1;
      if (nextLevel > level) {
        setLevel(nextLevel);
        playCombo(newCombo);
      }

      // Trigger combo animation
      if (newCombo >= 3) {
        setShowComboAnim(true);
        setTimeout(() => setShowComboAnim(false), 800);
      }
    } else {
      playIncorrect();
      setCombo(0);
      setLives((prev) => Math.max(0, prev - 1));
      setShakeContainer(true);
      setTimeout(() => setShakeContainer(false), 400);
    }
  };

  // Submit points to elected school
  const handleSubmitScore = () => {
    if (!school) return;
    setSubmitting(true);
    // Mimic database transaction delay
    setTimeout(() => {
      onAddScore(score);
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div id="game-panel" className="max-w-4xl mx-auto py-2 px-4 h-full flex flex-col justify-between">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] border border-[#F2F4F6]">
        <button
          id="btn-back"
          onClick={() => {
            playSelect();
            onClose();
          }}
          className="flex items-center gap-2 text-[#4E5968] hover:text-[#191F28] font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#8B95A1]" />
          <span>로비로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#F2F4F6] px-3.5 py-1.5 rounded-full font-bold text-[#4E5968]">
            {school ? `🏫 ${school.name}` : ' 소속 대표 없음'}
          </span>
          <span className="text-xs px-3.5 py-1.5 rounded-full font-bold bg-[#EBF4FF] text-[#3182F6]">
            난이도: {difficulty}
          </span>
        </div>
      </div>

      {/* MAIN SCREEN BOX */}
      <div className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {/* 1. INTRO SCREEN */}
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.02)] border border-[#F2F4F6] max-w-xl mx-auto w-full text-center relative overflow-hidden"
            >
              <span className="text-6xl mb-5 block drop-shadow-sm select-none">{emoji}</span>
              
              <h1 className="text-2xl font-extrabold text-[#191F28] tracking-tight leading-tight mb-2">
                {gameTitle}
              </h1>
              <p className="text-xs text-[#8B95A1] px-4 mb-6 leading-relaxed font-medium">
                안심하고 퀴즈를 풀어보세요. 획득한 점수는 즉시{' '}
                <span className="font-extrabold text-[#3182F6]">
                  {school ? school.name : '나의 소속 학교'}
                </span>
                의 실시간 누적 스코어에 기여됩니다.
              </p>

              <div className="bg-[#F9FAFB] border border-[#F2F4F6] rounded-2xl p-4 text-left space-y-3 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-[#4E5968]">
                  <Clock className="w-4 h-4 text-[#3182F6] mt-0.5 shrink-0" />
                  <span><strong>제한 시간:</strong> 주어진 60초 동안 많은 정답을 계산하세요.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#4E5968]">
                  <Heart className="w-4 h-4 text-[#FF4B65] mt-0.5 shrink-0 fill-current" />
                  <span><strong>목숨 수량:</strong> 총 3개의 하트가 지급되며, 오답 시 하나씩 소멸합니다.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#4E5968]">
                  <Zap className="w-4 h-4 text-[#FF9500] mt-0.5 shrink-0 fill-current" />
                  <span><strong>콤보 시너지:</strong> 연속 응답 시 점수 획득 기여 배율이 급증합니다.</span>
                </div>
              </div>

              <button
                id="btn-start-game"
                onClick={startGame}
                className="w-full py-4 bg-[#3182F6] hover:bg-[#1b64da] text-white font-extrabold rounded-2xl text-base shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                🎮 대표로 경기 출전하기
              </button>
            </motion.div>
          )}

          {/* 2. PLAYING GAME STATE */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full h-full flex flex-col justify-between transition-transform duration-250 ${
                shakeContainer ? 'animate-shake' : ''
              }`}
            >
              {/* CURRENT HUD (STATS BAR) - Clean Toss Layout */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {/* 1. Score Tracker */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-[#F2F4F6] shadow-xs flex items-center gap-3">
                  <div className="p-2 bg-[#FFF0F2] text-[#FF4B65] rounded-xl">
                    <Trophy className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B95A1] font-bold uppercase">내 점수</p>
                    <p className="font-mono text-base font-extrabold text-[#191F28]">{score.toLocaleString()}</p>
                  </div>
                </div>

                {/* 2. Hearts Checker */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-[#F2F4F6] shadow-xs flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B95A1] font-bold uppercase">남은 하트</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(3)].map((_, i) => (
                        <HeatWaveHeart key={i} active={i < lives} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Combustion Meter */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-[#F2F4F6] shadow-xs flex items-center gap-3 relative overflow-hidden">
                  <div className={`p-2 rounded-xl transition-colors ${combo > 0 ? 'bg-[#FFF5E6] text-[#FF9500]' : 'bg-[#F2F4F6] text-[#8B95A1]'}`}>
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B95A1] font-bold uppercase">연속 정답</p>
                    <p className="font-mono text-base font-extrabold text-[#191F28]">
                      {combo} <span className="text-xs text-[#8B95A1] font-bold">콤보</span>
                    </p>
                  </div>
                  {/* Floating Combos bubble */}
                  <AnimatePresence>
                    {showComboAnim && combo >= 3 && (
                      <motion.div
                        initial={{ scale: 0.6, y: 12, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 1], y: -4, opacity: 1 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="absolute right-2 top-2 bg-[#FF9500] text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5"
                      >
                        <Star className="w-2.5 h-2.5 fill-current text-white" />
                        <span>BONUS! x{Math.min(1 + combo * 0.1, 2.0).toFixed(1)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Timer Bar */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-[#F2F4F6] shadow-xs flex items-center gap-3 relative overflow-hidden">
                  <div className={`p-2 rounded-xl scale-75 ${timeLeft <= 10 ? 'bg-red-100 text-red-500 animate-ping absolute' : ''}`} />
                  <div className={`p-2 rounded-xl relative ${timeLeft <= 10 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#3182F6]'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="z-10">
                    <p className="text-[10px] text-[#8B95A1] font-bold uppercase">타임아웃</p>
                    <p className={`font-mono text-base font-extrabold ${timeLeft <= 10 ? 'text-red-500' : 'text-[#191F28]'}`}>
                      {timeLeft} <span className="text-xs font-normal text-[#8B95A1]">초</span>
                    </p>
                  </div>
                  {/* Visual Line Progress indicator inside card */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-50">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeLeft <= 10 ? 'bg-red-500' : 'bg-[#3182F6]'
                      }`}
                      style={{ width: `${(timeLeft / 60) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* GAME PLAY AREA */}
              <div className="flex-1 bg-white rounded-[24px] p-6 border border-[#F2F4F6] shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col justify-center min-h-[360px] relative">
                {/* Dynamically Injected Interactive Game Module */}
                {children({
                  level,
                  questionIndex,
                  onAnswer: handleAnswer,
                })}
              </div>

              {/* FOOTER BAR */}
              <div className="mt-4 flex items-center justify-between text-xs text-[#8B95A1] px-2 font-medium">
                <span>⭐ 리그 점수: 현재 레벨 {level}</span>
                <span>정확히 연속으로 맞출수록 점수 보너스 배율이 적용됩니다!</span>
              </div>
            </motion.div>
          )}

          {/* 3. END GAME / RESULTS SUMMARY SCREEN */}
          {gameState === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.02)] border border-[#F2F4F6] max-w-xl mx-auto w-full text-center relative overflow-hidden"
            >
              {/* Confetti Fireworks simulation when score is positive or lives remain */}
              {lives > 0 && <ConfettiParticleShower />}

              <span className="text-6xl mb-4 block drop-shadow-sm select-none pt-2">
                {lives > 0 ? '🏆' : '💪'}
              </span>

              <h2 className="text-2xl font-extrabold text-[#191F28] tracking-tight leading-none mb-1.5">
                {lives > 0 ? '축하합니다! 최고 기록 달성!' : '다시 도전해볼까요?'}
              </h2>
              <p className="text-xs text-[#8B95A1] mb-6 font-medium">
                {lives > 0 ? '멋지게 챌린지를 클리어하셨습니다!' : '포기하지 말아요, 열심히 훈련하면 누구나 수학 천재가 될 수 있어요!'}
              </p>

              {/* Achievement Card */}
              <div className="bg-[#F9FAFB] border border-[#F2F4F6] rounded-[24px] p-6 text-center max-w-sm mx-auto mb-8 space-y-4">
                <div>
                  <div className="flex justify-center gap-1 mt-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-7 h-7 ${
                          score >= star * 400
                            ? 'text-yellow-400 fill-current animate-bounce'
                            : 'text-slate-200'
                        }`}
                        style={{ animationDelay: `${star * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-[#8B95A1] uppercase tracking-wider">내가 획득한 기여 점수</p>
                  <p className="text-3xl font-extrabold text-[#191F28] mt-1 tracking-tight">
                    {score.toLocaleString()} <span className="text-base font-bold text-[#4E5968]">점</span>
                  </p>
                </div>

                <div className="h-[1px] bg-[#EBF0F5] w-3/4 mx-auto" />

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-white p-3 rounded-xl border border-[#F2F4F6]">
                    <p className="text-[10px] text-[#8B95A1] font-bold">최대 정답 콤보</p>
                    <p className="font-mono text-sm font-extrabold text-[#191F28] mt-0.5">{maxCombo} Combo</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#F2F4F6]">
                    <p className="text-[10px] text-[#8B95A1] font-bold">챌린지 등급</p>
                    <p className="font-mono text-sm font-extrabold text-[#191F28] mt-0.5">{difficulty}</p>
                  </div>
                </div>
              </div>

              {/* PERSISTENCE INTEGRATION BLOCK */}
              <div className="max-w-md mx-auto mb-8">
                {school ? (
                  <div className="bg-blue-50/50 border border-[#FFF0F2]/10 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[9px] bg-blue-100 text-[#3182F6] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">합계 반영</span>
                        <h4 className="text-xs font-extrabold text-[#191F28] mt-1.5">대표학교 점수 제출</h4>
                        <p className="text-[10.5px] text-[#8B95A1] mt-0.5 font-medium leading-relaxed">나의 점수가 <span className="font-extrabold text-[#3182F6]">{school.name}</span>의 실시간 총 점수에 반영됩니다.</p>
                      </div>

                      {!submitted ? (
                        <button
                          id="btn-submit-score"
                          disabled={submitting || score <= 0}
                          onClick={handleSubmitScore}
                          className="bg-[#3182F6] hover:bg-[#1b64da] disabled:bg-slate-200 text-white font-extrabold text-xs px-4 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-all select-none"
                        >
                          {submitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>전송중</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>전송하기</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="bg-[#2ECC71] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl select-none shadow-xs">
                          반영 완료!
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F2F4F6] rounded-2xl p-4 text-xs text-[#8B95A1] font-medium leading-relaxed">
                    로비의 학교 선택창에서 <strong>초등학교 소속을 등록하시면</strong> 학교간의 랭킹전에 소중한 총 점수를 누적 제출할 수 있습니다!
                  </div>
                )}
              </div>

              {/* RETRY & BACK ACTION CONTROLS */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <button
                  id="btn-retry"
                  onClick={startGame}
                  className="py-3.5 px-6 border border-[#E5E8EB] hover:bg-slate-50 rounded-2xl text-[#4E5968] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#8B95A1]" />
                  <span>다시 풀기</span>
                </button>
                <button
                  id="btn-lobby"
                  onClick={() => {
                    playSelect();
                    onClose();
                  }}
                  className="py-3.5 px-6 bg-[#3182F6] hover:bg-[#1b64da] text-white font-bold text-xs rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-white" />
                  <span>랭킹 확인하기</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Auxiliary Components
// ----------------------------------------------------

interface HeartProps {
  active: boolean;
  key?: number;
}

function HeatWaveHeart({ active }: HeartProps) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.15, 1] } : { scale: 0.8, rotate: -15 }}
      transition={{ repeat: active ? Infinity : 0, duration: active ? 1.5 : 0.3, repeatType: 'reverse' }}
      className={`relative ${active ? 'text-rose-500' : 'text-slate-200'}`}
    >
      <Heart className={`w-5 h-5 ${active ? 'fill-current text-[#FF4B65] text-[#FF4B65]' : 'text-slate-200 text-slate-200'}`} />
    </motion.div>
  );
}

// Inline SVG particle explosion effect simulating colorful confetti!
function ConfettiParticleShower() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number; duration: number; rot: number }>>([]);

  useEffect(() => {
    const rainbowColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const generated = [...Array(45)].map((_, idx) => ({
      id: idx,
      x: Math.random() * 100, // percentage width
      y: Math.random() * -30 - 10, // above the screen
      color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
      size: Math.random() * 8 + 6,
      delay: Math.random() * 0.4,
      duration: Math.random() * 2 + 1.8,
      rot: Math.random() * 360,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-xs"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`],
            rotate: [p.rot, p.rot + 720],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
