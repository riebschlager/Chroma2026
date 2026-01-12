import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, DayColor, GenerationStatus } from './types';
import { generateMonthColors, getStoredAndSeedColors } from './services/geminiService';
import { ColorDetailCard } from './components/ColorDetailCard';
import { WeekStrip } from './components/WeekStrip';
import { MonthGrid } from './components/MonthGrid';
import { YearHeatmap } from './components/YearHeatmap';
import { ExportModal } from './components/ExportModal';
import { Palette, ChevronLeft, ChevronRight, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { formatDateKey } from './utils';

const App: React.FC = () => {
  // Constants
  const TARGET_YEAR = 2026;
  
  // State
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    if (today.getFullYear() === TARGET_YEAR) return today;
    return new Date(TARGET_YEAR, 0, 1);
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Initialize colors from Seed + LocalStorage immediately
  const [colors, setColors] = useState<Record<string, DayColor>>(() => getStoredAndSeedColors());
  
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({});

  // Derived State
  const currentDateKey = formatDateKey(currentDate);
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const activeColorData = colors[currentDateKey];
  const isDayView = viewMode === 'day';

  // Contrast Logic
  const isLight = (hex: string) => {
    if (!hex) return true; // Default to light background behavior
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
  };

  // Determine App Background & Text Theme
  // Only use the color background in Day View. Otherwise keep it clean slate.
  const appBgColor = isDayView && activeColorData ? activeColorData.hex : '#f8fafc'; // slate-50
  const isBgLight = isLight(appBgColor);
  
  // Dynamic UI classes based on contrast
  const themeText = isBgLight ? 'text-slate-900' : 'text-white';
  const themeSubText = isBgLight ? 'text-slate-500' : 'text-white/70';
  const navBgClass = isDayView 
    ? (isBgLight ? 'bg-white/60 border-slate-200/50' : 'bg-black/10 border-white/10') 
    : 'bg-white/80 border-slate-200';
  const navButtonClass = isDayView
    ? (isBgLight ? 'text-slate-600 hover:bg-slate-200/50' : 'text-white/80 hover:bg-white/20')
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50';
  const navButtonActive = isDayView
    ? (isBgLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white shadow-sm backdrop-blur-md')
    : 'bg-white text-slate-900 shadow-sm';

  // Helper to check if we need to fetch data for a specific month
  const checkAndFetchMonth = useCallback(async (year: number, month: number) => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Check if we already have data for this month in the state (which includes seed/storage)
    let hasAllDays = true;
    for(let d=1; d<=daysInMonth; d++) {
        // Use local manual construction to match service logic
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(!colors[dateKey]) {
            hasAllDays = false;
            break;
        }
    }

    // If we have data, mark as success and return
    if (hasAllDays) {
        if (generationStatus[monthKey] !== 'success') {
            setGenerationStatus(prev => ({ ...prev, [monthKey]: 'success' }));
        }
        return;
    }
    
    // Avoid double fetching
    if (generationStatus[monthKey] === 'loading' || generationStatus[monthKey] === 'success') {
      return;
    }

    setGenerationStatus(prev => ({ ...prev, [monthKey]: 'loading' }));

    const newColors = await generateMonthColors(year, month);
    
    if (newColors.length > 0) {
      setColors(prev => {
        const updated = { ...prev };
        newColors.forEach(c => updated[c.date] = c);
        return updated;
      });
      setGenerationStatus(prev => ({ ...prev, [monthKey]: 'success' }));
    } else {
      setGenerationStatus(prev => ({ ...prev, [monthKey]: 'error' }));
    }
  }, [colors, generationStatus]);

  // Initial Fetch for current month on load
  useEffect(() => {
    checkAndFetchMonth(currentDate.getFullYear(), currentDate.getMonth());
    // Also fetch next month for smoother week transitions if near end of month
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (nextMonthDate.getFullYear() === TARGET_YEAR) {
        checkAndFetchMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // Fetch all for Year View (lazy-ish)
  useEffect(() => {
    if (viewMode === 'year') {
      for (let m = 0; m < 12; m++) {
        checkAndFetchMonth(TARGET_YEAR, m);
      }
    }
  }, [viewMode, checkAndFetchMonth]);

  // Navigation Handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() - 7);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    if (newDate.getFullYear() === TARGET_YEAR) setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + 7);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    if (newDate.getFullYear() === TARGET_YEAR) setCurrentDate(newDate);
  };

  const handleExportJson = () => {
    // Sort keys to make the JSON orderly
    const sortedKeys = Object.keys(colors).sort();
    const sortedColors: Record<string, DayColor> = {};
    sortedKeys.forEach(key => {
      sortedColors[key] = colors[key];
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sortedColors, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "chroma_2026_colors.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isLoadingCurrent = generationStatus[currentMonthKey] === 'loading';

  return (
    <div 
      className="min-h-screen flex flex-col transition-[background-color] duration-700 ease-in-out"
      style={{ backgroundColor: appBgColor }}
    >
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        viewMode={viewMode}
        currentDate={currentDate}
        colors={colors}
      />

      {/* Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${navBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg shadow-sm transition-colors duration-500 ${isDayView && !isBgLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
              <Palette className="w-5 h-5" />
            </div>
            <h1 className={`text-xl font-bold tracking-tight hidden sm:block ${themeText}`}>
              Chroma<span className="opacity-50">2026</span>
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <nav className={`flex items-center space-x-1 p-1 rounded-full overflow-x-auto max-w-[200px] sm:max-w-none transition-colors duration-500 ${isDayView && !isBgLight ? 'bg-black/20' : 'bg-slate-100'}`}>
              {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                    ${viewMode === mode ? navButtonActive : navButtonClass}
                  `}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </nav>

            <div className="flex space-x-1">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className={`p-2 rounded-full transition-colors ${navButtonClass}`}
                title="Generate Take-Away Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportJson}
                className={`p-2 rounded-full transition-colors ${navButtonClass}`}
                title="Export Colors JSON"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* Date Navigator (Visible in Day/Week/Month views) */}
        {viewMode !== 'year' && (
          <div className="flex items-center justify-between max-w-sm mx-auto w-full">
            <button 
              onClick={handlePrev} 
              className={`p-2 rounded-full transition-colors ${isDayView ? (isBgLight ? 'hover:bg-slate-200' : 'hover:bg-white/10 text-white') : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className={`text-center ${themeText}`}>
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              {viewMode === 'week' && (
                <p className={`text-xs font-medium uppercase tracking-wide ${themeSubText}`}>
                  Week of {currentDate.getDate()}th
                </p>
              )}
            </div>
            <button 
              onClick={handleNext} 
              className={`p-2 rounded-full transition-colors ${isDayView ? (isBgLight ? 'hover:bg-slate-200' : 'hover:bg-white/10 text-white') : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-grow flex flex-col items-center justify-start min-h-[500px]">
          
          {/* Day View */}
          {viewMode === 'day' && (
            <div className="w-full animate-in fade-in zoom-in duration-500">
               <ColorDetailCard 
                 date={currentDate} 
                 data={activeColorData} 
                 isLoading={isLoadingCurrent && !activeColorData} 
                 immersive={true}
               />
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="w-full flex flex-col items-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <WeekStrip 
                startDate={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay())} // Start from Sunday
                colors={colors}
                onSelectDate={setCurrentDate}
                selectedDate={currentDate}
              />
              <div className="w-full max-w-4xl">
                 <ColorDetailCard 
                   date={currentDate} 
                   data={activeColorData} 
                   isLoading={isLoadingCurrent && !activeColorData} 
                   immersive={false}
                 />
              </div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
              <MonthGrid 
                year={currentDate.getFullYear()} 
                month={currentDate.getMonth()} 
                colors={colors} 
                onSelectDate={(d) => { setCurrentDate(d); setViewMode('day'); }}
                selectedDate={currentDate}
              />
            </div>
          )}

          {/* Year View */}
          {viewMode === 'year' && (
            <div className="w-full animate-in fade-in duration-700">
              <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-3xl font-serif font-bold text-slate-800">2026 Overview</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                   {Object.keys(generationStatus).length > 0 && 
                    Object.values(generationStatus).some(s => s === 'loading') && (
                     <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Discovering new days...</span>
                     </>
                   )}
                </div>
              </div>
              <YearHeatmap 
                year={TARGET_YEAR} 
                colors={colors} 
                onSelectDate={(d) => { setCurrentDate(d); setViewMode('day'); }} 
              />
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-sm transition-colors duration-500 ${isDayView ? (isBgLight ? 'border-slate-200 text-slate-400' : 'border-white/10 text-white/40') : 'border-slate-200 text-slate-400'}`}>
        <p>Made by <a href="http://the816.com">Chris Riebschlager</a></p>
      </footer>
    </div>
  );
};

export default App;