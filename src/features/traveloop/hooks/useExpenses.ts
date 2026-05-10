"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { traveloopApi, unwrapList } from "../api";
import { traveloopKeys } from "../queryKeys";
import type { BudgetDatum, CreateExpenseInput, Expense, UpdateExpenseInput } from "../types";

export const useExpenses = (tripId?: string) =>
  useQuery({
    queryKey: traveloopKeys.expenses(tripId ?? ""),
    queryFn: async () => unwrapList(await traveloopApi.expenses.list(tripId as string)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60 * 2
  });

export const useExpenseAnalytics = (expenses: Expense[] = [], plannedByCategory: Record<string, number> = {}) =>
  useMemo<BudgetDatum[]>(() => {
    const actualByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
      const amount = typeof expense.amount === "object" ? expense.amount.amount : Number(expense.amount ?? 0);
      acc[expense.category] = (acc[expense.category] ?? 0) + amount;
      return acc;
    }, {});

    return Array.from(new Set([...Object.keys(plannedByCategory), ...Object.keys(actualByCategory)])).map((category) => ({
      name: category,
      category,
      planned: plannedByCategory[category] ?? 0,
      actual: actualByCategory[category] ?? 0
    }));
  }, [expenses, plannedByCategory]);

export const useCreateExpense = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => traveloopApi.expenses.create(tripId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.expenses(tripId) });
      const previousExpenses = queryClient.getQueryData<Expense[]>(traveloopKeys.expenses(tripId));
      const optimisticExpense: Expense = {
        id: `optimistic-${crypto.randomUUID()}`,
        tripId,
        title: input.title,
        amount: input.amount,
        currency: typeof input.amount === "object" ? input.amount.currency : "USD",
        category: input.category,
        paidBy: input.paidBy,
        incurredAt: input.incurredAt,
      };
      queryClient.setQueryData<Expense[]>(traveloopKeys.expenses(tripId), (current) => [optimisticExpense, ...(current ?? [])]);
      return { previousExpenses, optimisticId: optimisticExpense.id };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(traveloopKeys.expenses(tripId), context?.previousExpenses);
    },
    onSuccess: (expense, _input, context) => {
      queryClient.setQueryData<Expense[]>(traveloopKeys.expenses(tripId), (current) =>
        current?.some((item) => item.id === context?.optimisticId)
          ? current.map((item) => (item.id === context?.optimisticId ? expense : item))
          : [expense, ...(current ?? [])]
      );
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.dashboard() });
    }
  });
};

export const useUpdateExpense = (tripId: string, expenseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateExpenseInput) => traveloopApi.expenses.update(tripId, expenseId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.expenses(tripId) });
      const previousExpenses = queryClient.getQueryData<Expense[]>(traveloopKeys.expenses(tripId));
      queryClient.setQueryData<Expense[]>(traveloopKeys.expenses(tripId), (current) =>
        current?.map((item) => (item.id === expenseId ? { ...item, ...input } : item))
      );
      return { previousExpenses };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(traveloopKeys.expenses(tripId), context?.previousExpenses);
    },
    onSuccess: (expense) => {
      queryClient.setQueryData<Expense[]>(traveloopKeys.expenses(tripId), (current) =>
        current?.map((item) => (item.id === expense.id ? expense : item))
      );
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};

export const useDeleteExpense = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => traveloopApi.expenses.remove(tripId, expenseId),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.expenses(tripId) });
      const previousExpenses = queryClient.getQueryData<Expense[]>(traveloopKeys.expenses(tripId));
      queryClient.setQueryData<Expense[]>(traveloopKeys.expenses(tripId), (current) =>
        current?.filter((expense) => expense.id !== id)
      );
      return { previousExpenses };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(traveloopKeys.expenses(tripId), context?.previousExpenses);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trip(tripId) });
    }
  });
};
