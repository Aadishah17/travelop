"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { CreatePackingItemInput, PackingItem, UpdatePackingItemInput } from "../types";

export const usePackingItems = (tripId?: string) =>
  useQuery({
    queryKey: traveloopKeys.packing(tripId ?? ""),
    queryFn: async () => unwrapList(await traveloopApi.packing.list(tripId as string)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useCreatePackingItem = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePackingItemInput) => traveloopApi.packing.create(tripId, input),
    onSuccess: (item) => {
      queryClient.setQueryData<PackingItem[]>(traveloopKeys.packing(tripId), (current) => [item, ...(current ?? [])]);
    }
  });
};

export const useUpdatePackingItem = (tripId: string, itemId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePackingItemInput) => traveloopApi.packing.update(tripId, itemId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.packing(tripId) });
      const previous = queryClient.getQueryData<PackingItem[]>(traveloopKeys.packing(tripId));

      queryClient.setQueryData<PackingItem[]>(traveloopKeys.packing(tripId), (current) =>
        current?.map((item) => (item.id === itemId ? { ...item, ...input } : item))
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(traveloopKeys.packing(tripId), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.packing(tripId) });
    }
  });
};

export const useDeletePackingItem = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => traveloopApi.packing.remove(tripId, itemId),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<PackingItem[]>(traveloopKeys.packing(tripId), (current) =>
        current?.filter((item) => item.id !== id)
      );
    }
  });
};
