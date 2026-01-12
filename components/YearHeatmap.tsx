import React from 'react';
import { DayColor } from '../types';

interface YearHeatmapProps {
  year: number;
  colors: Record<string, DayColor>;
  onSelectDate: (date: Date) => void;
}

export const YearHeatmap: React.FC<YearHeatmapProps> = ({ year, colors, onSelectDate }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {months.map(month => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayDow = new Date(year, month, 1).getDay();
        
        return (
          <div key={month} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
              {new Date(year, month).toLocaleString('default', { month: 'long' })}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {/* Placeholders */}
              {Array.from({ length: firstDayDow }).map((_, i) => (
                <div key={`empty-${month}-${i}`} className="aspect-square" />
              ))}
              {/* Days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const dateKey = date.toISOString().split('T')[0];
                const colorData = colors[dateKey];
                
                // Calculate grid position for tooltip alignment
                // The index in the grid is firstDayDow + i
                const gridIndex = firstDayDow + i;
                const colIndex = gridIndex % 7;
                
                let tooltipClasses = "left-1/2 -translate-x-1/2";
                let arrowClasses = "left-1/2 -translate-x-1/2";
                
                // Adjust alignment for edge columns to prevent overflow
                if (colIndex === 0 || colIndex === 1) {
                     tooltipClasses = "left-0 translate-x-[-10%]"; 
                     arrowClasses = "left-3";
                } else if (colIndex === 5 || colIndex === 6) {
                     tooltipClasses = "right-0 translate-x-[10%]";
                     arrowClasses = "right-3";
                }

                const textColorClass = colorData 
                  ? (isLight(colorData.hex) ? 'text-slate-900/80' : 'text-white/90')
                  : 'text-slate-300';

                return (
                  <button
                    key={dateKey}
                    onClick={() => onSelectDate(date)}
                    className={`
                      group relative aspect-square rounded-md flex items-center justify-center transition-all duration-200
                      hover:z-30 hover:scale-125 hover:shadow-md
                      ${!colorData ? 'bg-slate-100' : ''}
                    `}
                    style={colorData ? { backgroundColor: colorData.hex } : {}}
                  >
                    <span className={`text-[10px] font-bold leading-none ${textColorClass}`}>
                      {day}
                    </span>

                    {/* Fly-out Detail Card */}
                    {colorData && (
                      <div 
                          className={`
                              absolute bottom-full mb-2 w-48 p-3 rounded-xl shadow-xl bg-white 
                              border border-slate-100 text-left pointer-events-none opacity-0 group-hover:opacity-100 
                              translate-y-2 group-hover:translate-y-0 transition-all duration-200 ease-out z-50
                              flex flex-col gap-1 ${tooltipClasses}
                          `}
                      >
                          {/* Header */}
                          <div className="flex justify-between items-center w-full text-[10px] text-slate-400 font-medium uppercase tracking-wider border-b border-slate-100 pb-1">
                              <span>{date.toLocaleString('default', { month: 'short', day: 'numeric' })}</span>
                              <span className="font-mono bg-slate-50 px-1 rounded">{colorData.hex}</span>
                          </div>
                          
                          {/* Color Name */}
                          <h4 className="text-slate-800 font-serif font-bold text-sm leading-tight mt-1">
                              {colorData.name}
                          </h4>
                          
                          {/* Description */}
                          <p className="text-slate-500 text-[10px] leading-snug line-clamp-3">
                              {colorData.description}
                          </p>

                          {/* Arrow Pointer */}
                          <div className={`absolute -bottom-1.5 w-3 h-3 bg-white border-b border-r border-slate-100 transform rotate-45 ${arrowClasses}`}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};