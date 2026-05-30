import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GamePatternProps {
  level: number;
  questionIndex: number;
  onAnswer: (correct: boolean, scoreAdd?: number) => void;
}

interface PatternQuestion {
  sequence: Array<number | string>;
  correctAnswer: number;
  choices: number[];
  ruleDescription: string;
}

export default function GamePattern({ level, questionIndex, onAnswer }: GamePatternProps) {
  const [question, setQuestion] = useState<PatternQuestion | null>(null);

  // Generate Pattern sequence based on Level
  const generateQuestion = (): PatternQuestion => {
    let base = 0;
    let seqLength = 5;
    let missingIndex = 3; // Usually let's hide index 2 or 3 (0-indexed)
    let sequence: number[] = [];
    let correctAnswer = 0;
    let ruleDescription = '';

    // Choose types based on level
    if (level === 1) {
      // Simple linear arithmetic adding sequence (+1, +2, +3, +5)
      base = Math.floor(Math.random() * 8) + 1;
      const diff = Math.floor(Math.random() * 4) + 1; // +1 to +4
      for (let i = 0; i < seqLength; i++) {
        sequence.push(base + i * diff);
      }
      missingIndex = Math.random() > 0.5 ? 2 : 3;
      correctAnswer = sequence[missingIndex];
      ruleDescription = `숫자가 ${diff}씩 늘어나고 있어요!`;
    } else if (level === 2) {
      // Decreasing sequences or larger sums
      base = Math.floor(Math.random() * 30) + 15;
      const diff = Math.floor(Math.random() * 3) + 2; // -2 to -4
      for (let i = 0; i < seqLength; i++) {
        sequence.push(base - i * diff);
      }
      missingIndex = Math.random() > 0.5 ? 2 : 3;
      correctAnswer = sequence[missingIndex];
      ruleDescription = `숫자가 ${diff}씩 줄어들고 있어요!`;
    } else if (level === 3) {
      // Multiplicative sequences (e.g., doubling *2 or tripling *3)
      base = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      const ratio = 2; // Keep doubling for simple 4th-grade math
      for (let i = 0; i < seqLength; i++) {
        sequence.push(base * Math.pow(ratio, i));
      }
      missingIndex = Math.random() > 0.5 ? 2 : 3;
      correctAnswer = sequence[missingIndex];
      ruleDescription = `이전 숫자의 ${ratio}배씩 곱해지고 있어요!`;
    } else if (level === 4) {
      // Fibonnaci-like addition sequences (+1, +2, +3, +4...)
      base = Math.floor(Math.random() * 5) + 1;
      let currentVal = base;
      for (let i = 0; i < seqLength; i++) {
        currentVal += i;
        sequence.push(currentVal);
      }
      missingIndex = 3;
      correctAnswer = sequence[missingIndex];
      ruleDescription = `더해지는 숫자가 0, 1, 2, 3...씩 늘어나는 규칙이에요!`;
    } else {
      // Advanced Grade 5+: Alternating sequences (e.g. +3 then -1, then +3 then -1...)
      base = Math.floor(Math.random() * 10) + 5;
      const addVal = 3;
      const subVal = 1;
      let currentVal = base;
      for (let i = 0; i < seqLength; i++) {
        sequence.push(currentVal);
        currentVal = i % 2 === 0 ? currentVal + addVal : currentVal - subVal;
      }
      missingIndex = 3;
      correctAnswer = sequence[missingIndex];
      ruleDescription = `더하기 ${addVal}, 빼기 ${subVal} 규칙이 반복되요!`;
    }

    // Convert missing index to a placeholder string
    const finalSequence: Array<number | string> = [...sequence];
    finalSequence[missingIndex] = '?';

    // Generate Multiple Choice answers
    const choicesSet = new Set<number>([correctAnswer]);
    while (choicesSet.size < 4) {
      const offset = (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = correctAnswer + offset;
      if (wrong !== correctAnswer && wrong > 0) {
        choicesSet.add(wrong);
      }
    }

    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    return {
      sequence: finalSequence,
      correctAnswer,
      choices,
      ruleDescription,
    };
  };

  useEffect(() => {
    setQuestion(generateQuestion());
  }, [questionIndex, level]);

  if (!question) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full py-2">
      {/* Game Banner Header */}
      <div className="text-center mb-4">
        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          규칙 기차 레일 🚂
        </span>
        <h3 className="text-lg font-bold text-slate-800 mt-2">
          끊어진 기차의 철로 규칙을 찾고 빈칸에 알맞은 숫자를 맞추세요!
        </h3>
      </div>

      {/* Visual Train Display */}
      <div className="my-6 relative overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex items-end justify-center gap-1.5 md:gap-2.5 min-w-[340px] px-4 self-center">
          
          {/* Locomotive Engine front of train */}
          <div className="flex flex-col items-center shrink-0">
            {/* Animated smoke bubble */}
            <motion.div
              animate={{ y: [0, -12, -24], opacity: [0, 0.8, 0], scale: [0.6, 1.2, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
              className="w-4 h-4 rounded-full bg-slate-300 mb-1"
            />
            {/* Engine Cabin */}
            <div className="w-14 h-16 bg-gradient-to-t from-teal-600 to-emerald-500 rounded-t-2xl rounded-r-lg border-2 border-white flex flex-col items-center justify-center relative shadow-md">
              <div className="absolute top-1 right-1 w-2.5 h-2 bg-sky-200/80 rounded-xs border border-white" />
              <div className="w-3.5 h-6 bg-slate-600 absolute bottom-0 left-0" />
              <div className="text-xl select-none">🚂</div>
            </div>
          </div>

          {/* Connected Carts with numbers */}
          {question.sequence.map((num, idx) => {
            const isMissing = num === '?';

            return (
              <div key={idx} className="flex items-center shrink-0">
                {/* Visual Connector Hook */}
                <div className="w-3 h-1 bg-slate-400 shrink-0 self-center mb-4" />
                
                {/* Cart Body */}
                <motion.div
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring' }}
                  className={`w-14 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm relative ${
                    isMissing
                      ? 'bg-amber-100 border-amber-400 border-dashed animate-pulse'
                      : 'bg-white border-emerald-300'
                  }`}
                >
                  {isMissing ? (
                    <span className="text-xl font-black text-amber-600 animate-bounce">?</span>
                  ) : (
                    <span className="text-lg font-black font-mono text-slate-700">{num}</span>
                  )}
                  {/* Cart Wheels */}
                  <div className="absolute -bottom-2 inset-x-2.5 flex justify-between">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-white" />
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-white" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Train Tracks Layout */}
        <div className="h-2 bg-stone-400 border-t border-stone-500 max-w-lg mx-auto mt-2 relative rounded-full">
          <div className="absolute inset-x-0 top-1.5 flex justify-between px-2">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-amber-800/80 rounded-xs -mt-1 transform rotate-12" />
            ))}
          </div>
        </div>
      </div>

      {/* Multiple-choice Wooden Signs */}
      <div className="grid grid-cols-4 gap-2.5 my-4 px-1">
        <AnimatePresence mode="wait">
          {question.choices.map((choice, idx) => {
            return (
              <motion.button
                id={`wooden-sign-${idx}`}
                key={`${questionIndex}-${choice}`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const isCorrect = choice === question.correctAnswer;
                  onAnswer(isCorrect, isCorrect ? 100 + level * 10 : 0);
                }}
                className="bg-amber-50 hover:bg-amber-100/90 border-2 border-amber-800/65 cursor-pointer rounded-2xl p-3 flex flex-col items-center justify-center shadow-md border-b-6 active:border-b-2 select-none transition-all relative overflow-hidden"
              >
                {/* Wood grains simulation lines */}
                <div className="absolute inset-y-0.5 left-1/4 w-px bg-amber-800/10 pointer-events-none" />
                <div className="absolute inset-y-1.5 right-1/4 w-px bg-amber-800/10 pointer-events-none" />
                
                <span className="text-base font-bold text-amber-900 leading-none select-none mb-0.5">답</span>
                <span className="text-2xl font-black font-mono text-amber-950 tracking-tight leading-none drop-shadow-xs">
                  {choice}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Helpful math rule tip (Level depending) */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
        <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1.5">
          <span>💡 힌트 요정:</span>
          <span className="text-emerald-700 animate-pulse">{question.ruleDescription}</span>
        </p>
      </div>
    </div>
  );
}
