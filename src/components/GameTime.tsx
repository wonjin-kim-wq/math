import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameTimeProps {
  level: number;
  questionIndex: number;
  onAnswer: (correct: boolean, scoreAdd?: number) => void;
}

interface TimeQuestion {
  targetHours: number;
  targetMinutes: number;
  promptText: string;
  choices: Array<{ hours: number; minutes: number }>;
  correctIndex: number;
}

export default function GameTime({ level, questionIndex, onAnswer }: GameTimeProps) {
  const [question, setQuestion] = useState<TimeQuestion | null>(null);

  // Helper to format leading zero
  const zeroPad = (num: number) => String(num).padStart(2, '0');

  // Generate question based on Level
  const generateQuestion = (): TimeQuestion => {
    let targetHours = Math.floor(Math.random() * 12) + 1; // 1 to 12
    let targetMinutes = 0;

    // Progressing minutes interval depth
    if (level === 1) {
      // Hours and half-hours (e.g., 5시 00분, 8시 30분)
      targetMinutes = Math.random() > 0.5 ? 0 : 30;
    } else if (level === 2) {
      // 15-minute quarters (0, 15, 30, 45)
      const minutesPool = [0, 15, 30, 45];
      targetMinutes = minutesPool[Math.floor(Math.random() * minutesPool.length)];
    } else if (level === 3) {
      // 5-minute intervals
      targetMinutes = Math.floor(Math.random() * 12) * 5; // 0, 5, 10, ..., 55
    } else {
      // Level 4/5: 5 minutes block + tricky hours (like 11:55, where hour hand is very close to 12!)
      targetMinutes = Math.floor(Math.random() * 12) * 5;
    }

    let promptText = `오후 ${targetHours}시 ${targetMinutes === 0 ? '정각' : `${targetMinutes}분`}`;

    // Advanced Level 4+: Word problems/Arithmetic time questions!
    if (level >= 4) {
      const isBefore = Math.random() > 0.5;
      const minutesDifference = Math.random() > 0.5 ? 30 : 60;
      
      let baseHours = targetHours;
      let baseMinutes = targetMinutes;
      
      // Calculate display prompt
      if (isBefore) {
        // e.g. "4:30에서 30분 전" -> Target is 4:00
        baseMinutes = targetMinutes + minutesDifference;
        if (baseMinutes >= 60) {
          baseMinutes -= 60;
          baseHours = (baseHours === 1 ? 12 : baseHours - 1);
        }
        promptText = `오후 ${baseHours}시 ${baseMinutes === 0 ? '정각' : `${baseMinutes}분`}에서 ${minutesDifference}분 "전"의 시각`;
      } else {
        // e.g. "4:00에서 30분 후" -> Target is 4:30
        baseMinutes = targetMinutes - minutesDifference;
        if (baseMinutes < 0) {
          baseMinutes += 60;
          baseHours = (baseHours === 12 ? 1 : baseHours + 1);
        }
        promptText = `오후 ${baseHours}시 ${baseMinutes === 0 ? '정각' : `${baseMinutes}분`}에서 ${minutesDifference}분 "후"의 시각`;
      }
    }

    // Prepare correct choices
    const choicesList: Array<{ hours: number; minutes: number }> = [
      { hours: targetHours, minutes: targetMinutes },
    ];

    // Generate incorrect times
    while (choicesList.length < 4) {
      let wrongH = Math.floor(Math.random() * 12) + 1;
      let wrongM = 0;
      if (level === 1) wrongM = Math.random() > 0.5 ? 0 : 30;
      else if (level === 2) wrongM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      else wrongM = Math.floor(Math.random() * 12) * 5;

      const duplicate = choicesList.some((c) => c.hours === wrongH && c.minutes === wrongM);
      if (!duplicate) {
        choicesList.push({ hours: wrongH, minutes: wrongM });
      }
    }

    // Shuffle and extract correct index
    const shuffledChoices = [...choicesList].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledChoices.findIndex(
      (c) => c.hours === targetHours && c.minutes === targetMinutes
    );

    return {
      targetHours,
      targetMinutes,
      promptText,
      choices: shuffledChoices,
      correctIndex,
    };
  };

  useEffect(() => {
    setQuestion(generateQuestion());
  }, [questionIndex, level]);

  if (!question) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full py-2">
      {/* Game Header */}
      <div className="text-center mb-4">
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
          시간 요정의 시계 ⏰
        </span>
        
        {/* Dynamic Speech Prompt card */}
        <div className="mt-3 bg-indigo-50/60 border border-indigo-200/50 p-4 rounded-2xl max-w-sm mx-auto shadow-xs text-center">
          <p className="text-[10px] text-indigo-600 font-bold uppercase">어려운 시간 수수께끼</p>
          <h3 className="text-2xl font-black text-indigo-950 mt-1.5 leading-snug tracking-tight">
            "{question.promptText}"
          </h3>
          <p className="text-xs text-slate-400 mt-1">에 알맞은 아날로그 시계를 아래에서 고르세요!</p>
        </div>
      </div>

      {/* Clock grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2 px-1">
        <AnimatePresence mode="popLayout">
          {question.choices.map((choice, idx) => {
            const isCorrect = idx === question.correctIndex;
            
            return (
              <motion.button
                id={`clock-choice-${idx}`}
                key={`${questionIndex}-${idx}-${choice.hours}-${choice.minutes}`}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onAnswer(isCorrect, isCorrect ? 130 + level * 10 : 0);
                }}
                className="bg-white border-2 hover:border-indigo-400 border-gray-100 cursor-pointer rounded-2xl p-3 flex flex-col items-center justify-between shadow-xs hover:shadow-md transition-shadow relative"
              >
                {/* SVG Analog Clock Face drawing */}
                <svg viewBox="0 0 100 100" className="w-24 h-24 select-none mb-1.5">
                  <circle cx="50" cy="50" r="46" className="fill-slate-50 stroke-slate-300 stroke-1.5" />
                  <circle cx="50" cy="50" r="44" className="fill-white" />
                  
                  {/* Outer ticks (12 points for hours) */}
                  {[...Array(12)].map((_, tickIdx) => {
                    const angle = tickIdx * 30; // 360 / 12
                    const r = Math.PI / 180;
                    const cos = Math.cos(angle * r);
                    const sin = Math.sin(angle * r);
                    // Line endpoint coordinate at edge
                    const x1 = 50 + 40 * cos;
                    const y1 = 50 + 40 * sin;
                    // In-set line coordinates
                    const isMain = tickIdx % 3 === 0; // 12, 3, 6, 9
                    const length = isMain ? 6 : 3;
                    const x2 = 50 + (40 - length) * cos;
                    const y2 = 50 + (40 - length) * sin;

                    return (
                      <line
                        key={tickIdx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={isMain ? 'stroke-slate-600 stroke-1.5' : 'stroke-slate-300 stroke-1'}
                      />
                    );
                  })}

                  {/* 12, 3, 6, 9 text indicators */}
                  <text x="50" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" className="fill-slate-500 font-sans">12</text>
                  <text x="86" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" className="fill-slate-500 font-sans">3</text>
                  <text x="50" y="90" textAnchor="middle" fontSize="8" fontWeight="bold" className="fill-slate-500 font-sans">6</text>
                  <text x="14" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" className="fill-slate-500 font-sans">9</text>

                  {/* Hour Hand (Thick, Short, Black) */}
                  {/* Simple degree calculation: hours * 30 + minutes * 0.5 */}
                  <path
                    d="M 50 50 L 50 26"
                    className="stroke-slate-800 stroke-3.5 stroke-round"
                    style={{
                      transformOrigin: '50px 50px',
                      transform: `rotate(${(choice.hours % 12) * 30 + choice.minutes * 0.5}deg)`,
                    }}
                  />

                  {/* Minute Hand (Thinner, Long, Colorful) */}
                  {/* Simple degree: minutes * 6 */}
                  <path
                    d="M 50 50 L 50 14"
                    className="stroke-indigo-500 stroke-2.5 stroke-round"
                    style={{
                      transformOrigin: '50px 50px',
                      transform: `rotate(${choice.minutes * 6}deg)`,
                    }}
                  />

                  {/* Pin Dot Center */}
                  <circle cx="50" cy="50" r="3.5" className="fill-rose-500 border border-white" />
                  <circle cx="50" cy="50" r="1" className="fill-white" />
                </svg>

                {/* Cover indicator for debugging */}
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                  {choice.hours}시 {zeroPad(choice.minutes)}분
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="text-center text-[10px] text-gray-400 mt-2">
        💡 도움말: 짧은 바늘(시침)은 '시'를, 긴 바늘(분침)은 '분'을 가리킵니다.
      </div>
    </div>
  );
}
