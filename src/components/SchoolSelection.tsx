import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, School as SchoolIcon, Shield, Check, MapPin, Smile } from 'lucide-react';
import { School } from '../types';
import { playSelect } from './SoundEffects';

interface SchoolSelectionProps {
  schools: School[];
  currentSchool: School | null;
  onSelectSchool: (school: School) => void;
  onRegisterSchool: (newSchool: Omit<School, 'score' | 'playerCount' | 'rankChange'>) => void;
}

const REGIONS = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '제주'];
const MASCOTS = ['🐯', '🐬', '🦁', '🦅', '🦉', '🐻', '🦊', '🐼', '🐨', '🦄', '🐰', '🐯', '🌳', '⭐️'];
const THEME_COLORS = [
  { name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500' },
  { name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { name: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-500' },
];

export default function SchoolSelection({
  schools,
  currentSchool,
  onSelectSchool,
  onRegisterSchool,
}: SchoolSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [showAddForm, setShowAddForm] = useState(false);

  // New School Form States
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState('서울');
  const [newMascot, setNewMascot] = useState('🐯');
  const [newColorIdx, setNewColorIdx] = useState(0);

  const handleSelect = (school: School) => {
    playSelect();
    onSelectSchool(school);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    playSelect();
    // Auto-append '초등학교' if lacking
    let cleanName = newName.trim();
    if (!cleanName.endsWith('초등학교')) {
      cleanName = cleanName + '초등학교';
    }

    onRegisterSchool({
      id: `school_${Date.now()}`,
      name: cleanName,
      region: newRegion,
      mascot: newMascot,
      color: THEME_COLORS[newColorIdx].bg,
      textColor: THEME_COLORS[newColorIdx].text,
    });

    // Reset Form
    setNewName('');
    setShowAddForm(false);
  };

  // Filters schools
  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name.includes(searchQuery);
    const matchesRegion = selectedRegion === '전체' || school.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[440px] border border-transparent">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SchoolIcon className="w-5 h-5 text-[#3182F6]" />
          <h2 className="text-lg font-extrabold text-[#191F28]">🏫 대표 학교 등교하기 </h2>
        </div>
        
        <button
          id="btn-toggle-add-school"
          onClick={() => {
            playSelect();
            setShowAddForm(!showAddForm);
          }}
          className="text-xs bg-blue-50 hover:bg-blue-100 font-bold text-[#3182F6] px-4 py-2 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
        >
          {showAddForm ? '❌ 닫기' : '➕ 우리학교 등록'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          /* REGISTRATION FORM VIEW */
          <motion.form
            id="register-school-form"
            key="add-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-4 bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6]"
          >
            {/* School Name */}
            <div>
              <label htmlFor="school-name-input" className="block text-xs font-bold text-[#4E5968] mb-1.5">학교 이름 입력</label>
              <input
                id="school-name-input"
                type="text"
                placeholder="예: 서울반포, 한빛"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={10}
                required
                className="w-full bg-white border border-[#E5E8EB] outline-none focus:border-[#3182F6] rounded-xl px-3.5 py-2.5 text-sm text-[#191F28] font-medium transition-colors"
              />
              <span className="text-[10px] text-[#8B95A1] mt-1.5 block">끝에 '초등학교'가 입력되지 않으면 자동으로 붙습니다!</span>
            </div>

            {/* Region choice */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="school-region-select" className="block text-xs font-bold text-[#4E5968] mb-1.5">소재지 선택</label>
                <select
                  id="school-region-select"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full bg-white border border-[#E5E8EB] outline-none rounded-xl px-2.5 py-2.5 text-xs text-[#4E5968] font-medium cursor-pointer"
                >
                  {REGIONS.filter(r => r !== '전체').map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              {/* Theme custom colors */}
              <div>
                <label className="block text-xs font-bold text-[#4E5968] mb-1.5">시그니처 컬러</label>
                <div className="flex gap-1.5 pt-1">
                  {THEME_COLORS.map((color, idx) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        playSelect();
                        setNewColorIdx(idx);
                      }}
                      className={`w-5 h-5 rounded-full ${color.bg} cursor-pointer transition-transform relative ${
                        newColorIdx === idx ? 'scale-120 ring-2 ring-white shadow-xs' : 'opacity-85'
                      }`}
                    >
                      {newColorIdx === idx && (
                        <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mascot Emojis selections */}
            <div>
              <label className="block text-xs font-bold text-[#4E5968] mb-1.5">마스코트 캐릭터 아이콘</label>
              <div className="flex flex-wrap gap-2 pt-1 h-20 overflow-y-auto bg-white p-2 rounded-xl border border-[#F2F4F6]">
                {MASCOTS.map((emoji) => (
                  <button
                    key={emoji + 'key'}
                    type="button"
                    onClick={() => {
                      playSelect();
                      setNewMascot(emoji);
                    }}
                    className={`w-8 h-8 text-sm flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                      newMascot === emoji ? 'bg-blue-50 font-bold text-[#3182F6]' : 'hover:bg-slate-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Done button */}
            <button
              id="btn-register-submit"
              type="submit"
              className="w-full bg-[#3182F6] hover:bg-[#1b64da] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
            >
              🎉 우리학교 등록하고 대표 학생되기
            </button>
          </motion.form>
        ) : (
          /* STANDARD FILTERABLE LIST VIEW */
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Search Input filter - Toss style neat bar */}
            <div className="flex items-center gap-2.5 bg-[#F2F4F6] rounded-2xl px-4 py-2.5 mb-4">
              <Search className="w-4 h-4 text-[#8B95A1] shrink-0" />
              <input
                id="school-search-query-input"
                type="text"
                placeholder="나의 초등학교 이름을 검색해보세요!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#191F28] placeholder:text-[#8B95A1]"
              />
            </div>

            {/* Region Categories selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-3 scrollbar-none shrink-0">
              {REGIONS.map((reg) => (
                <button
                  key={reg}
                  id={`region-btn-${reg}`}
                  onClick={() => {
                    playSelect();
                    setSelectedRegion(reg);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-[#3182F6] text-white shadow-xs'
                      : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Grid list container */}
            <div className="flex-1 overflow-y-auto max-h-[290px] pr-1 space-y-2">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => {
                  const isSelected = currentSchool?.id === school.id;
                  
                  return (
                    <button
                      key={school.id}
                      id={`school-card-${school.id}`}
                      onClick={() => handleSelect(school)}
                      className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#3182F6] bg-blue-50/30'
                          : 'border-[#F2F4F6] bg-white hover:border-[#E5E8EB]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* School Badge - Toss-like clean circular rounded mascot badge */}
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center relative shadow-sm overflow-hidden ${school.color}`}>
                          <div className="absolute inset-0 bg-white/10" />
                          <span className="text-xl select-none z-10">{school.mascot}</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-[#F2F4F6] text-[#4E5968] font-bold px-1.5 py-0.5 rounded-md">
                              {school.region}
                            </span>
                            <p className="text-xs font-bold text-[#191F28] leading-none">
                              {school.name}
                            </p>
                          </div>
                          
                          <p className="text-[10.5px] text-[#8B95A1] mt-1 font-medium">
                            참여 학생: <span className="font-extrabold text-[#4E5968]">{school.playerCount}명</span>
                          </p>
                        </div>
                      </div>

                      {/* Selected State Badge */}
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="bg-[#3182F6] text-white rounded-full p-1.5 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#3182F6] font-bold px-3 py-1 bg-blue-50/50 rounded-xl">등교</span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <Smile className="w-8 h-8 text-slate-300 mx-auto block mb-2 animate-pulse" />
                  <p className="text-xs text-[#8B95A1] font-medium">검색된 학교가 없습니다.</p>
                  <p className="text-[10px] text-[#8B95A1]/70 mt-1">우측 위의 버튼으로 학교를 새로 등록해보세요!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
