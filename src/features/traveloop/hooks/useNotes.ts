"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { CreateNoteInput, NoteEntry, UpdateNoteInput } from "../types";

export const useNotes = (tripId?: string) =>
  useQuery({
    queryKey: traveloopKeys.notes(tripId ?? ""),
    queryFn: async () => unwrapList(await traveloopApi.notes.list(tripId as string)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useCreateNote = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => traveloopApi.notes.create(tripId, input),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteEntry[]>(traveloopKeys.notes(tripId), (current) => [note, ...(current ?? [])]);
    }
  });
};

export const useUpdateNote = (tripId: string, noteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => traveloopApi.notes.update(tripId, noteId, input),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteEntry[]>(traveloopKeys.notes(tripId), (current) =>
        current?.map((item) => (item.id === note.id ? note : item))
      );
    }
  });
};

export const useDeleteNote = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => traveloopApi.notes.remove(tripId, noteId),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<NoteEntry[]>(traveloopKeys.notes(tripId), (current) =>
        current?.filter((note) => note.id !== id)
      );
    }
  });
};
