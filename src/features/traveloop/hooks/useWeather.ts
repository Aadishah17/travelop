"use client";

import { useQuery } from "@tanstack/react-query";

import { traveloopApi } from "../api";
import { traveloopKeys } from "../queryKeys";

export interface WeatherFilters {
  destination?: string;
  lat?: number;
  lng?: number;
  startDate?: string;
  endDate?: string;
}

export const useWeather = (filters: WeatherFilters) =>
  useQuery({
    queryKey: traveloopKeys.weather(filters),
    queryFn: () => traveloopApi.weather(filters),
    enabled: Boolean(filters.destination || (filters.lat && filters.lng)),
    staleTime: 1000 * 60 * 30
  });
