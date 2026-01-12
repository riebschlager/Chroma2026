import React from 'react';
import { DayColor } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  colors: Record<string, DayColor>;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ year, month, colors, onSelectDate, selectedDate }) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const days = [];
  // Add empty placeholders for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="grid grid-cols-7 mb-4">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;

          const dateKey = date.toISOString().split('T')[0];
          const colorData = colors[dateKey];
          const isSelected = selectedDate.toISOString().split('T')[0] === dateKey;
          
          const colIndex = idx % 7;
          let tooltipClasses = "left-1/2 -translate-x-1/2";
          let arrowClasses = "left-1/2 -translate-x-1/2";
          
          // Adjust alignment for edge columns to prevent overflow
          if (colIndex === 0) {
              tooltipClasses = "left-0 translate-x-[-10%]"; // Slight offset to align nicely
              arrowClasses = "left-6";
          } else if (colIndex === 6) {
              tooltipClasses = "right-0 translate-x-[10%]";
              arrowClasses = "right-6";
          }

          // Determine text color based on background brightness
          const textColorClass = colorData 
            ? (isLight(colorData.hex) ? 'text-slate-900/80' : 'text-white/90')
            : 'text-slate-300';

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(date)}
              className={`
                group relative aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200
                ${isSelected ? 'ring-2 ring-offset-2 ring-slate-900 z-20 scale-110 shadow-lg' : 'hover:z-30 hover:scale-105'}
                ${!colorData ? 'bg-slate-100' : ''}
              `}
              style={colorData ? { backgroundColor: colorData.hex } : {}}
            >
              <span className={`font-bold text-lg sm:text-2xl ${textColorClass} ${colorData ? 'drop-shadow-sm' : ''}`}>
                {date.getDate()}
              </span>

              {/* Fly-out Detail Card */}
              {colorData && (
                <div 
                    className={`
                        absolute bottom-full mb-3 w-56 p-4 rounded-xl shadow-2xl bg-white 
                        border border-slate-100 text-left pointer-events-none opacity-0 group-hover:opacity-100 
                        translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out z-50
                        flex flex-col gap-2 ${tooltipClasses}
                    `}
                >
                    {/* Header: Date & Hex */}
                    <div className="flex justify-between items-center w-full text-xs text-slate-400 font-medium uppercase tracking-wider border-b border-slate-100 pb-2">
                        <span>{date.toLocaleString('default', { month: 'short', day: 'numeric' })}</span>
                        <span className="font-mono bg-slate-50 px-1 rounded">{colorData.hex}</span>
                    </div>
                    
                    {/* Color Name */}
                    <h4 className="text-slate-800 font-serif font-bold text-xl leading-tight">
                        {colorData.name}
                    </h4>
                    
                    {/* Description */}
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {colorData.description}
                    </p>

                    {/* Arrow Pointer */}
                    <div className={`absolute -bottom-2 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45 ${arrowClasses}`}></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};