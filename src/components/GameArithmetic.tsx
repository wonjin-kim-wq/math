import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameArithmeticProps {
  level: number;
  questionIndex: number;
  onAnswer: (correct: boolean, scoreAdd?: number) => void;
}

interface Question {
  equation: string;
  correctAnswer: number;
  choices: number[];
}

export default function GameArithmetic({ level, questionIndex, onAnswer }: GameArithmeticProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [bubblePositions, setBubblePositions] = useState<Array<{ x: number; y: number; speedY: number; scale: number }>>([]);

  // Generate question based on Level
  const generateQuestion = (): Question => {
    let num1 = 0;
    let num2 = 0;
    let operator = '+';
    let correctAnswer = 0;

    // Progression difficulty matrix
    if (level === 1) {
      // Simple single digit + / -
      num1 = Math.floor(Math.random() * 9) + 1; // 1-9
      num2 = Math.floor(Math.random() * 9) + 1; // 1-9
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '-' && num1 < num2) {
        // Prevent negative answers for Level 1 children
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    } else if (level === 2) {
      // Two digit + / - up to 30
      num1 = Math.floor(Math.random() * 20) + 10; // 10-29
      num2 = Math.floor(Math.random() * 15) + 5;  // 5-19
      operator = Math.random() > 0.4 ? '+' : '-';
      if (operator === '-' && num1 < num2) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    } else if (level === 3) {
      // Multiplication 2x2 to 9x9 (구구단!)
      num1 = Math.floor(Math.random() * 8) + 2; // 2-9
      num2 = Math.floor(Math.random() * 8) + 2; // 2-9
      operator = '×';
      correctAnswer = num1 * num2;
    } else if (level === 4) {
      // Clean Division (나눗셈) or double digit operators
      num2 = Math.floor(Math.random() * 8) + 2; // 2-9 divisor
      correctAnswer = Math.floor(Math.random() * 9) + 2; // 2-10 multiplier
      num1 = num2 * correctAnswer; // guarantees clean integer quotient
      operator = '÷';
    } else {
      // Advanced Level 5+: Combined double digits with mixed operators
      const roll = Math.random();
      if (roll < 0.3) {
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 40) + 10;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) { const t = num1; num1 = num2; num2 = t; }
        correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
      } else if (roll < 0.6) {
        num1 = Math.floor(Math.random() * 12) + 4;
        num2 = Math.floor(Math.random() * 9) + 4;
        operator = '×';
        correctAnswer = num1 * num2;
      } else {
        num2 = Math.floor(Math.random() * 12) + 3;
        correctAnswer = Math.floor(Math.random() * 12) + 2;
        num1 = num2 * correctAnswer;
        operator = '÷';
      }
    }

    const equation = `${num1} ${operator} ${num2} = ?`;

    // Generate incorrect answers close to the correct answer
    const choicesSet = new Set<number>([correctAnswer]);
    while (choicesSet.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = correctAnswer + offset;
      if (wrong !== correctAnswer && (wrong >= 0 || level > 2)) {
        choicesSet.add(wrong);
      }
    }

    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    return { equation, correctAnswer, choices };
  };

  // Generate new question on index change
  useEffect(() => {
    setQuestion(generateQuestion());
    
    // Bubble positions for background float effects
    const positions = [...Array(4)].map(() => ({
      x: Math.random() * 30 - 15, // float offsets
      y: Math.random() * 15 - 5,
      speedY: Math.random() * 0.5 + 0.3,
      scale: Math.random() * 0.15 + 0.95,
    }));
    setBubblePositions(positions);
  }, [questionIndex, level]);

  if (!question) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between h-full py-2">
      {/* Quiz Prompt Banner */}
      <div className="text-center mb-6">
        <span className="text-sm font-semibold text-rose-500 uppercase tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
          Quiz {questionIndex + 1}
        </span>
        <h2 className="text-5xl font-black text-rose-650 font-mono tracking-tight mt-3 select-none">
          {question.equation}
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          아래의 동글동글 숫자 버블 중 알맞은 정답을 터치하세요!
        </p>
      </div>

      {/* Choice Bubbles Board */}
      <div className="grid grid-cols-2 gap-5 px-3 mb-4">
        <AnimatePresence mode="popLayout">
          {question.choices.map((choice, idx) => {
            const pos = bubblePositions[idx] || { x: 0, y: 0, scale: 1 };
            // Choose colors for index
            const bubbleColors = [
              'bg-gradient-to-tr from-pink-400 to-rose-450 hover:from-pink-500 hover:to-rose-500 shadow-rose-200/50',
              'bg-gradient-to-tr from-sky-400 to-blue-450 hover:from-sky-500 hover:to-blue-500 shadow-blue-200/50',
              'bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 shadow-amber-200/50',
              'bg-gradient-to-tr from-emerald-400 to-teal-450 hover:from-emerald-300 hover:to-teal-500 shadow-emerald-200/50',
            ];
            const colorClass = bubbleColors[idx % bubbleColors.length];

            return (
              <motion.button
                id={`bubble-${idx}`}
                key={`${questionIndex}-${choice}`}
                initial={{ scale: 0, opacity: 0, y: 40 }}
                animate={{
                  scale: pos.scale,
                  opacity: 1,
                  y: [20, pos.y, 20],
                  x: [0, pos.x, 0],
                }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                transition={{
                  scale: { duration: 0.4, type: 'spring', stiffness: 120 },
                  opacity: { duration: 0.25 },
                  y: { repeat: Infinity, duration: 4 + idx, ease: 'easeInOut', repeatType: 'reverse' },
                  x: { repeat: Infinity, duration: 5 + idx, ease: 'easeInOut', repeatType: 'reverse' },
                }}
                onClick={() => {
                  const isCorrect = choice === question.correctAnswer;
                  // Base score + time-dependent bonus
                  const scoreReward = isCorrect ? 100 + level * 10 : 0;
                  onAnswer(isCorrect, scoreReward);
                }}
                className={`w-full aspect-square md:aspect-auto md:h-28 rounded-3xl flex flex-col items-center justify-center text-white ${colorClass} shadow-xl border-4 border-white cursor-pointer active:scale-95 transition-transform`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.4),transparent_50%)] pointer-events-none rounded-2xl" />
                <span className="text-3xl font-black font-mono tracking-tight drop-shadow-md select-none">
                  {choice}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mini Help Indicator */}
      <div className="text-center text-[10px] text-gray-400/80">
        Tip: 연산 기호({level >= 4 ? '+, -, ×, ÷' : '+, -, ×'})가 바뀔 때 주의하세요!
      </div>
    </div>
  );
}
