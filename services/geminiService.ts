import { GoogleGenAI, Type } from "@google/genai";
import { DayColor } from "../types";
import { SEED_DATA } from "../data/seed";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const STORAGE_KEY = 'chroma_colors_2026';

// Helper to get local storage data
const getStoredColors = (): Record<string, DayColor> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to read from localStorage", e);
    return {};
  }
};

// Helper to save to local storage
const saveColorsToStorage = (newColors: DayColor[]) => {
  try {
    const current = getStoredColors();
    const updated = { ...current };
    newColors.forEach(c => updated[c.date] = c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

export const getStoredAndSeedColors = (): Record<string, DayColor> => {
  const stored = getStoredColors();
  // Merge stored over seed (though seed is constant, this structure allows user overrides if we ever add editing)
  return { ...SEED_DATA, ...stored };
};

export const generateMonthColors = async (year: number, month: number): Promise<DayColor[]> => {
  // Month is 0-indexed (0 = Jan, 11 = Dec)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');
  
  // 1. Check if we already have ALL days for this month in Seed or Storage
  const currentData = getStoredAndSeedColors();
  const missingDays = [];
  const existingColors: DayColor[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    if (currentData[dateKey]) {
      existingColors.push(currentData[dateKey]);
    } else {
      missingDays.push(d);
    }
  }

  // If we have data for every day, return it immediately without API call
  if (missingDays.length === 0) {
    return existingColors;
  }

  // 2. If missing days, call API
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  const prompt = `
    Generate a creative color palette for ${monthName} ${year}. 
    I need a JSON entry for every single day of the month (from day 1 to ${daysInMonth}).
    For each day, assign a unique and meaningful HEX color code.
    The color should relate to the specific date's meaning, considering:
    - Seasonality (Northern Hemisphere)
    - International Holidays or Observances
    - Historical Events
    - General "Vibe" or abstract feeling of that part of the month.
    
    Ensure the hex codes vary enough to be interesting but cohesive as a month.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER, description: "The day of the month (1-31)" },
              hex: { type: Type.STRING, description: "The hex color code (e.g., #FF5733)" },
              name: { type: Type.STRING, description: "A creative name for this color" },
              description: { type: Type.STRING, description: "A short, one-sentence explanation of why this color fits this specific date." }
            },
            required: ["day", "hex", "name", "description"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');

    // Map the response to our internal format
    const newColors: DayColor[] = data.map((item: any) => {
      const dayStr = String(item.day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      return {
        date: dateKey,
        hex: item.hex,
        name: item.name,
        description: item.description
      };
    });

    // 3. Persist new colors to localStorage
    saveColorsToStorage(newColors);

    // Return combination of what we had + what we just fetched
    // (Though usually we just return the fetched set for the caller to merge, 
    // the caller in App.tsx handles merging into state)
    return newColors;

  } catch (error) {
    console.error("Failed to generate colors for month:", error);
    return [];
  }
};
