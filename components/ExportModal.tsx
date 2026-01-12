import React, { useEffect, useRef, useState } from 'react';
import { DayColor, ViewMode } from '../types';
import { X, Download, Loader2, Image as ImageIcon, RefreshCcw, Smartphone, Monitor } from 'lucide-react';
import { DAYS_OF_WEEK, MONTHS, FALLBACK_COLOR } from '../constants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  currentDate: Date;
  colors: Record<string, DayColor>;
}

type Format = 'story' | 'landscape';

const FORMATS = {
    story: { width: 1080, height: 1920, label: 'Story (9:16)' },
    landscape: { width: 1920, height: 1080, label: 'Landscape (16:9)' }
};

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, viewMode, currentDate, colors }) => {
  const [format, setFormat] = useState<Format>('story');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, viewMode, currentDate, format]);

  const generateImage = async () => {
    setIsGenerating(true);
    // Wait for fonts to be ready
    await document.fonts.ready;

    const { width, height } = FORMATS[format];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Route to specific drawer
    switch (viewMode) {
      case 'day':
        drawDayView(ctx, currentDate, colors, width, height);
        break;
      case 'week':
        drawWeekView(ctx, currentDate, colors, width, height);
        break;
      case 'month':
        drawMonthView(ctx, currentDate, colors, width, height);
        break;
      case 'year':
        drawYearView(ctx, currentDate, colors, width, height);
        break;
    }

    // Set preview
    setPreviewUrl(canvas.toDataURL('image/png'));
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    const filename = `chroma_2026_${viewMode}_${format}_${currentDate.toISOString().split('T')[0]}.png`;
    link.download = filename;
    link.href = previewUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-slate-100 z-10 bg-white gap-4">
          <div className="flex items-center space-x-3 text-slate-800">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Share Your Colors</h3>
              <p className="text-sm text-slate-500">Create a lasting memory</p>
            </div>
          </div>

          {/* Format Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
                onClick={() => setFormat('story')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === 'story' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Smartphone className="w-4 h-4" />
                <span>Story (9:16)</span>
            </button>
            <button
                onClick={() => setFormat('landscape')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === 'landscape' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Monitor className="w-4 h-4" />
                <span>Landscape (16:9)</span>
            </button>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-grow overflow-auto bg-slate-100/50 p-8 flex justify-center items-center relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
            
            {isGenerating || !previewUrl ? (
              <div className="flex flex-col items-center text-slate-400 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="font-medium">Painting Canvas...</span>
              </div>
            ) : (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className={`
                    shadow-2xl ring-1 ring-black/5 rounded-lg transition-all duration-300
                    ${format === 'story' ? 'h-full w-auto' : 'w-full max-w-4xl h-auto'}
                `}
              />
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center z-10">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
             <RefreshCcw className="w-4 h-4" />
             <span>{FORMATS[format].width} x {FORMATS[format].height}px</span>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button 
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
                Close
            </button>
            <button 
                onClick={handleDownload}
                disabled={isGenerating || !previewUrl}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
                <Download className="w-5 h-5" />
                <span>Save Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- DRAWING HELPERS --- */

const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#ffffff'; // slate-900 : white
};

const getSemiTransparentBg = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)';
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
  ctx.fill();
}

/* --- VIEW DRAWERS --- */

const drawDayView = (ctx: CanvasRenderingContext2D, date: Date, colors: Record<string, DayColor>, width: number, height: number) => {
    const dateKey = date.toISOString().split('T')[0];
    const data = colors[dateKey] || { ...FALLBACK_COLOR, date: dateKey };
    const isLandscape = width > height;
    
    if (isLandscape) {
        // --- LANDSCAPE LAYOUT ---
        // Left Side: Color
        const midX = width / 2;
        ctx.fillStyle = data.hex;
        ctx.fillRect(0, 0, midX, height);
        
        // Right Side: White
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX, 0, midX, height);
        
        const fgLeft = getContrastColor(data.hex);
        const fgRight = '#0f172a'; // Slate 900
        
        // Left Content: Date
        ctx.fillStyle = fgLeft;
        ctx.textAlign = 'center';
        
        ctx.font = '500 60px "Inter", sans-serif';
        ctx.globalAlpha = 0.8;
        ctx.fillText(date.toLocaleString('default', { month: 'long' }).toUpperCase(), midX / 2, height/2 - 150);
        
        ctx.font = '700 350px "Playfair Display", serif';
        ctx.globalAlpha = 1;
        ctx.fillText(date.getDate().toString(), midX / 2, height/2 + 100);
        
        // Right Content: Details
        const pad = 120;
        const startX = midX + pad;
        const contentWidth = midX - (pad * 2);
        const startY = 300;
        
        ctx.fillStyle = fgRight;
        ctx.textAlign = 'left';
        
        ctx.font = '400 40px "Inter", monospace';
        ctx.globalAlpha = 0.5;
        ctx.fillText(data.hex, startX, startY);
        
        ctx.globalAlpha = 1;
        ctx.font = '700 90px "Playfair Display", serif';
        wrapText(ctx, data.name, startX, startY + 120, contentWidth, 100);
        
        ctx.globalAlpha = 0.8;
        ctx.font = '300 40px "Inter", sans-serif';
        wrapText(ctx, data.description, startX, startY + 350, contentWidth, 60);
        
        // Footer (Right side)
        ctx.globalAlpha = 0.4;
        ctx.font = '700 24px "Inter", sans-serif';
        ctx.fillText(`${date.getFullYear()} • CHROMA CALENDAR`, startX, height - 100);

    } else {
        // --- STORY LAYOUT (Original) ---
        const fg = getContrastColor(data.hex);
        ctx.fillStyle = data.hex;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = fg;
        ctx.textAlign = 'center';
        
        ctx.font = '500 80px "Inter", sans-serif'; 
        ctx.globalAlpha = 0.8;
        ctx.fillText(date.toLocaleString('default', { month: 'long' }).toUpperCase(), width / 2, 400);
        
        ctx.font = '700 450px "Playfair Display", serif';
        ctx.globalAlpha = 1;
        ctx.fillText(date.getDate().toString(), width / 2, 800);
        
        ctx.font = '300 60px "Inter", sans-serif';
        ctx.globalAlpha = 0.6;
        ctx.fillText(date.toLocaleString('default', { weekday: 'long' }).toUpperCase(), width / 2, 920);

        const cardY = 1100;
        const padding = 100;
        ctx.fillStyle = getSemiTransparentBg(data.hex);
        ctx.fillRect(0, cardY - 50, width, height - (cardY - 50));

        ctx.fillStyle = fg;
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;

        ctx.font = '400 40px "Inter", monospace';
        ctx.globalAlpha = 0.6;
        ctx.fillText(data.hex, padding, cardY + 60);

        ctx.font = '700 100px "Playfair Display", serif';
        ctx.globalAlpha = 1;
        wrapText(ctx, data.name, padding, cardY + 180, width - (padding * 2), 110);

        ctx.font = '300 50px "Inter", sans-serif';
        ctx.globalAlpha = 0.8;
        wrapText(ctx, data.description, padding, cardY + 450, width - (padding * 2), 70);

        ctx.fillStyle = fg;
        ctx.globalAlpha = 0.4;
        ctx.font = '600 30px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${date.getFullYear()} • CHROMA CALENDAR`, width / 2, height - 80);
    }
};

const drawWeekView = (ctx: CanvasRenderingContext2D, date: Date, colors: Record<string, DayColor>, width: number, height: number) => {
    const isLandscape = width > height;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    if (isLandscape) {
        // --- LANDSCAPE ---
        // 7 Vertical Columns
        const colWidth = width / 7;
        
        for(let i=0; i<7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const k = d.toISOString().split('T')[0];
            const c = colors[k] || FALLBACK_COLOR;
            
            const x = i * colWidth;
            
            ctx.fillStyle = c.hex;
            ctx.fillRect(x, 0, colWidth, height);
            
            const fg = getContrastColor(c.hex);
            
            // Info Container (Bottom)
            ctx.fillStyle = getSemiTransparentBg(c.hex);
            ctx.fillRect(x, height - 400, colWidth, 400);
            
            // Text
            ctx.fillStyle = fg;
            ctx.textAlign = 'center';
            
            // Top Date
            ctx.font = '700 30px "Inter", sans-serif';
            ctx.globalAlpha = 0.6;
            ctx.fillText(d.toLocaleString('default', {weekday:'short'}).toUpperCase(), x + colWidth/2, 100);
            
            ctx.font = '700 120px "Playfair Display", serif';
            ctx.globalAlpha = 1;
            ctx.fillText(d.getDate().toString(), x + colWidth/2, 220);
            
            // Bottom Info
            ctx.textAlign = 'left';
            const pad = 30;
            const textX = x + pad;
            const textW = colWidth - (pad*2);
            
            ctx.font = '700 36px "Inter", sans-serif';
            wrapText(ctx, c.name, textX, height - 320, textW, 45);
            
            ctx.font = '400 20px "Inter", monospace';
            ctx.globalAlpha = 0.6;
            ctx.fillText(c.hex, textX, height - 60);
            
            // Global Footer overlay on last col
            if (i === 6) {
                ctx.save();
                ctx.translate(width - 40, height/2);
                ctx.rotate(-Math.PI/2);
                ctx.textAlign = 'center';
                ctx.font = '700 20px "Inter", sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.8;
                ctx.shadowColor="black";
                ctx.shadowBlur=4;
                ctx.fillText("CHROMA2026 WEEKLY", 0, 0);
                ctx.restore();
            }
        }
    } else {
        // --- STORY (Portrait) ---
        // White Bg
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.font = '700 80px "Playfair Display", serif';
        ctx.fillText("Weekly Palette", 80, 150);
        
        ctx.font = '400 36px "Inter", sans-serif';
        ctx.fillStyle = '#64748b';
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const dateRange = `${startOfWeek.toLocaleString('default', {month:'long', day:'numeric'})} — ${endOfWeek.toLocaleString('default', {month:'long', day:'numeric'})}`;
        ctx.fillText(dateRange, 80, 210);

        const startY = 300;
        const rowHeight = (height - startY - 100) / 7;

        for(let i=0; i<7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const k = d.toISOString().split('T')[0];
            const c = colors[k] || FALLBACK_COLOR;
            
            const y = startY + (i * rowHeight);
            
            ctx.fillStyle = c.hex;
            ctx.fillRect(0, y, width, rowHeight);
            const fg = getContrastColor(c.hex);
            
            ctx.fillStyle = getSemiTransparentBg(c.hex);
            ctx.fillRect(0, y, 280, rowHeight);

            ctx.fillStyle = fg;
            ctx.textAlign = 'center';
            ctx.font = '700 24px "Inter", sans-serif';
            ctx.globalAlpha = 0.6;
            ctx.fillText(d.toLocaleString('default', {weekday:'short'}).toUpperCase(), 140, y + (rowHeight/2) - 15);
            
            ctx.font = '700 60px "Playfair Display", serif';
            ctx.globalAlpha = 1;
            ctx.fillText(d.getDate().toString(), 140, y + (rowHeight/2) + 45);

            ctx.textAlign = 'left';
            ctx.font = '700 48px "Inter", sans-serif';
            ctx.fillText(c.name, 340, y + (rowHeight/2) + 10);
            
            ctx.font = '400 24px "Inter", monospace';
            ctx.globalAlpha = 0.6;
            ctx.fillText(c.hex, 340, y + (rowHeight/2) + 50);
            ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.font = '700 24px "Inter", sans-serif';
        ctx.fillText("CHROMA2026", width/2, height - 40);
    }
};

const drawMonthView = (ctx: CanvasRenderingContext2D, date: Date, colors: Record<string, DayColor>, width: number, height: number) => {
    const isLandscape = width > height;
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    if (isLandscape) {
        // --- LANDSCAPE ---
        // Left Panel (30%)
        const panelW = width * 0.25;
        ctx.fillStyle = '#0f172a'; // Dark slate
        ctx.fillRect(0, 0, panelW, height);
        
        // Right Panel (Grid)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(panelW, 0, width - panelW, height);

        // Sidebar Text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 40px "Inter", sans-serif';
        ctx.fillText(year.toString(), 60, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 120px "Playfair Display", serif';
        wrapText(ctx, MONTHS[month], 60, 240, panelW - 80, 130);

        ctx.fillStyle = '#475569';
        ctx.font = '700 24px "Inter", sans-serif';
        ctx.fillText("CHROMA2026", 60, height - 60);

        // Grid
        const gridX = panelW + 60;
        const gridY = 150;
        const gridW = width - panelW - 120;
        const gap = 15;
        const cols = 7;
        const colWidth = (gridW - (gap * (cols - 1))) / cols;
        const cellHeight = colWidth * 0.8; // Squatter for landscape fitting

        const totalSlots = firstDay + daysInMonth;

        // Weekday Headers
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.font = '700 20px "Inter", sans-serif';
        DAYS_OF_WEEK.forEach((d, i) => {
            const x = gridX + (i * (colWidth + gap)) + (colWidth/2);
            ctx.fillText(d.toUpperCase(), x, gridY - 30);
        });

        for (let i = 0; i < totalSlots; i++) {
            if (i < firstDay) continue;
            const dayNum = i - firstDay + 1;
            const col = i % 7;
            const row = Math.floor(i / 7);
            
            const x = gridX + (col * (colWidth + gap));
            const y = gridY + (row * (cellHeight + gap));
            const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const c = colors[k];
            
            ctx.fillStyle = c ? c.hex : '#f1f5f9';
            roundRect(ctx, x, y, colWidth, cellHeight, 8);
            
            const fg = c ? getContrastColor(c.hex) : '#cbd5e1';
            ctx.fillStyle = fg;
            ctx.font = '700 30px "Inter", sans-serif';
            ctx.fillText(dayNum.toString(), x + colWidth/2, y + cellHeight/2 + 10);
        }

    } else {
        // --- STORY (Portrait) ---
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(0, 0, width, height);
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 40px "Inter", sans-serif';
        ctx.fillText(year.toString(), width/2, 120);

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 140px "Playfair Display", serif';
        ctx.fillText(MONTHS[month], width/2, 260);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(width/2 - 50, 300, 100, 4);

        const gridTop = 400;
        const margin = 60;
        const gap = 20;
        const cols = 7;
        const colWidth = (width - (margin*2) - (gap * (cols-1))) / cols;
        const cellHeight = colWidth * 1.3;
        const totalSlots = firstDay + daysInMonth;

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 24px "Inter", sans-serif';
        DAYS_OF_WEEK.forEach((d, i) => {
            const x = margin + (i * (colWidth + gap)) + (colWidth/2);
            ctx.fillText(d.charAt(0), x, gridTop - 30);
        });

        for (let i = 0; i < totalSlots; i++) {
            if (i < firstDay) continue;
            const dayNum = i - firstDay + 1;
            const col = i % 7;
            const row = Math.floor(i / 7);
            
            const x = margin + (col * (colWidth + gap));
            const y = gridTop + (row * (cellHeight + gap));
            const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const c = colors[k];
            
            ctx.fillStyle = c ? c.hex : '#f1f5f9';
            roundRect(ctx, x, y, colWidth, cellHeight, 16);

            const fg = c ? getContrastColor(c.hex) : '#94a3b8';
            ctx.fillStyle = fg;
            ctx.font = '700 36px "Inter", sans-serif';
            ctx.fillText(dayNum.toString(), x + colWidth/2, y + cellHeight/2 + 10);
        }
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 30px "Playfair Display", serif';
        ctx.fillText("Monthly Palette", width/2 - 100, height - 80);
        
        ctx.font = '700 24px "Inter", sans-serif';
        ctx.fillText("CHROMA2026", width/2 + 120, height - 80);
    }
};

const drawYearView = (ctx: CanvasRenderingContext2D, date: Date, colors: Record<string, DayColor>, width: number, height: number) => {
    const isLandscape = width > height;
    const year = date.getFullYear();

    // Bg
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    if (isLandscape) {
        // --- LANDSCAPE ---
        // Header Bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, 140);
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 80px "Playfair Display", serif';
        ctx.fillText(`${year}`, 60, 100);
        
        ctx.font = '300 30px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("A YEAR IN COLOR", 280, 95);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 30px "Inter", sans-serif';
        ctx.fillText("CHROMA2026", width - 60, 95);

        // Grid 4 Cols x 3 Rows
        const margin = 60;
        const gridW = width - (margin*2);
        const gridH = height - 200;
        const startY = 180;
        
        const mCols = 4;
        const mGapX = 60;
        const mGapY = 40;
        const monthWidth = (gridW - (mGapX * (mCols - 1))) / mCols;

        // Mini day grid
        const dayGap = 2;
        const daySize = (monthWidth - (dayGap * 6)) / 7;

        MONTHS.forEach((mName, mIdx) => {
            const row = Math.floor(mIdx / mCols);
            const col = mIdx % mCols;
            
            const mx = margin + (col * (monthWidth + mGapX));
            const my = startY + (row * ((daySize * 6) + 100));

            ctx.textAlign = 'left';
            ctx.fillStyle = '#334155';
            ctx.font = '700 20px "Inter", sans-serif';
            ctx.fillText(mName.toUpperCase(), mx, my - 15);

            const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
            const startDay = new Date(year, mIdx, 1).getDay();

            for(let i=0; i<daysInMonth + startDay; i++) {
                 if (i < startDay) continue;
                 const dayNum = i - startDay + 1;
                 
                 const dCol = i % 7;
                 const dRow = Math.floor(i / 7);
                 
                 const dx = mx + (dCol * (daySize + dayGap));
                 const dy = my + (dRow * (daySize + dayGap));
                 const k = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                 const c = colors[k];
                 
                 ctx.fillStyle = c ? c.hex : '#e2e8f0';
                 ctx.fillRect(dx, dy, daySize, daySize);
            }
        });

    } else {
        // --- STORY (Portrait) ---
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 180px "Playfair Display", serif';
        ctx.fillText(year.toString(), 80, 200);

        ctx.fillStyle = '#64748b';
        ctx.font = '300 40px "Inter", sans-serif';
        ctx.fillText("A Year in Color", 80, 260);

        ctx.textAlign = 'right';
        ctx.font = '700 60px "Inter", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText("365", width - 80, 200);
        ctx.font = '300 24px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("DAYS", width - 80, 240);

        const margin = 80;
        const monthGapX = 60;
        const monthWidth = (width - (margin*2) - (monthGapX * 2)) / 3;
        const dayGap = 3;
        const daySize = (monthWidth - (dayGap * 6)) / 7;
        const startY = 350;

        MONTHS.forEach((mName, mIdx) => {
            const row = Math.floor(mIdx / 3);
            const col = mIdx % 3;
            const monthX = margin + (col * (monthWidth + monthGapX));
            const monthY = startY + (row * ((daySize * 6) + 120));

            ctx.textAlign = 'left';
            ctx.fillStyle = '#334155';
            ctx.font = '700 24px "Inter", sans-serif';
            ctx.fillText(mName.toUpperCase().substring(0,3), monthX, monthY - 20);

            const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
            const startDay = new Date(year, mIdx, 1).getDay();

            for(let i=0; i<daysInMonth + startDay; i++) {
                 if (i < startDay) continue;
                 const dayNum = i - startDay + 1;
                 const dCol = i % 7;
                 const dRow = Math.floor(i / 7);
                 
                 const dx = monthX + (dCol * (daySize + dayGap));
                 const dy = monthY + (dRow * (daySize + dayGap));
                 const k = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                 const c = colors[k];
                 
                 ctx.fillStyle = c ? c.hex : '#e2e8f0';
                 ctx.fillRect(dx, dy, daySize, daySize);
            }
        });

        ctx.textAlign = 'center';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(width/2 - 60, height - 100, 120, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 30px "Inter", sans-serif';
        ctx.fillText("CHROMA2026", width/2, height - 50);
    }
};