"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { CreateStopInput, Stop, UpdateStopInput } from "../types";

const stopPosition = (stop: Stop) => stop.position ?? stop.order ?? 0;

export const useStops = (tripId?: string) =>
  useQuery({
    queryKey: traveloopKeys.stops(tripId ?? ""),
    queryFn: async () => unwrapList(await traveloopApi.stops.list(tripId as string)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useCreateStop = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStopInput) => traveloopApi.stops.create(tripId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.stops(tripId) });
      const previousStops = queryClient.getQueryData<Stop[]>(traveloopKeys.stops(tripId));
      const optimisticStop: Stop = {
        id: `optimistic-${crypto.randomUUID()}`,
        tripId,
        title: input.title,
        address: input.address,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        position: input.position ?? previousStops?.length ?? 0,
        activities: [],
      };
      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), (current) =>
        [...(current ?? []), optimisticStop].sort((a, b) => stopPosition(a) - stopPosition(b))
      );
      return { previousStops, optimisticId: optimisticStop.id };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(traveloopKeys.stops(tripId), context?.previousStops);
    },
    onSuccess: (stop, _input, context) => {
      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), (current) =>
        (current ?? [])
          .map((item) => (item.id === stop.id || item.id === context?.optimisticId ? stop : item))
          .sort((a, b) => stopPosition(a) - stopPosition(b))
      );
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};

export const useUpdateStop = (tripId: string, stopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStopInput) => traveloopApi.stops.update(tripId, stopId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.stops(tripId) });
      const previousStops = queryClient.getQueryData<Stop[]>(traveloopKeys.stops(tripId));

      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), (current) =>
        current?.map((stop) => (stop.id === stopId ? { ...stop, ...input } : stop))
      );

      return { previousStops };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(traveloopKeys.stops(tripId), context?.previousStops);
    },
    onSuccess: (stop) => {
      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), (current) =>
        current?.map((item) => (item.id === stop.id ? stop : item)).sort((a, b) => stopPosition(a) - stopPosition(b))
      );
    }
  });
};

export const useDeleteStop = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stopId: string) => traveloopApi.stops.remove(tripId, stopId),
    onMutate: async (stopId) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.stops(tripId) });
      const previousStops = queryClient.getQueryData<Stop[]>(traveloopKeys.stops(tripId));
      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), (current) =>
        current?.filter((stop) => stop.id !== stopId)
      );
      return { previousStops };
    },
    onError: (_error, _stopId, context) => {
      queryClient.setQueryData(traveloopKeys.stops(tripId), context?.previousStops);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};

export const useReorderStops = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stops: Stop[]) =>
      traveloopApi.stops.reorder(
        tripId,
        stops.map((stop, index) => ({ id: stop.id, position: index }))
      ),
    onMutate: async (stops) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.stops(tripId) });
      const previousStops = queryClient.getQueryData<Stop[]>(traveloopKeys.stops(tripId));
      queryClient.setQueryData<Stop[]>(
        traveloopKeys.stops(tripId),
        stops.map((stop, index) => ({ ...stop, position: index }))
      );
      return { previousStops };
    },
    onError: (_error, _stops, context) => {
      queryClient.setQueryData(traveloopKeys.stops(tripId), context?.previousStops);
    },
    onSuccess: (stops) => {
      queryClient.setQueryData<Stop[]>(traveloopKeys.stops(tripId), stops);
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};
