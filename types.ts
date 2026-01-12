export interface DayColor {
  date: string; // ISO format YYYY-MM-DD
  hex: string;
  name: string;
  description: string;
}

export type ViewMode = 'day' | 'week' | 'month' | 'year';

export interface ColorState {
  [date: string]: DayColor;
}

export interface GenerationStatus {
  [monthKey: string]: 'idle' | 'loading' | 'success' | 'error'; // monthKey format: "2026-01"
}
