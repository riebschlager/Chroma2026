import React from 'react';
import { DayColor } from '../types';
import { FALLBACK_COLOR } from '../constants';
import { ChevronRight } from 'lucide-react';

interface WeekStripProps {
  startDate: Date;
  colors: Record<string, DayColor>;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export const WeekStrip: React.FC<WeekStripProps> = ({ startDate, colors, onSelectDate, selectedDate }) => {
  // Generate 7 days starting from startDate
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 px-1">
      <div className="flex space-x-4 min-w-max md:min-w-0 md:justify-center">
        {days.map((date) => {
          const dateKey = date.toISOString().split('T')[0];
          const data = colors[dateKey] || { ...FALLBACK_COLOR, hex: '#f1f5f9' };
          const isSelected = selectedDate.toISOString().split('T')[0] === dateKey;
          
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(date)}
              className={`
                group relative flex flex-col items-center justify-end w-20 h-32 rounded-2xl transition-all duration-300
                ${isSelected ? 'ring-4 ring-offset-2 ring-slate-900 scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'}
              `}
            >
              <div 
                className="absolute inset-0 rounded-2xl transition-all duration-300"
                style={{ backgroundColor: data.hex }}
              />
              
              {/* Overlay for legibility */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent rounded-b-2xl" />

              <div className="relative z-10 p-3 text-white text-center">
                <span className="text-xs font-medium uppercase tracking-wider block opacity-90">
                  {date.toLocaleString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-2xl font-serif font-bold block">
                  {date.getDate()}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute -bottom-2 bg-slate-900 text-white rounded-full p-0.5 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
