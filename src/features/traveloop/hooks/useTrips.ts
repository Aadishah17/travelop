"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { CreateTripInput, Trip, UpdateTripInput } from "../types";

export interface TripFilters {
  status?: string;
  query?: string;
  cursor?: string;
}

export const useTrips = (filters?: TripFilters) =>
  useQuery({
    queryKey: traveloopKeys.tripList(filters),
    queryFn: async () => unwrapList(await traveloopApi.trips.list(filters)),
    staleTime: 1000 * 60 * 2
  });

export const useTrip = (tripId?: string) =>
  useQuery({
    queryKey: traveloopKeys.trip(tripId ?? ""),
    queryFn: () => traveloopApi.trips.detail(tripId as string),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTripInput) => traveloopApi.trips.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.trips() });
      const previousLists = queryClient.getQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() });
      const optimisticTrip: Trip = {
        id: `optimistic-${crypto.randomUUID()}`,
        title: input.title ?? "Untitled trip",
        description: input.description ?? input.summary ?? null,
        coverImageUrl: input.coverImageUrl ?? input.coverImage ?? undefined,
        destination: typeof input.destination === "string" ? input.destination : input.destinationName ?? input.title ?? null,
        startsAt: input.startsAt ?? input.startDate,
        endsAt: input.endsAt ?? input.endDate,
        startDate: input.startDate ?? input.startsAt,
        endDate: input.endDate ?? input.endsAt,
        budget: input.budget ?? null,
        status: input.status ?? "PLANNED",
        stops: [],
        activities: [],
        expenses: [],
        packingItems: [],
        notes: [],
      };

      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current ? [optimisticTrip, ...current] : [optimisticTrip]
      );

      return { previousLists, optimisticId: optimisticTrip.id };
    },
    onError: (_error, _input, context) => {
      context?.previousLists.forEach(([queryKey, value]) => queryClient.setQueryData(queryKey, value));
    },
    onSuccess: (trip, _input, context) => {
      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current?.map((item) => (item.id === context?.optimisticId ? trip : item)) ?? [trip]
      );
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.dashboard() });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trips() });
    }
  });
};

export const useUpdateTrip = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTripInput) => traveloopApi.trips.update(tripId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.trip(tripId) });
      await queryClient.cancelQueries({ queryKey: traveloopKeys.trips() });
      const previousTrip = queryClient.getQueryData<Trip>(traveloopKeys.trip(tripId));
      const previousLists = queryClient.getQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() });

      queryClient.setQueryData<Trip>(traveloopKeys.trip(tripId), (current) =>
        current ? { ...current, ...input } : current
      );
      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current?.map((trip) => (trip.id === tripId ? { ...trip, ...input } : trip))
      );

      return { previousTrip, previousLists };
    },
    onError: (_error, _input, context) => {
      if (context?.previousTrip) {
        queryClient.setQueryData(traveloopKeys.trip(tripId), context.previousTrip);
      }
      context?.previousLists.forEach(([queryKey, value]) => queryClient.setQueryData(queryKey, value));
    },
    onSuccess: (trip) => {
      queryClient.setQueryData(traveloopKeys.trip(tripId), trip);
      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current?.map((item) => (item.id === trip.id ? trip : item))
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.dashboard() });
    }
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => traveloopApi.trips.remove(tripId),
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.trips() });
      const previousLists = queryClient.getQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() });
      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current?.filter((trip) => trip.id !== tripId)
      );
      return { previousLists };
    },
    onError: (_error, _tripId, context) => {
      context?.previousLists.forEach(([queryKey, value]) => queryClient.setQueryData(queryKey, value));
    },
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: traveloopKeys.trip(id) });
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.dashboard() });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trips() });
    }
  });
};
