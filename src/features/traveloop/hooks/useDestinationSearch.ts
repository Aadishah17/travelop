"use client";

import { useQuery } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";

export interface DestinationSearchFilters {
  limit?: number;
  region?: string;
}

export const useDestinationSearch = (query: string, filters?: DestinationSearchFilters) =>
  useQuery({
    queryKey: traveloopKeys.destinationSearch(query, filters),
    queryFn: async () => unwrapList(await traveloopApi.searchDestinations(query, filters)),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 10
  });
