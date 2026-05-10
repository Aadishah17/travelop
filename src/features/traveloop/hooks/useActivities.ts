"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { Activity, CreateActivityInput, UpdateActivityInput } from "../types";

export interface ActivityFilters {
  stopId?: string;
  category?: string;
  date?: string;
}

export const useActivities = (tripId?: string, filters?: ActivityFilters) =>
  useQuery({
    queryKey: traveloopKeys.activities(tripId ?? "", filters),
    queryFn: async () => unwrapList(await traveloopApi.activities.list(tripId as string, filters)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useCreateActivity = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityInput) => traveloopApi.activities.create(tripId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.activities(tripId) });
      const previous = queryClient.getQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) });
      const optimisticActivity: Activity = {
        id: `optimistic-${crypto.randomUUID()}`,
        tripId,
        title: input.title,
        stopId: input.stopId,
        category: input.category,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        cost: input.cost ?? 0,
        currency: input.currency ?? "USD",
        position: input.position ?? 0,
      };

      queryClient.setQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) }, (current) =>
        current ? [...current, optimisticActivity] : [optimisticActivity]
      );

      return { previous, optimisticId: optimisticActivity.id };
    },
    onError: (_error, _input, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (activity, _input, context) => {
      queryClient.setQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) }, (current) =>
        current?.map((item) => (item.id === context?.optimisticId ? activity : item))
      );
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.activities(tripId) });
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};

export const useUpdateActivity = (tripId: string, activityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateActivityInput) => traveloopApi.activities.update(tripId, activityId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.activities(tripId) });
      const previous = queryClient.getQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) });

      queryClient.setQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) }, (current) =>
        current?.map((activity) => (activity.id === activityId ? { ...activity, ...input } : activity))
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.activities(tripId) });
    }
  });
};

export const useDeleteActivity = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => traveloopApi.activities.remove(tripId, activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.activities(tripId) });
      const previous = queryClient.getQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) });
      queryClient.setQueriesData<Activity[]>({ queryKey: traveloopKeys.activities(tripId) }, (current) =>
        current?.filter((activity) => activity.id !== activityId)
      );
      return { previous };
    },
    onError: (_error, _activityId, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};
