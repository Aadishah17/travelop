"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CreateActivityInput, CreateStopInput, CreateTripInput, TripViewMode } from "@/features/traveloop";

export type TraveloopThemePreference = "system" | "light" | "dark";

export interface TripBuilderState {
  draftTrip: CreateTripInput;
  stops: CreateStopInput[];
  activities: CreateActivityInput[];
  currentStep: "details" | "destinations" | "itinerary" | "budget" | "review";
}

interface TraveloopStore {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  tripViewMode: TripViewMode;
  selectedTripId?: string;
  builder: TripBuilderState;
  theme: TraveloopThemePreference;
  language: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setTripViewMode: (mode: TripViewMode) => void;
  setSelectedTripId: (tripId?: string) => void;
  patchDraftTrip: (draft: Partial<CreateTripInput>) => void;
  addBuilderStop: (stop: CreateStopInput) => void;
  updateBuilderStop: (index: number, stop: Partial<CreateStopInput>) => void;
  removeBuilderStop: (index: number) => void;
  addBuilderActivity: (activity: CreateActivityInput) => void;
  updateBuilderActivity: (index: number, activity: Partial<CreateActivityInput>) => void;
  removeBuilderActivity: (index: number) => void;
  setBuilderStep: (step: TripBuilderState["currentStep"]) => void;
  resetBuilder: () => void;
  setTheme: (theme: TraveloopThemePreference) => void;
  setLanguage: (language: string) => void;
}

const emptyBuilder = (): TripBuilderState => ({
  draftTrip: {},
  stops: [],
  activities: [],
  currentStep: "details"
});

export const useTraveloopStore = create<TraveloopStore>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileNavOpen: false,
      tripViewMode: "overview",
      selectedTripId: undefined,
      builder: emptyBuilder(),
      theme: "system",
      language: "en",

      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
      setTripViewMode: (mode) => set({ tripViewMode: mode }),
      setSelectedTripId: (tripId) => set({ selectedTripId: tripId }),

      patchDraftTrip: (draft) =>
        set((state) => ({
          builder: {
            ...state.builder,
            draftTrip: { ...state.builder.draftTrip, ...draft }
          }
        })),
      addBuilderStop: (stop) =>
        set((state) => ({
          builder: { ...state.builder, stops: [...state.builder.stops, stop] }
        })),
      updateBuilderStop: (index, stop) =>
        set((state) => ({
          builder: {
            ...state.builder,
            stops: state.builder.stops.map((item, itemIndex) => (itemIndex === index ? { ...item, ...stop } : item))
          }
        })),
      removeBuilderStop: (index) =>
        set((state) => ({
          builder: { ...state.builder, stops: state.builder.stops.filter((_item, itemIndex) => itemIndex !== index) }
        })),
      addBuilderActivity: (activity) =>
        set((state) => ({
          builder: { ...state.builder, activities: [...state.builder.activities, activity] }
        })),
      updateBuilderActivity: (index, activity) =>
        set((state) => ({
          builder: {
            ...state.builder,
            activities: state.builder.activities.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...activity } : item
            )
          }
        })),
      removeBuilderActivity: (index) =>
        set((state) => ({
          builder: {
            ...state.builder,
            activities: state.builder.activities.filter((_item, itemIndex) => itemIndex !== index)
          }
        })),
      setBuilderStep: (step) =>
        set((state) => ({
          builder: { ...state.builder, currentStep: step }
        })),
      resetBuilder: () => set({ builder: emptyBuilder() }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: "traveloop-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        tripViewMode: state.tripViewMode,
        selectedTripId: state.selectedTripId,
        builder: state.builder,
        theme: state.theme,
        language: state.language
      })
    }
  )
);
