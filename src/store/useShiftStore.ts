import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';

export interface ShiftEntry {
  id: string;
  date: string; // ISO format date string (YYYY-MM-DD)
  shiftType: ShiftType;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  hoursWorked: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  employeeName: string;
  morningShiftStart: string; // e.g. '07:00'
  morningShiftDuration: number;
  afternoonShiftStart: string; // e.g. '15:00'
  afternoonShiftDuration: number;
  nightShiftStart: string; // e.g. '23:00'
  nightShiftDuration: number;
  regularHourlyRate: number;
  overtimeHourlyRate: number;
  payPeriodLengthDays: number;
  payPeriodStartDate: string; // ISO format date string (YYYY-MM-DD)
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 for Sunday
  doublePayForPublicHolidays: boolean;
  currency: string; // e.g. 'USD'
  morningShiftLabel: string;
  afternoonShiftLabel: string;
  nightShiftLabel: string;
  customShiftLabel: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  employeeName: '',
  morningShiftStart: '07:00',
  morningShiftDuration: 8.0,
  afternoonShiftStart: '15:00',
  afternoonShiftDuration: 8.0,
  nightShiftStart: '23:00',
  nightShiftDuration: 8.0,
  regularHourlyRate: 20.0,
  overtimeHourlyRate: 30.0,
  payPeriodLengthDays: 14,
  payPeriodStartDate: new Date().toISOString().split('T')[0], // Today as default
  weekStartDay: 0,
  doublePayForPublicHolidays: false,
  currency: 'USD',
  morningShiftLabel: 'Morning',
  afternoonShiftLabel: 'Afternoon',
  nightShiftLabel: 'Night',
  customShiftLabel: 'Custom',
};

interface ShiftState {
  shifts: ShiftEntry[];
  settings: AppSettings;
  publicHolidays: string[]; // Array of YYYY-MM-DD strings
  isSetupComplete: boolean;
  addShift: (shift: Omit<ShiftEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShift: (id: string, shift: Partial<ShiftEntry>) => void;
  deleteShift: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  togglePublicHoliday: (dateStr: string, isHoliday: boolean) => void;
  resetSettings: () => void;
  setSetupComplete: (complete: boolean) => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      shifts: [],
      settings: DEFAULT_SETTINGS,
      publicHolidays: [],
      isSetupComplete: false,
      addShift: (shiftData) =>
          set((state) => ({
            shifts: [
              ...state.shifts,
              {
                ...shiftData,
                id: uuid.v4() as string,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          })),
      updateShift: (id, shiftData) =>
          set((state) => ({
            shifts: state.shifts.map((shift) =>
                shift.id === id
                    ? { ...shift, ...shiftData, updatedAt: new Date().toISOString() }
                    : shift
            ),
          })),
      deleteShift: (id) =>
          set((state) => ({
            shifts: state.shifts.filter((shift) => shift.id !== id),
          })),
      updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),
      togglePublicHoliday: (dateStr, isHoliday) => {
        set((state) => {
          const holidays = new Set(state.publicHolidays || []);
          if (isHoliday) {
            holidays.add(dateStr);
          } else {
            holidays.delete(dateStr);
          }
          return { publicHolidays: Array.from(holidays) };
        });
      },
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      setSetupComplete: (complete) => set({ isSetupComplete: complete }),
    }),
    {
      name: 'shifttrack-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        settings: {
          ...currentState.settings,
          ...(persistedState?.settings || {}),
        },
      }),
    }
  )
);

