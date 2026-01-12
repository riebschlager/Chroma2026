import React from 'react';
import { DayColor } from '../types';
import { FALLBACK_COLOR } from '../constants';
import { Copy, Calendar } from 'lucide-react';

interface ColorDetailCardProps {
  date: Date;
  data?: DayColor;
  isLoading?: boolean;
  immersive?: boolean;
}

export const ColorDetailCard: React.FC<ColorDetailCardProps> = ({ date, data, isLoading, immersive = false }) => {
  const displayData = data || { ...FALLBACK_COLOR, date: date.toISOString().split('T')[0] };
  
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyHex = () => {
    navigator.clipboard.writeText(displayData.hex);
    // Could add a toast here in a full app
  };

  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
  };

  const textColorClass = isLight(displayData.hex) ? 'text-slate-900' : 'text-white';
  const subTextColorClass = isLight(displayData.hex) ? 'text-slate-700' : 'text-slate-200';
  const borderClass = isLight(displayData.hex) ? 'border-slate-900/10' : 'border-white/20';

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-3xl bg-slate-200 animate-pulse flex items-center justify-center">
        <span className="text-slate-400 font-medium">Divining Colors...</span>
      </div>
    );
  }

  return (
    <div 
      className={`
        group relative w-full max-w-md mx-auto overflow-hidden transition-all duration-500
        ${immersive ? 'rounded-none shadow-none transform-none' : 'rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1'}
      `}
    >
      {/* Background Color Block - Only visible if NOT immersive (since App handles bg in immersive mode) */}
      {!immersive && (
        <div 
          className="absolute inset-0 transition-colors duration-700 ease-in-out"
          style={{ backgroundColor: displayData.hex }}
        />
      )}

      {/* Content Container */}
      <div className={`relative h-full flex flex-col justify-between p-8 ${textColorClass}`}>
        
        {/* Header */}
        <div className="flex justify-between items-start opacity-90">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 opacity-75" />
            <span className="font-semibold tracking-wide uppercase text-sm">{date.getFullYear()}</span>
          </div>
          <button 
            onClick={handleCopyHex}
            className={`p-2 rounded-full backdrop-blur-md transition-colors border ${isLight(displayData.hex) ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
            title="Copy HEX"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center text-center space-y-4 my-12">
          <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tight opacity-90 leading-none drop-shadow-sm">
            {date.getDate()}
          </h2>
          <span className="text-xl font-light uppercase tracking-widest opacity-80">
            {date.toLocaleString('default', { month: 'long' })}
          </span>
        </div>

        {/* Footer Content */}
        <div className={`space-y-4 backdrop-blur-xl rounded-2xl p-6 border ${isLight(displayData.hex) ? 'bg-white/30 border-white/40' : 'bg-black/10 border-white/10'}`}>
          <div>
            <h3 className={`text-2xl font-serif font-bold mb-1 ${textColorClass}`}>{displayData.name}</h3>
            <p className={`font-mono text-sm opacity-60 uppercase tracking-wider mb-3`}>{displayData.hex}</p>
            <p className={`text-lg leading-relaxed ${subTextColorClass}`}>
              {displayData.description}
            </p>
          </div>
          
          <div className={`pt-2 border-t flex justify-between items-center opacity-70 text-sm font-medium ${borderClass}`}>
             <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};