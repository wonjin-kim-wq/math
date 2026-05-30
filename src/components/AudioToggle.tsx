import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, getMuteState, playSelect } from './SoundEffects';

export default function AudioToggle() {
  const [muted, setMuted] = useState(getMuteState());

  const handleToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    playSelect();
  };

  return (
    <button
      id="btn-sound-toggle"
      onClick={handleToggle}
      className={`p-2.5 rounded-full border border-gray-100 shadow-sm transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
        muted
          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-200'
          : 'bg-[#EEf2FF] text-indigo-600 hover:bg-indigo-150 border-indigo-200'
      }`}
      title={muted ? '소리 켜기' : '소리 끄기'}
    >
      {muted ? (
        <VolumeX className="w-5 h-5 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
