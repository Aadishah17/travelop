"use client";

import { useQuery } from "@tanstack/react-query";

import { traveloopApi } from "../api";
import { traveloopKeys } from "../queryKeys";

export interface DashboardFilters {
  range?: "week" | "month" | "quarter" | "year";
  status?: string;
}

export const useDashboard = (filters?: DashboardFilters) =>
  useQuery({
    queryKey: traveloopKeys.dashboard(filters),
    queryFn: () => traveloopApi.dashboard(filters),
    staleTime: 1000 * 60 * 3
  });
