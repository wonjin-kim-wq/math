import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, School as SchoolIcon, Shield, Check, MapPin, Smile } from 'lucide-react';
import { School } from '../types';
import { playSelect } from './SoundEffects';
import { searchSchools, SearchedSchool } from '../services/schoolApi';

interface SchoolSelectionProps {
  schools: School[];
  currentSchool: School | null;
  onSelectSchool: (school: School) => void;
  onRegisterSchool: (newSchool: Omit<School, 'score' | 'playerCount' | 'rankChange'>) => void;
}

const REGIONS = [
  '전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

const MASCOTS = ['🐯', '🐬', '🦁', '🦅', '🦉', '🐻', '🦊', '🐼', '🐨', '🦄', '🐰', '🌳', '⭐️', '💡', '🍀'];

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

  // NEIS API Search States
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<SearchedSchool[]>([]);
  const [selectedApiSchool, setSelectedApiSchool] = useState<SearchedSchool | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSelect = (school: School) => {
    playSelect();
    onSelectSchool(school);
  };

  const handleApiSearch = async () => {
    const keyword = apiSearchQuery.trim();
    if (!keyword) return;

    playSelect();
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchSchools(keyword);
      setApiSearchResults(results);
      setSelectedApiSchool(null); // Reset selection
      setNewName('');
    } catch (error) {
      console.error('Failed to search schools:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiSchool || !newName) return;

    // Check if the school is already registered in our schools list
    const isAlreadyRegistered = schools.some(s => s.name === newName);
    if (isAlreadyRegistered) {
      alert('이미 등록된 학교입니다. 대표 학교 리스트에서 찾아서 [등교] 버튼을 클릭해 주세요!');
      return;
    }

    playSelect();

    onRegisterSchool({
      id: selectedApiSchool.id,
      name: newName,
      region: newRegion,
      mascot: newMascot,
      color: THEME_COLORS[newColorIdx].bg,
      textColor: THEME_COLORS[newColorIdx].text,
    });

    // Reset Form
    setNewName('');
    setApiSearchQuery('');
    setApiSearchResults([]);
    setSelectedApiSchool(null);
    setHasSearched(false);
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
            // Reset API states when toggling
            setApiSearchQuery('');
            setApiSearchResults([]);
            setSelectedApiSchool(null);
            setHasSearched(false);
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
            {/* NEIS API School Search Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#4E5968]">전국 초등학교 검색 (나이스 API)</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: 안동, 포항, 가락, 세종"
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E8EB] outline-none focus:border-[#3182F6] rounded-xl px-3.5 py-2 text-xs text-[#191F28] font-medium transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApiSearch();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApiSearch}
                  disabled={isSearching || !apiSearchQuery.trim()}
                  className="px-4 bg-[#3182F6] text-white text-xs font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {isSearching ? '검색 중...' : '검색'}
                </button>
              </div>

              {/* API Search Results List */}
              {hasSearched && (
                <div className="bg-white rounded-xl border border-[#E5E8EB] max-h-[140px] overflow-y-auto p-1.5 space-y-1">
                  {apiSearchResults.length > 0 ? (
                    apiSearchResults.map((school) => {
                      const isSelected = selectedApiSchool?.id === school.id;
                      return (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => {
                            playSelect();
                            setSelectedApiSchool(school);
                            setNewName(school.name);
                            setNewRegion(school.region);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200 text-[#3182F6] font-bold'
                              : 'hover:bg-slate-50 border border-transparent text-[#4E5968]'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-md text-[9px] mr-1.5">
                              {school.region}
                            </span>
                            <strong>{school.name}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-normal truncate max-w-[240px]">
                              {school.address}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#3182F6] stroke-[3]" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center py-6 text-slate-400 text-xs">검색 결과가 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* Selected School Confirmation display */}
            {selectedApiSchool && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-[#3182F6] font-bold flex items-center justify-between">
                <div>
                  <span className="bg-[#3182F6] text-white text-[9px] px-1.5 py-0.5 rounded-md mr-1.5 font-black uppercase">선택됨</span>
                  {selectedApiSchool.name} ({selectedApiSchool.region})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSelect();
                    setSelectedApiSchool(null);
                    setNewName('');
                  }}
                  className="text-slate-400 hover:text-slate-600 font-normal cursor-pointer text-xs"
                >
                  취소
                </button>
              </div>
            )}

            {/* Custom Theme Colors & Mascot selection (only shows if school is selected) */}
            {selectedApiSchool && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-1"
              >
                {/* Region & Color selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4E5968] mb-1.5">소재지</label>
                    <input
                      type="text"
                      value={newRegion}
                      disabled
                      className="w-full bg-[#E5E8EB]/30 border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-xs text-slate-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4E5968] mb-1.5">시그니처 컬러</label>
                    <div className="flex gap-1.5 pt-1.5">
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

                {/* Mascot selection */}
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
              </motion.div>
            )}

            {/* Done button */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={!selectedApiSchool}
              className="w-full bg-[#3182F6] hover:bg-[#1b64da] disabled:opacity-40 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              {selectedApiSchool ? `🎉 ${newName} 대표로 등교하기` : '🏫 먼저 검색으로 학교를 선택해 주세요'}
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
