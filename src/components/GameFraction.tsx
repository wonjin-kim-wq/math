import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChefHat } from 'lucide-react';

interface GameFractionProps {
  level: number;
  questionIndex: number;
  onAnswer: (correct: boolean, scoreAdd?: number) => void;
}

interface FractionQuestion {
  targetNumerator: number;
  targetDenominator: number;
  sliceCount: number; // pizza cuts
}

export default function GameFraction({ level, questionIndex, onAnswer }: GameFractionProps) {
  const [question, setQuestion] = useState<FractionQuestion | null>(null);
  const [activeSlices, setActiveSlices] = useState<boolean[]>([]);

  // Generate Fraction Questions based on Level
  const generateQuestion = (): FractionQuestion => {
    // Determine denominators based on Level
    let possibleDenoms = [2, 3, 4];
    if (level === 2) possibleDenoms = [3, 4, 6];
    if (level >= 3) possibleDenoms = [4, 6, 8];

    const sliceCount = possibleDenoms[Math.floor(Math.random() * possibleDenoms.length)];
    // Make sure numerator is less than denominator
    const targetNumerator = Math.floor(Math.random() * (sliceCount - 1)) + 1;
    const targetDenominator = sliceCount;

    return {
      targetNumerator,
      targetDenominator,
      sliceCount, // usually matches denom for elementary, but could be double for equivalent fractions later if we want!
    };
  };

  useEffect(() => {
    const q = generateQuestion();
    setQuestion(q);
    setActiveSlices(new Array(q.sliceCount).fill(false));
  }, [questionIndex, level]);

  if (!question) return null;

  const handleSliceClick = (index: number) => {
    setActiveSlices((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const checkAnswer = () => {
    const selectedCount = activeSlices.filter(Boolean).length;
    
    // Check for equivalent fractions! Let's say user cooked 3/6 when target was 1/2. That is correct!
    const targetRatio = question.targetNumerator / question.targetDenominator;
    const selectedRatio = selectedCount / question.sliceCount;

    const isCorrect = Math.abs(targetRatio - selectedRatio) < 0.0001;
    
    onAnswer(isCorrect, isCorrect ? 120 + level * 10 : 0);
  };

  // SVG parameters for drawing pizza slices
  const centerX = 100;
  const centerY = 100;
  const radius = 85;

  const getSlicePath = (index: number, totalSlices: number) => {
    const startAngle = (index * 360) / totalSlices - 90; // offset by -90 to start at 12 o'clock
    const endAngle = ((index + 1) * 360) / totalSlices - 90;

    const rad = Math.PI / 180;
    const x1 = centerX + radius * Math.cos(startAngle * rad);
    const y1 = centerY + radius * Math.sin(startAngle * rad);
    const x2 = centerX + radius * Math.cos(endAngle * rad);
    const y2 = centerY + radius * Math.sin(endAngle * rad);

    // Large-arc flag is 0 for angles <= 180 (always true for slices because we slice pizza >= 2, so angle <= 180)
    const largeArcFlag = 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getSlicesCenter = (index: number, totalSlices: number) => {
    // Used to place pepperoni and topping graphics on the slice centroid
    const midAngle = (index * 360 + 180) / totalSlices - 90;
    const rad = Math.PI / 180;
    const dist = radius * 0.55; // halfway along the sector radius
    return {
      x: centerX + dist * Math.cos(midAngle * rad),
      y: centerY + dist * Math.sin(midAngle * rad),
    };
  };

  const selectedCount = activeSlices.filter(Boolean).length;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between h-full py-2">
      {/* Quiz Delivery Board */}
      <div className="text-center mb-4">
        <span className="text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
          분수 피자 가게 🍕
        </span>
        
        {/* Adorable Order Card */}
        <div className="mt-3 bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between shadow-xs max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-amber-500 animate-bounce" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-amber-600">꼬마 손님의 주문</p>
              <h3 className="text-sm font-bold text-slate-800">피자를 이만큼 채워주세요!</h3>
            </div>
          </div>
          
          {/* Fraction display */}
          <div className="flex items-center gap-2 font-mono font-black text-2xl text-slate-800 bg-white border border-amber-200 shadow-sm px-4 py-2 rounded-xl">
            <div className="flex flex-col items-center">
              <span>{question.targetNumerator}</span>
              <div className="h-0.5 bg-slate-800 w-full" />
              <span>{question.targetDenominator}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Svg Pizza Tray */}
      <div className="flex justify-center my-2">
        <div className="w-56 h-56 relative bg-amber-100/30 rounded-full border-4 border-dashed border-amber-200 flex items-center justify-center p-2.5">
          <svg viewBox="0 0 200 200" className="w-full h-full select-none cursor-pointer filter drop-shadow-md">
            {/* Outer golden baked crust ring */}
            <circle cx="100" cy="100" r="91" className="fill-amber-600" />
            <circle cx="100" cy="100" r="86" className="fill-[#FBECC8]" /> {/* Cheesy base */}

            {/* Individual Pizza slices */}
            {activeSlices.map((active, idx) => {
              const pathStr = getSlicePath(idx, question.sliceCount);
              const centroid = getSlicesCenter(idx, question.sliceCount);

              return (
                <g key={idx} className="group" onClick={() => handleSliceClick(idx)}>
                  <path
                    d={pathStr}
                    className={`stroke-[#EED49F] stroke-2 outline-none transition-colors duration-150 ${
                      active
                        ? 'fill-[#EA580C]' // Red tomato base / sauce color
                        : 'fill-[#FCE19F] opacity-75 group-hover:fill-[#FADA83]'
                    }`}
                  />
                  
                  {/* Toppings (Only show when active) */}
                  {active && (
                    <g className="pointer-events-none select-none">
                      {/* Generous Cheese cover path overlay */}
                      <path d={pathStr} className="fill-[rgba(253,224,71,0.85)] scale-[0.9] origin-[100px_100px]" />
                      
                      {/* Pepperoni bubble centroid */}
                      <circle cx={centroid.x} cy={centroid.y} r="10" className="fill-red-600 stroke-red-800 stroke-1" />
                      <circle cx={centroid.x - 3} cy={centroid.y - 3} r="3" className="fill-red-400 opacity-70" />
                      
                      {/* Small olive bits */}
                      <circle cx={centroid.x + 7} cy={centroid.y + 7} r="2.5" className="fill-slate-900" />
                      <circle cx={centroid.x - 8} cy={centroid.y + 5} r="2.5" className="fill-slate-900" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Pizza cutting wire dividers overlay */}
            {[...Array(question.sliceCount)].map((_, i) => {
              const angle = (i * 360) / question.sliceCount - 90;
              const r = Math.PI / 180;
              const x = centerX + radius * Math.cos(angle * r);
              const y = centerY + radius * Math.sin(angle * r);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  className="stroke-[#9A3412] stroke-1.5 opacity-60 pointer-events-none"
                />
              );
            })}

            {/* Small center olive/herb decoration */}
            <circle cx="100" cy="100" r="5" className="fill-amber-900 stroke-amber-950 stroke-1" />
          </svg>
        </div>
      </div>

      {/* Slices count help */}
      <div className="text-center mb-4">
        <p className="text-xs text-slate-500 font-semibold mb-2">
          현재 채워진 피자 조각: <span className="text-amber-600 font-bold">{selectedCount}</span> / {question.sliceCount} 조각
        </p>
        
        {selectedCount === 0 && (
          <p className="text-[10px] text-rose-500 font-medium">피자 조각을 터치해 치즈와 페퍼로니를 올려주세요!</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        id="btn-fraction-submit"
        disabled={selectedCount === 0}
        onClick={checkAnswer}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-2xl shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-98 disabled:opacity-40 select-none cursor-pointer text-sm"
      >
        🍕 맛있는 피자 오븐에 굽기! (Serving)
      </button>
    </div>
  );
}
