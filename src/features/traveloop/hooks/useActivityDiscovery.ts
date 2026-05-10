"use client";

import { useQuery } from "@tanstack/react-query";

import { traveloopApi } from "../api";
import { traveloopKeys } from "../queryKeys";

export interface ActivityDiscoveryFilters {
  destination?: string;
  query?: string;
  category?: string;
  lat?: number;
  lng?: number;
  cursor?: string;
  limit?: number;
}

export const useActivityDiscovery = (filters: ActivityDiscoveryFilters) =>
  useQuery({
    queryKey: traveloopKeys.activityDiscovery(filters),
    queryFn: () => traveloopApi.discoverActivities(filters),
    enabled: Boolean(filters.destination || filters.query || (filters.lat && filters.lng)),
    staleTime: 1000 * 60 * 10
  });
