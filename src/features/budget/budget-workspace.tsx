"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Loader2,
  Plus,
  ReceiptText,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type BudgetTrip = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  budget?: number | string | null;
  expenses?: BudgetExpense[];
  activities?: BudgetActivity[];
  stops?: Array<{ id: string; title: string; activities?: BudgetActivity[] }>;
};

type BudgetExpense = {
  id: string;
  tripId?: string;
  title: string;
  amount: number | string;
  currency?: string;
  category: ExpenseEnum | string;
  paidBy?: string | null;
  incurredAt?: string;
  createdAt?: string;
};

type BudgetActivity = {
  id: string;
  title: string;
  cost?: number | string | null;
  currency?: string;
  startsAt?: string | null;
  category?: string;
};

type ExpenseEnum = "FLIGHT" | "LODGING" | "FOOD" | "TRANSPORT" | "ACTIVITY" | "SHOPPING" | "INSURANCE" | "OTHER";
type BudgetCategory = "transport" | "hotels" | "food" | "activities" | "shopping" | "miscellaneous";

type ExpenseDialogState =
  | { mode: "create"; expense?: undefined }
  | { mode: "edit"; expense: BudgetExpense }
  | null;

const categories: Array<{ id: BudgetCategory; label: string; enumValue: ExpenseEnum; color: string }> = [
  { id: "transport", label: "Transport", enumValue: "TRANSPORT", color: "#2563EB" },
  { id: "hotels", label: "Hotels", enumValue: "LODGING", color: "#0EA5E9" },
  { id: "food", label: "Food", enumValue: "FOOD", color: "#10B981" },
  { id: "activities", label: "Activities", enumValue: "ACTIVITY", color: "#34D399" },
  { id: "shopping", label: "Shopping", enumValue: "SHOPPING", color: "#8B5CF6" },
  { id: "miscellaneous", label: "Miscellaneous", enumValue: "OTHER", color: "#0F172A" },
];

const expenseSchema = z.object({
  title: z.string().trim().min(2, "Expense title is required.").max(160),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero."),
  category: z.enum(["transport", "hotels", "food", "activities", "shopping", "miscellaneous"]),
  incurredAt: z.string().min(1, "Choose a date."),
  paidBy: z.string().trim().max(120).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (response.status === 204) return null as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? body?.error ?? "Request failed");
  return (body?.data ?? body) as T;
}

function tripStart(trip: BudgetTrip) {
  return trip.startDate ?? trip.startsAt ?? new Date().toISOString();
}

function tripEnd(trip: BudgetTrip) {
  return trip.endDate ?? trip.endsAt ?? tripStart(trip);
}

function enumToCategory(value?: string): BudgetCategory {
  if (value === "FLIGHT" || value === "TRANSPORT") return "transport";
  if (value === "LODGING") return "hotels";
  if (value === "FOOD") return "food";
  if (value === "ACTIVITY") return "activities";
  if (value === "SHOPPING") return "shopping";
  return "miscellaneous";
}

function categoryToEnum(value: BudgetCategory): ExpenseEnum {
  return categories.find((category) => category.id === value)?.enumValue ?? "OTHER";
}

function categoryMeta(value: BudgetCategory) {
  return categories.find((category) => category.id === value) ?? categories[categories.length - 1];
}

function amountOf(value?: number | string | null) {
  return Number(value ?? 0);
}

function expenseAmount(expense: BudgetExpense) {
  return amountOf(expense.amount);
}

function getActivities(trip: BudgetTrip) {
  const nested = (trip.stops ?? []).flatMap((stop) => stop.activities ?? []);
  const nestedIds = new Set(nested.map((activity) => activity.id));
  return [...nested, ...(trip.activities ?? []).filter((activity) => !nestedIds.has(activity.id))];
}

function dateKey(value?: string | null) {
  if (!value) return format(new Date(), "yyyy-MM-dd");
  return format(new Date(value), "yyyy-MM-dd");
}

function expenseToForm(expense?: BudgetExpense): ExpenseFormValues {
  return {
    title: expense?.title ?? "",
    amount: expenseAmount(expense ?? { id: "", title: "", amount: 0, category: "OTHER" }),
    category: enumToCategory(expense?.category),
    incurredAt: expense?.incurredAt ? format(new Date(expense.incurredAt), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    paidBy: expense?.paidBy ?? "",
  };
}

function toPayload(values: ExpenseFormValues) {
  return {
    title: values.title,
    amount: values.amount,
    category: categoryToEnum(values.category),
    incurredAt: new Date(`${values.incurredAt}T00:00:00.000Z`).toISOString(),
    paidBy: values.paidBy?.trim() || null,
    currency: "USD",
  };
}

function makeOptimisticExpense(tripId: string, values: ExpenseFormValues): BudgetExpense {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    tripId,
    title: values.title,
    amount: values.amount,
    category: categoryToEnum(values.category),
    incurredAt: new Date(`${values.incurredAt}T00:00:00.000Z`).toISOString(),
    paidBy: values.paidBy?.trim() || null,
    currency: "USD",
  };
}

function patchTrip(queryClient: ReturnType<typeof useQueryClient>, tripId: string, updater: (trip: BudgetTrip) => BudgetTrip) {
  queryClient.setQueryData<BudgetTrip[]>(["trips"], (current = []) =>
    current.map((trip) => (trip.id === tripId ? updater(trip) : trip)),
  );
}

function sortExpenses(expenses: BudgetExpense[]) {
  return expenses.toSorted((a, b) => +new Date(b.incurredAt ?? b.createdAt ?? 0) - +new Date(a.incurredAt ?? a.createdAt ?? 0));
}

function buildAnalytics(trip: BudgetTrip) {
  const expenses = trip.expenses ?? [];
  const activities = getActivities(trip);
  const budget = amountOf(trip.budget);
  const spent = expenses.reduce((sum, expense) => sum + expenseAmount(expense), 0);
  const activityCosts = activities.reduce((sum, activity) => sum + amountOf(activity.cost), 0);
  const committed = spent + activityCosts;
  const remaining = budget - committed;
  const budgetUsed = budget ? Math.round((committed / budget) * 100) : 0;
  const expenseOnlyUsed = budget ? Math.round((spent / budget) * 100) : 0;

  const byCategory = new Map<BudgetCategory, { category: BudgetCategory; label: string; expenses: number; activities: number; total: number; color: string }>();
  categories.forEach((category) =>
    byCategory.set(category.id, { category: category.id, label: category.label, expenses: 0, activities: 0, total: 0, color: category.color }),
  );

  expenses.forEach((expense) => {
    const category = enumToCategory(expense.category);
    const row = byCategory.get(category)!;
    row.expenses += expenseAmount(expense);
    row.total += expenseAmount(expense);
  });

  activities.forEach((activity) => {
    const row = byCategory.get("activities")!;
    row.activities += amountOf(activity.cost);
    row.total += amountOf(activity.cost);
  });

  const interval = {
    start: parseISO(tripStart(trip)),
    end: parseISO(tripEnd(trip)),
  };
  const days = eachDayOfInterval(interval).slice(0, 45);
  let cumulative = 0;
  const daily = days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const dayExpenses = expenses.filter((expense) => dateKey(expense.incurredAt ?? expense.createdAt) === key).reduce((sum, expense) => sum + expenseAmount(expense), 0);
    const dayActivities = activities.filter((activity) => activity.startsAt && dateKey(activity.startsAt) === key).reduce((sum, activity) => sum + amountOf(activity.cost), 0);
    cumulative += dayExpenses + dayActivities;
    return {
      date: key,
      label: format(day, "MMM d"),
      expenses: dayExpenses,
      activities: dayActivities,
      total: dayExpenses + dayActivities,
      cumulative,
    };
  });

  return {
    expenses: sortExpenses(expenses),
    activities,
    budget,
    spent,
    activityCosts,
    committed,
    remaining,
    budgetUsed,
    expenseOnlyUsed,
    categoryData: Array.from(byCategory.values()).filter((row) => row.total > 0),
    dailyData: daily,
    overBudget: budget > 0 && committed > budget,
    perDayTarget: days.length && budget ? budget / days.length : 0,
  };
}

export function BudgetWorkspace() {
  const queryClient = useQueryClient();
  const [selectedTripId, setSelectedTripId] = useState("");
  const [expenseDialog, setExpenseDialog] = useState<ExpenseDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetExpense | null>(null);

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<BudgetTrip[]>("/api/trips"),
    refetchInterval: 30_000,
  });

  const trips = tripsQuery.data ?? [];
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? trips[0];
  const analytics = useMemo(() => (selectedTrip ? buildAnalytics(selectedTrip) : null), [selectedTrip]);

  const createExpense = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      fetchJson<BudgetExpense>(`/api/trips/${selectedTrip.id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<BudgetTrip[]>(["trips"]) ?? [];
      const optimistic = makeOptimisticExpense(selectedTrip.id, values);
      patchTrip(queryClient, selectedTrip.id, (trip) => ({ ...trip, expenses: sortExpenses([optimistic, ...(trip.expenses ?? [])]) }));
      return { previousTrips, optimisticId: optimistic.id };
    },
    onSuccess: (expense, _values, context) => {
      patchTrip(queryClient, selectedTrip.id, (trip) => ({
        ...trip,
        expenses: sortExpenses((trip.expenses ?? []).map((item) => (item.id === context?.optimisticId ? expense : item))),
      }));
      toast.success("Expense added");
      setExpenseDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const updateExpense = useMutation({
    mutationFn: ({ expense, values }: { expense: BudgetExpense; values: ExpenseFormValues }) =>
      fetchJson<BudgetExpense>(`/api/trips/${selectedTrip.id}/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      }),
    onMutate: async ({ expense, values }) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<BudgetTrip[]>(["trips"]) ?? [];
      const optimistic = { ...expense, ...makeOptimisticExpense(selectedTrip.id, values), id: expense.id };
      patchTrip(queryClient, selectedTrip.id, (trip) => ({
        ...trip,
        expenses: sortExpenses((trip.expenses ?? []).map((item) => (item.id === expense.id ? optimistic : item))),
      }));
      return { previousTrips };
    },
    onSuccess: (expense) => {
      patchTrip(queryClient, selectedTrip.id, (trip) => ({
        ...trip,
        expenses: sortExpenses((trip.expenses ?? []).map((item) => (item.id === expense.id ? expense : item))),
      }));
      toast.success("Expense updated");
      setExpenseDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const deleteExpense = useMutation({
    mutationFn: (expenseId: string) => fetchJson<null>(`/api/trips/${selectedTrip.id}/expenses/${expenseId}`, { method: "DELETE" }),
    onMutate: async (expenseId) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<BudgetTrip[]>(["trips"]) ?? [];
      patchTrip(queryClient, selectedTrip.id, (trip) => ({
        ...trip,
        expenses: (trip.expenses ?? []).filter((expense) => expense.id !== expenseId),
      }));
      return { previousTrips };
    },
    onSuccess: () => {
      toast.success("Expense deleted");
      setDeleteTarget(null);
    },
    onError: (error, _expenseId, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  if (tripsQuery.isLoading) return <BudgetSkeleton />;
  if (tripsQuery.error) return <EmptyBudget title="Unable to load budgets" description={(tripsQuery.error as Error).message} />;
  if (!selectedTrip || !analytics) return <EmptyBudget title="No trips yet" description="Create a trip with a budget to unlock analytics, alerts, and expense tracking." />;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur-xl xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Budget tracking and analytics</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-navy">{selectedTrip.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {format(parseISO(tripStart(selectedTrip)), "MMM d")} - {format(parseISO(tripEnd(selectedTrip)), "MMM d, yyyy")} · live expenses and itinerary costs
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label="Select trip"
            className="h-10 rounded-md border border-input bg-white px-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-ring"
            value={selectedTrip.id}
            onChange={(event) => setSelectedTripId(event.target.value)}
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>{trip.title}</option>
            ))}
          </select>
          <Button type="button" variant="gradient" onClick={() => setExpenseDialog({ mode: "create" })}>
            <Plus className="size-4" />
            Add Expense
          </Button>
        </div>
      </section>

      <BudgetMetrics analytics={analytics} />

      {analytics.overBudget ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5" />
            <div>
              <p className="font-bold">Over budget by {formatCurrency(Math.abs(analytics.remaining))}</p>
              <p className="mt-1 text-sm leading-6">Committed trip costs include tracked expenses plus planned activity costs.</p>
            </div>
          </div>
        </motion.div>
      ) : null}

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-6">
          <AnalyticsCharts analytics={analytics} />
          <ExpenseTable
            expenses={analytics.expenses}
            onEdit={(expense) => setExpenseDialog({ mode: "edit", expense })}
            onDelete={setDeleteTarget}
            deletingId={deleteExpense.isPending ? deleteTarget?.id : undefined}
          />
        </div>
        <aside className="grid gap-6 content-start">
          <BudgetHealth analytics={analytics} />
          <ActivityCostPanel activities={analytics.activities} />
          <CategoryBreakdown data={analytics.categoryData} />
        </aside>
      </section>

      <Dialog open={Boolean(expenseDialog)} onOpenChange={(open) => !open && setExpenseDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{expenseDialog?.mode === "edit" ? "Edit expense" : "Add expense"}</DialogTitle>
            <DialogDescription>Track trip spending by day and category. Analytics update instantly.</DialogDescription>
          </DialogHeader>
          {expenseDialog ? (
            <ExpenseForm
              expense={expenseDialog.mode === "edit" ? expenseDialog.expense : undefined}
              isSubmitting={createExpense.isPending || updateExpense.isPending}
              onCancel={() => setExpenseDialog(null)}
              onSubmit={(values) =>
                expenseDialog.mode === "edit"
                  ? updateExpense.mutateAsync({ expense: expenseDialog.expense, values })
                  : createExpense.mutateAsync(values)
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
            <DialogDescription>This removes {deleteTarget?.title ? `"${deleteTarget.title}"` : "the selected expense"} from the trip budget.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleteExpense.isPending}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" disabled={!deleteTarget || deleteExpense.isPending} onClick={() => deleteTarget && deleteExpense.mutate(deleteTarget.id)}>
              {deleteExpense.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BudgetMetrics({ analytics }: { analytics: ReturnType<typeof buildAnalytics> }) {
  const cards = [
    { label: "Trip budget", value: formatCurrency(analytics.budget), detail: "Planned budget", icon: WalletCards },
    { label: "Tracked spend", value: formatCurrency(analytics.spent), detail: "Expenses in PostgreSQL", icon: ReceiptText },
    { label: "Activity costs", value: formatCurrency(analytics.activityCosts), detail: "Itinerary activity estimates", icon: CalendarDays },
    { label: "Remaining", value: formatCurrency(analytics.remaining), detail: `${analytics.budgetUsed}% committed`, icon: analytics.remaining >= 0 ? TrendingUp : TrendingDown },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold">{card.value}</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}

function AnalyticsCharts({ analytics }: { analytics: ReturnType<typeof buildAnalytics> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Category allocation</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {analytics.categoryData.length ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={analytics.categoryData} dataKey="total" nameKey="label" innerRadius={62} outerRadius={104} paddingAngle={3}>
                  {analytics.categoryData.map((entry) => <Cell key={entry.category} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart copy="Add expenses or activity costs to generate category analytics." />}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Daily spending graph</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="expenses" stackId="a" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="activities" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card xl:col-span-2">
        <CardHeader>
          <CardTitle>Expense trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="cumulative" stroke="#0EA5E9" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  deletingId,
}: {
  expenses: BudgetExpense[];
  onEdit: (expense: BudgetExpense) => void;
  onDelete: (expense: BudgetExpense) => void;
  deletingId?: string;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptText className="size-5 text-primary" />
          Expense ledger
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length ? (
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {expenses.map((expense) => {
                const category = categoryMeta(enumToCategory(expense.category));
                return (
                  <motion.div
                    key={expense.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[1fr_auto_auto] md:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{expense.title}</h3>
                        <Badge variant="outline">{category.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format(new Date(expense.incurredAt ?? expense.createdAt ?? new Date()), "MMM d, yyyy")}
                        {expense.paidBy ? ` · paid by ${expense.paidBy}` : null}
                      </p>
                    </div>
                    <span className="text-lg font-bold">{formatCurrency(expenseAmount(expense))}</span>
                    <div className="flex gap-2">
                      <Button type="button" size="icon" variant="outline" aria-label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
                        <Edit3 className="size-4" />
                      </Button>
                      <Button type="button" size="icon" variant="outline" aria-label={`Delete ${expense.title}`} onClick={() => onDelete(expense)} disabled={deletingId === expense.id}>
                        {deletingId === expense.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyChart copy="No expenses yet. Add your first cost to start the ledger." />
        )}
      </CardContent>
    </Card>
  );
}

function BudgetHealth({ analytics }: { analytics: ReturnType<typeof buildAnalytics> }) {
  const status = analytics.overBudget ? "Over budget" : analytics.budgetUsed > 80 ? "Watch closely" : "Healthy";
  const StatusIcon = analytics.overBudget ? AlertTriangle : CheckCircle2;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="size-5 text-emerald" />
          Budget health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <span className={`flex size-11 items-center justify-center rounded-md ${analytics.overBudget ? "bg-destructive/10 text-destructive" : "bg-emerald/10 text-emerald"}`}>
            <StatusIcon className="size-5" />
          </span>
          <div>
            <p className="font-bold">{status}</p>
            <p className="text-sm text-muted-foreground">{analytics.budgetUsed}% of budget committed</p>
          </div>
        </div>
        <Progress value={Math.min(100, analytics.budgetUsed)} />
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Expense-only usage</span><span className="font-semibold">{analytics.expenseOnlyUsed}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Daily target</span><span className="font-semibold">{formatCurrency(analytics.perDayTarget)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Remaining budget</span><span className="font-semibold">{formatCurrency(analytics.remaining)}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCostPanel({ activities }: { activities: BudgetActivity[] }) {
  const costed = activities.filter((activity) => amountOf(activity.cost) > 0).slice(0, 6);
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Itinerary activity costs</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {costed.length ? costed.map((activity) => (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3" key={activity.id}>
            <div>
              <p className="font-semibold">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.startsAt ? format(new Date(activity.startsAt), "MMM d") : "Unscheduled"}</p>
            </div>
            <span className="font-bold">{formatCurrency(amountOf(activity.cost))}</span>
          </div>
        )) : <p className="text-sm text-muted-foreground">Add costs to itinerary activities to include planned experiences in budget health.</p>}
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown({ data }: { data: ReturnType<typeof buildAnalytics>["categoryData"] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Category breakdown</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {data.length ? data.map((row) => (
          <div key={row.category} className="grid gap-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>{row.label}</span>
              <span>{formatCurrency(row.total)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (row.total / Math.max(...data.map((item) => item.total))) * 100)}%`, backgroundColor: row.color }} />
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">No category data yet.</p>}
      </CardContent>
    </Card>
  );
}

function ExpenseForm({
  expense,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  expense?: BudgetExpense;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<unknown>;
}) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expenseToForm(expense),
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <Field label="Expense title" error={form.formState.errors.title?.message}>
        <Input placeholder="Train tickets" {...form.register("title")} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Amount" error={form.formState.errors.amount?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("amount")} />
        </Field>
        <Field label="Date" error={form.formState.errors.incurredAt?.message}>
          <Input type="date" {...form.register("incurredAt")} />
        </Field>
        <Field label="Category" error={form.formState.errors.category?.message}>
          <select className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring" {...form.register("category")}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </Field>
        <Field label="Paid by" error={form.formState.errors.paidBy?.message}>
          <Input placeholder="Optional" {...form.register("paidBy")} />
        </Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {expense ? "Save Expense" : "Add Expense"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function EmptyChart({ copy }: { copy: string }) {
  return <div className="grid h-full min-h-40 place-items-center rounded-lg border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">{copy}</div>;
}

function EmptyBudget({ title, description }: { title: string; description: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="grid min-h-80 place-items-center p-8 text-center">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
