import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameSeesawProps {
  level: number;
  questionIndex: number;
  onAnswer: (correct: boolean, scoreAdd?: number) => void;
}

interface SeesawQuestion {
  type: 'compare' | 'balance';
  leftValue: number;
  leftDisplay: string;
  rightValue: number;
  rightDisplay: string; // for balance, e.g. "8 + ?"
  correctString: string; // "<", ">", "=" or the missing number string
  choices: string[];
}

export default function GameSeesaw({ level, questionIndex, onAnswer }: GameSeesawProps) {
  const [question, setQuestion] = useState<SeesawQuestion | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0); // degrees to tilt the seesaw
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Generate Seesaw Question based on Level
  const generateQuestion = (): SeesawQuestion => {
    const isCompare = level <= 3 || Math.random() > 0.4; // compare operators (< = >) vs find balance number

    if (isCompare) {
      let leftVal = 0;
      let rightVal = 0;
      let leftLabel = '';
      let rightLabel = '';

      if (level === 1) {
        // Direct single digit comparisons
        leftVal = Math.floor(Math.random() * 10) + 1;
        rightVal = Math.floor(Math.random() * 10) + 1;
        leftLabel = String(leftVal);
        rightLabel = String(rightVal);
      } else if (level === 2) {
        // Simple equation vs direct number
        const num1 = Math.floor(Math.random() * 8) + 2;
        const num2 = Math.floor(Math.random() * 8) + 2;
        leftVal = num1 + num2;
        leftLabel = `${num1} + ${num2}`;

        rightVal = Math.floor(Math.random() * 12) + 4;
        rightLabel = String(rightVal);
      } else {
        // Equation vs Equation (addition, subtraction, multiplication)
        const opLeft = Math.random() > 0.5 ? '+' : '×';
        if (opLeft === '+') {
          const n1 = Math.floor(Math.random() * 15) + 5;
          const n2 = Math.floor(Math.random() * 15) + 5;
          leftVal = n1 + n2;
          leftLabel = `${n1} + ${n2}`;
        } else {
          const n1 = Math.floor(Math.random() * 6) + 2;
          const n2 = Math.floor(Math.random() * 6) + 2;
          leftVal = n1 * n2;
          leftLabel = `${n1} × ${n2}`;
        }

        const opRight = Math.random() > 0.4 ? '-' : '+';
        if (opRight === '-') {
          const n1 = Math.floor(Math.random() * 20) + 15;
          const n2 = Math.floor(Math.random() * 10) + 3;
          rightVal = n1 - n2;
          rightLabel = `${n1} - ${n2}`;
        } else {
          const n1 = Math.floor(Math.random() * 13) + 4;
          const n2 = Math.floor(Math.random() * 13) + 4;
          rightVal = n1 + n2;
          rightLabel = `${n1} + ${n2}`;
        }
      }

      // Determine correct compare operator
      let correctOp = '=';
      if (leftVal < rightVal) correctOp = '<';
      if (leftVal > rightVal) correctOp = '>';

      return {
        type: 'compare',
        leftValue: leftVal,
        leftDisplay: leftLabel,
        rightValue: rightVal,
        rightDisplay: rightLabel,
        correctString: correctOp,
        choices: ['<', '=', '>'],
      };
    } else {
      // Balance Scale Quiz Type!
      // Left side: weight card (e.g. 15)
      // Right side: base + ? (e.g. 9 + ?)
      const leftVal = Math.floor(Math.random() * 15) + 6; // 6-20
      const missingVal = Math.floor(Math.random() * 5) + 1; // 1-5 to add
      const baseVal = leftVal - missingVal;

      const leftLabel = `${leftVal}`;
      const rightLabel = `${baseVal} + ?`;

      const choicesSet = new Set<string>([String(missingVal)]);
      while (choicesSet.size < 4) {
        const offset = Math.floor(Math.random() * 6) + 1;
        const wrong = missingVal + (Math.random() > 0.5 ? offset : -offset);
        if (wrong !== missingVal && wrong > 0) {
          choicesSet.add(String(wrong));
        }
      }

      const choices = Array.from(choicesSet).sort((a, b) => Number(a) - Number(b));

      return {
        type: 'balance',
        leftValue: leftVal,
        leftDisplay: leftLabel,
        rightValue: leftVal, // Set rightValue to leftValue to represent the target horizontal balance!
        rightDisplay: rightLabel,
        correctString: String(missingVal),
        choices,
      };
    }
  };

  useEffect(() => {
    const q = generateQuestion();
    setQuestion(q);
    setAnsweredState('idle');

    // Initial tilted slope angle of seesaw depending on values!
    // In balance mode before solving, let's tilt it left side down because right side is missing weight card!
    if (q.type === 'balance') {
      setRotationAngle(-10); // left heavier since right is missing weight
    } else {
      if (q.leftValue > q.rightValue) setRotationAngle(-10);
      else if (q.leftValue < q.rightValue) setRotationAngle(10);
      else setRotationAngle(0);
    }
  }, [questionIndex, level]);

  if (!question) return null;

  const handleChoice = (option: string) => {
    const isCorrect = option === question.correctString;
    setAnsweredState(isCorrect ? 'correct' : 'wrong');

    // Fun physics simulation on submit:
    if (question.type === 'balance') {
      if (isCorrect) {
        // Balanced perfectly!
        setRotationAngle(0);
      } else {
        // Set tilting according to user guess
        const guessedWeight = Number(option);
        const actualLeft = question.leftValue;
        const rightLabelParsedNum = question.leftValue - Number(question.correctString);
        const guessedRight = rightLabelParsedNum + guessedWeight;

        if (actualLeft > guessedRight) setRotationAngle(-12);
        else if (actualLeft < guessedRight) setRotationAngle(12);
        else setRotationAngle(0);
      }
    }

    onAnswer(isCorrect, isCorrect ? 140 + level * 10 : 0);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full py-2">
      {/* Quiz Delivery Board */}
      <div className="text-center mb-2">
        <span className="text-sm font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
          무게 균형 시소 ⚖️
        </span>
        <h3 className="text-lg font-bold text-slate-800 mt-2">
          {question.type === 'compare'
            ? '양쪽 값을 계산하고 알맞은 크기 부등호를 선택하세요!'
            : '시소의 균형을 수평(=)으로 만들기 위해 물음표 ? 에 들어갈 무게를 골라주세요!'}
        </h3>
      </div>

      {/* Interactive Seesaw Playground Area */}
      <div className="relative h-44 flex items-center justify-center my-4 overflow-hidden">
        {/* Sky styling wrapper */}
        <div className="absolute inset-x-4 inset-y-0.5 bg-sky-100/30 rounded-3xl pointer-events-none -z-10" />

        {/* Seesaw Pivot / Base Triangle */}
        <div className="absolute bottom-4 z-0 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[40px] border-b-sky-700 shadow-sm" />
          <div className="w-16 h-2 bg-slate-600 rounded-full" />
        </div>

        {/* Rotatable Seesaw Plank */}
        <motion.div
          animate={{ rotate: rotationAngle }}
          transition={{ type: 'spring', stiffness: 90, damping: 10 }}
          className="absolute w-10/12 h-3.5 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 rounded-full border border-white shadow-md z-10 flex items-center justify-between px-1"
        >
          {/* Left Weight Seat */}
          <div className="absolute left-1 -top-14 flex flex-col items-center">
            {/* Elegant Weight Box */}
            <div className="w-16 h-14 bg-emerald-500 border-2 border-white rounded-2xl shadow-md flex flex-col items-center justify-center relative">
              <div className="text-[9px] text-white/80 font-bold uppercase leading-none select-none">LEFT</div>
              <span className="text-sm font-extrabold font-mono text-white mt-1 select-none">
                {question.leftDisplay}
              </span>
              <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-700 rounded-full" />
            </div>
            {/* Hanging visual string */}
            <div className="w-0.5 h-4 bg-slate-500" />
          </div>

          {/* Right Weight Seat */}
          <div className="absolute right-1 -top-14 flex flex-col items-center">
            {/* Elegant Weight Box */}
            <div className="w-16 h-14 bg-rose-500 border-2 border-white rounded-2xl shadow-md flex flex-col items-center justify-center relative">
              <div className="text-[9px] text-white/80 font-bold uppercase leading-none select-none">RIGHT</div>
              <span className="text-sm font-extrabold font-mono text-white mt-1 select-none">
                {question.rightDisplay}
              </span>
              <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-700 rounded-full" />
            </div>
            {/* Hanging visual string */}
            <div className="w-0.5 h-4 bg-slate-500" />
          </div>
        </motion.div>
      </div>

      {/* Answer Board Choices */}
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto w-full my-3 px-1">
        <AnimatePresence mode="popLayout">
          {question.choices.map((option, idx) => {
            // style choices uniquely depending on operator or weight block
            const isOperator = option === '<' || option === '=' || option === '>';
            const buttonStyle = isOperator
              ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 hover:from-indigo-600 text-white font-mono text-3xl font-black rounded-full w-16 h-16 shadow-lg flex items-center justify-center'
              : 'bg-gradient-to-b from-amber-400 to-orange-500 border-amber-600 hover:from-amber-500 text-white font-mono text-2xl font-black rounded-2xl py-3.5 shadow-md flex items-center justify-center';

            return (
              <div key={option} className="flex justify-center">
                <motion.button
                  id={`seesaw-choice-${option}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleChoice(option)}
                  className={`${buttonStyle} border-b-4 active:border-b-1 cursor-pointer select-none transition-all`}
                >
                  {option}
                </motion.button>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Miniature balance status help */}
      <div className="bg-slate-50/85 border border-slate-150/60 rounded-xl p-2.5 text-center">
        <p className="text-xs text-slate-500 font-medium">
          {question.type === 'compare' ? (
            <span>💡 관계 기호: <strong>{'<'}</strong> (오른쪽이 큼), <strong>{'='}</strong> (무게 같음), <strong>{'>'}</strong> (왼쪽이 큼)</span>
          ) : (
            <span>💡 룰: 오른쪽 물음표에 무게를 더해 왼쪽의 <strong>{question.leftValue}kg</strong>와 똑같이 무게를 맞추세요.</span>
          )}
        </p>
      </div>
    </div>
  );
}
