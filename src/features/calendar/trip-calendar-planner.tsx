"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  type DatesSetArg,
  type EventClickArg,
  type EventContentArg,
  type EventDropArg,
  type EventInput,
} from "@fullcalendar/core";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  Layers3,
  Loader2,
  MapPin,
  RefreshCcw,
  Route,
  Sparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

type CalendarTrip = {
  id: string;
  title: string;
  description?: string | null;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  budget?: number | string | null;
  stops?: CalendarStop[];
  activities?: CalendarActivity[];
};

type CalendarStop = {
  id: string;
  title: string;
  startsAt?: string | null;
  endsAt?: string | null;
  position?: number;
  address?: string | null;
  activities?: CalendarActivity[];
};

type CalendarActivity = {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  stopId?: string | null;
  cost?: number | string | null;
  currency?: string;
  position?: number;
};

type ScheduleVariables = {
  activity: CalendarActivity;
  startsAt: Date;
  endsAt: Date | null;
  stopId: string;
  revert?: () => void;
};

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? body?.error ?? "Request failed");
  }
  return (body?.data ?? body) as T;
}

function tripStart(trip: CalendarTrip) {
  return trip.startDate ?? trip.startsAt ?? new Date().toISOString();
}

function tripEnd(trip: CalendarTrip) {
  return trip.endDate ?? trip.endsAt ?? tripStart(trip);
}

function sortStops(stops: CalendarStop[]) {
  return stops.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function sortActivities(activities: CalendarActivity[]) {
  return activities.toSorted((a, b) => {
    const first = a.startsAt ? +new Date(a.startsAt) : Number.MAX_SAFE_INTEGER;
    const second = b.startsAt ? +new Date(b.startsAt) : Number.MAX_SAFE_INTEGER;
    return first - second || (a.position ?? 0) - (b.position ?? 0);
  });
}

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildTripDays(trip: CalendarTrip) {
  const start = startOfDay(new Date(tripStart(trip)));
  const end = startOfDay(new Date(tripEnd(trip)));
  const total = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return Array.from({ length: Math.min(total, 45) }, (_, index) => addDays(start, index));
}

function activityDuration(activity: CalendarActivity) {
  if (!activity.startsAt || !activity.endsAt) return 90 * 60 * 1000;
  return Math.max(30 * 60 * 1000, +new Date(activity.endsAt) - +new Date(activity.startsAt));
}

function mergeDateAndTime(target: Date, activity: CalendarActivity) {
  const next = new Date(target);
  if (activity.startsAt) {
    const previous = new Date(activity.startsAt);
    next.setHours(previous.getHours(), previous.getMinutes(), 0, 0);
  } else if (next.getHours() === 0 && next.getMinutes() === 0) {
    next.setHours(9, 0, 0, 0);
  }
  return next;
}

function stopContainsDate(stop: CalendarStop, date: Date) {
  if (!stop.startsAt || !stop.endsAt) return false;
  return isWithinInterval(date, {
    start: startOfDay(new Date(stop.startsAt)),
    end: endOfDay(new Date(stop.endsAt)),
  });
}

function findStopForDate(stops: CalendarStop[], date: Date, fallbackStopId?: string | null) {
  const fallback = stops.find((stop) => stop.id === fallbackStopId);
  if (fallback && stopContainsDate(fallback, date)) return fallback;
  return stops.find((stop) => stopContainsDate(stop, date));
}

function getTripActivities(trip: CalendarTrip) {
  const stops = sortStops(trip.stops ?? []);
  const nested = stops.flatMap((stop) => stop.activities ?? []);
  const nestedIds = new Set(nested.map((activity) => activity.id));
  const topLevelOnly = (trip.activities ?? []).filter((activity) => !nestedIds.has(activity.id));
  return sortActivities([...nested, ...topLevelOnly]);
}

function replaceActivity(trip: CalendarTrip, nextActivity: CalendarActivity): CalendarTrip {
  const stops = trip.stops ?? [];
  const currentActivities = getTripActivities(trip);
  const nextActivities = currentActivities.some((activity) => activity.id === nextActivity.id)
    ? currentActivities.map((activity) => (activity.id === nextActivity.id ? nextActivity : activity))
    : [...currentActivities, nextActivity];

  return {
    ...trip,
    activities: sortActivities(nextActivities),
    stops: stops.map((stop) => ({
      ...stop,
      activities: sortActivities(nextActivities.filter((activity) => activity.stopId === stop.id)),
    })),
  };
}

function patchTrip(queryClient: ReturnType<typeof useQueryClient>, tripId: string, updater: (trip: CalendarTrip) => CalendarTrip) {
  queryClient.setQueryData<CalendarTrip[]>(["trips"], (current = []) =>
    current.map((trip) => (trip.id === tripId ? updater(trip) : trip)),
  );
}

function makeCalendarEvents(trip: CalendarTrip, stops: CalendarStop[], activities: CalendarActivity[]): EventInput[] {
  const events: EventInput[] = [
    {
      id: `trip-${trip.id}`,
      title: trip.title,
      start: tripStart(trip),
      end: addDays(new Date(tripEnd(trip)), 1).toISOString(),
      display: "background",
      classNames: ["tl-trip-overlay"],
      extendedProps: { type: "trip" },
    },
  ];

  stops.forEach((stop, index) => {
    if (!stop.startsAt || !stop.endsAt) return;
    events.push({
      id: `stop-${stop.id}`,
      title: stop.title,
      start: stop.startsAt,
      end: addDays(new Date(stop.endsAt), 1).toISOString(),
      allDay: true,
      editable: false,
      classNames: ["tl-stop-event"],
      extendedProps: { type: "stop", stopId: stop.id, order: index + 1 },
    });
  });

  activities.forEach((activity) => {
    if (!activity.startsAt) return;
    const stop = stops.find((item) => item.id === activity.stopId);
    events.push({
      id: activity.id,
      title: activity.title,
      start: activity.startsAt,
      end: activity.endsAt ?? undefined,
      editable: true,
      classNames: ["tl-activity-event"],
      backgroundColor: "#2563EB",
      borderColor: "#0EA5E9",
      extendedProps: {
        type: "activity",
        activityId: activity.id,
        stopId: activity.stopId,
        stopTitle: stop?.title,
        category: activity.category,
        cost: activity.cost,
      },
    });
  });

  return events;
}

export function TripCalendarPlanner() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const queryClient = useQueryClient();
  const [selectedTripId, setSelectedTripId] = useState("");
  const [calendarTitle, setCalendarTitle] = useState("Travel calendar");
  const [activeView, setActiveView] = useState<CalendarView>("dayGridMonth");
  const [visibleStart, setVisibleStart] = useState<Date>(new Date());
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<CalendarTrip[]>("/api/trips"),
    refetchInterval: 30_000,
  });

  const trips = tripsQuery.data ?? [];
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  const stops = useMemo(() => sortStops(trip?.stops ?? []), [trip?.stops]);
  const activities = useMemo(() => (trip ? getTripActivities(trip) : []), [trip]);
  const scheduledActivities = activities.filter((activity) => activity.startsAt);
  const unscheduledActivities = activities.filter((activity) => !activity.startsAt);
  const tripDays = useMemo(() => (trip ? buildTripDays(trip) : []), [trip]);
  const events = useMemo(() => (trip ? makeCalendarEvents(trip, stops, activities) : []), [activities, stops, trip]);
  const selectedDayActivities = useMemo(
    () => scheduledActivities.filter((activity) => activity.startsAt && isSameDay(new Date(activity.startsAt), visibleStart)),
    [scheduledActivities, visibleStart],
  );

  const updateActivity = useMutation({
    mutationFn: ({ activity, startsAt, endsAt, stopId }: ScheduleVariables) =>
      fetchJson<CalendarActivity>(`/api/trips/${trip.id}/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt?.toISOString() ?? null,
          stopId,
        }),
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<CalendarTrip[]>(["trips"]) ?? [];
      const optimisticActivity: CalendarActivity = {
        ...variables.activity,
        startsAt: variables.startsAt.toISOString(),
        endsAt: variables.endsAt?.toISOString() ?? null,
        stopId: variables.stopId,
      };

      patchTrip(queryClient, trip.id, (currentTrip) => replaceActivity(currentTrip, optimisticActivity));
      return { previousTrips };
    },
    onSuccess: (activity) => {
      patchTrip(queryClient, trip.id, (currentTrip) => replaceActivity(currentTrip, activity));
      toast.success("Calendar updated");
    },
    onError: (error, variables, context) => {
      variables.revert?.();
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  function scheduleActivity(activity: CalendarActivity, targetStart: Date, targetEnd: Date | null, revert?: () => void) {
    if (!trip) return;
    const nextStop = findStopForDate(stops, targetStart, activity.stopId);
    if (!nextStop) {
      revert?.();
      toast.error("Drop activities onto dates covered by a city stop.");
      return;
    }

    updateActivity.mutate({
      activity,
      startsAt: targetStart,
      endsAt: targetEnd,
      stopId: nextStop.id,
      revert,
    });
  }

  function handleEventDrop(arg: EventDropArg) {
    const activity = activities.find((item) => item.id === arg.event.id);
    if (!activity || !arg.event.start) {
      arg.revert();
      return;
    }

    const nextStart = arg.event.allDay ? mergeDateAndTime(arg.event.start, activity) : arg.event.start;
    const nextEnd = arg.event.end ? new Date(+nextStart + Math.max(30 * 60 * 1000, +arg.event.end - +arg.event.start)) : null;
    scheduleActivity(activity, nextStart, nextEnd, arg.revert);
  }

  function handleEventResize(arg: EventResizeDoneArg) {
    const activity = activities.find((item) => item.id === arg.event.id);
    if (!activity || !arg.event.start) {
      arg.revert();
      return;
    }
    scheduleActivity(activity, arg.event.start, arg.event.end, arg.revert);
  }

  function handleDayDrop(event: DragEndEvent) {
    const activityId = String(event.active.id).replace("activity:", "");
    const day = String(event.over?.id ?? "").replace("day:", "");
    if (!activityId || !day || day === "undefined") return;

    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;

    const start = mergeDateAndTime(new Date(`${day}T09:00:00`), activity);
    const end = new Date(+start + activityDuration(activity));
    scheduleActivity(activity, start, end);
  }

  function handleEventClick(arg: EventClickArg) {
    const activity = activities.find((item) => item.id === arg.event.id);
    if (activity) setSelectedActivity(activity);
  }

  function handleDatesSet(arg: DatesSetArg) {
    setCalendarTitle(arg.view.title);
    setActiveView(arg.view.type as CalendarView);
    setVisibleStart(arg.view.type === "timeGridDay" ? arg.start : startOfDay(arg.start));
  }

  function changeView(view: CalendarView) {
    calendarRef.current?.getApi().changeView(view);
    setActiveView(view);
  }

  if (tripsQuery.isLoading) return <CalendarSkeleton />;
  if (tripsQuery.error) return <EmptyCalendar title="Unable to load calendar" description={(tripsQuery.error as Error).message} />;
  if (!trip) return <EmptyCalendar title="No trips yet" description="Create a trip, add stops, then use the calendar to schedule activities by day and time." />;

  const totalCost = activities.reduce((sum, activity) => sum + Number(activity.cost ?? 0), 0);
  const budget = Number(trip.budget ?? 0);
  const budgetProgress = budget ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur-xl xl:grid-cols-[1fr_auto] xl:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Calendar-based itinerary planning</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-navy">{trip.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {format(new Date(tripStart(trip)), "MMM d")} - {format(new Date(tripEnd(trip)), "MMM d, yyyy")} · {stops.length} stops · {scheduledActivities.length} scheduled
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label="Select trip"
            className="h-10 rounded-md border border-input bg-white px-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-ring"
            value={trip.id}
            onChange={(event) => setSelectedTripId(event.target.value)}
          >
            {trips.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={() => tripsQuery.refetch()}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-white/70">
            <CalendarToolbar
              title={calendarTitle}
              activeView={activeView}
              onToday={() => calendarRef.current?.getApi().today()}
              onPrev={() => calendarRef.current?.getApi().prev()}
              onNext={() => calendarRef.current?.getApi().next()}
              onView={changeView}
            />
          </CardHeader>
          <CardContent className="p-0">
            <DndContext sensors={sensors} onDragEnd={handleDayDrop}>
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="tl-calendar-shell">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    height="auto"
                    events={events}
                    editable
                    droppable={false}
                    eventStartEditable
                    eventDurationEditable
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    eventContent={renderEventContent}
                    nowIndicator
                    slotMinTime="05:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot
                    dayMaxEvents={3}
                    expandRows
                  />
                </div>
                <SchedulingRail
                  trip={trip}
                  stops={stops}
                  days={tripDays}
                  activities={activities}
                  unscheduled={unscheduledActivities}
                  updating={updateActivity.isPending}
                />
              </div>
            </DndContext>
          </CardContent>
        </Card>

        <aside className="grid gap-6 content-start">
          <PlannerSummary
            stops={stops}
            activities={activities}
            scheduledCount={scheduledActivities.length}
            totalCost={totalCost}
            budgetProgress={budgetProgress}
          />
          <DailyAgenda
            date={visibleStart}
            activities={selectedDayActivities}
            stops={stops}
            onSelect={setSelectedActivity}
          />
          <CityTimeline stops={stops} />
        </aside>
      </section>

      <ActivityDialog
        activity={selectedActivity}
        stop={stops.find((item) => item.id === selectedActivity?.stopId)}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}

function CalendarToolbar({
  title,
  activeView,
  onToday,
  onPrev,
  onNext,
  onView,
}: {
  title: string;
  activeView: CalendarView;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onView: (view: CalendarView) => void;
}) {
  const views: Array<{ id: CalendarView; label: string }> = [
    { id: "dayGridMonth", label: "Month" },
    { id: "timeGridWeek", label: "Week" },
    { id: "timeGridDay", label: "Day" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          {title}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Drag activities to schedule days and resize them to change duration.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border bg-white p-1">
          {views.map((view) => (
            <Button
              key={view.id}
              type="button"
              size="sm"
              variant={activeView === view.id ? "gradient" : "ghost"}
              onClick={() => onView(view.id)}
            >
              {view.label}
            </Button>
          ))}
        </div>
        <Button type="button" size="icon" variant="outline" aria-label="Previous" onClick={onPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onToday}>
          Today
        </Button>
        <Button type="button" size="icon" variant="outline" aria-label="Next" onClick={onNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function renderEventContent(arg: EventContentArg) {
  const type = arg.event.extendedProps.type;
  if (type === "stop") {
    return (
      <div className="flex items-center gap-1.5 truncate">
        <MapPin className="size-3" />
        <span className="truncate">{arg.event.title}</span>
      </div>
    );
  }

  if (type === "activity") {
    return (
      <div className="grid gap-0.5 truncate">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="size-3" />
          <span className="truncate font-semibold">{arg.event.title}</span>
        </div>
        <span className="truncate text-[10px] opacity-80">{arg.event.extendedProps.stopTitle ?? arg.event.extendedProps.category}</span>
      </div>
    );
  }

  return <span>{arg.event.title}</span>;
}

function SchedulingRail({
  trip,
  stops,
  days,
  activities,
  unscheduled,
  updating,
}: {
  trip: CalendarTrip;
  stops: CalendarStop[];
  days: Date[];
  activities: CalendarActivity[];
  unscheduled: CalendarActivity[];
  updating: boolean;
}) {
  return (
    <div className="border-t bg-slate-50/80 p-4 xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Scheduling tray</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Drag cards onto trip days.</p>
        </div>
        {updating ? <Loader2 className="size-4 animate-spin text-primary" /> : <Sparkles className="size-4 text-emerald" />}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-2">
          <p className="text-xs font-bold uppercase text-muted-foreground">Unscheduled</p>
          {unscheduled.length ? (
            unscheduled.map((activity) => <DraggableActivity key={activity.id} activity={activity} />)
          ) : (
            <div className="rounded-lg border border-dashed bg-white p-3 text-sm text-muted-foreground">All activities have a time slot.</div>
          )}
        </div>

        <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1">
          <p className="sticky top-0 z-10 bg-slate-50/95 py-1 text-xs font-bold uppercase text-muted-foreground">Travel days</p>
          {days.map((day, index) => {
            const stop = stops.find((item) => stopContainsDate(item, day));
            const dayActivities = activities.filter((activity) => activity.startsAt && isSameDay(new Date(activity.startsAt), day));
            return (
              <DayDropZone key={day.toISOString()} day={day} index={index} stop={stop} count={dayActivities.length} trip={trip} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DraggableActivity({ activity }: { activity: CalendarActivity }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `activity:${activity.id}` });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cn("rounded-lg border bg-white p-3 shadow-sm", isDragging && "z-50 shadow-xl")}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{activity.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{activity.category}</Badge>
            <span className="text-xs font-semibold text-emerald-700">{formatCurrency(Number(activity.cost ?? 0))}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DayDropZone({
  day,
  index,
  stop,
  count,
}: {
  day: Date;
  index: number;
  stop?: CalendarStop;
  count: number;
  trip: CalendarTrip;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${dayKey(day)}` });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={cn(
        "rounded-lg border bg-white p-3 transition",
        isOver && "border-primary bg-sky/10 shadow-soft",
        !stop && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Day {index + 1}</p>
          <p className="text-xs text-muted-foreground">{format(day, "EEE, MMM d")}</p>
        </div>
        <Badge variant={stop ? "sky" : "secondary"}>{count}</Badge>
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">{stop?.title ?? "No city assigned"}</p>
    </motion.div>
  );
}

function PlannerSummary({
  stops,
  activities,
  scheduledCount,
  totalCost,
  budgetProgress,
}: {
  stops: CalendarStop[];
  activities: CalendarActivity[];
  scheduledCount: number;
  totalCost: number;
  budgetProgress: number;
}) {
  const completion = activities.length ? Math.round((scheduledCount / activities.length) * 100) : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers3 className="size-5 text-primary" />
          Planner health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Stops</p>
            <p className="mt-1 text-xl font-bold">{stops.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="mt-1 text-xl font-bold">{scheduledCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(totalCost)}</p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium">
            <span>Scheduling progress</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium">
            <span>Budget usage</span>
            <span>{budgetProgress}%</span>
          </div>
          <Progress value={budgetProgress} />
        </div>
      </CardContent>
    </Card>
  );
}

function DailyAgenda({
  date,
  activities,
  stops,
  onSelect,
}: {
  date: Date;
  activities: CalendarActivity[];
  stops: CalendarStop[];
  onSelect: (activity: CalendarActivity) => void;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5 text-sky" />
          Daily agenda
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm font-semibold">{format(date, "EEEE, MMMM d")}</p>
        <AnimatePresence initial={false}>
          {activities.length ? (
            activities.map((activity) => {
              const stop = stops.find((item) => item.id === activity.stopId);
              return (
                <motion.button
                  key={activity.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-primary"
                  onClick={() => onSelect(activity)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{activity.title}</p>
                    <span className="text-sm font-bold">{formatCurrency(Number(activity.cost ?? 0))}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {activity.startsAt ? format(new Date(activity.startsAt), "h:mm a") : "Time pending"}
                    {activity.endsAt ? ` - ${format(new Date(activity.endsAt), "h:mm a")}` : null}
                    {stop ? ` · ${stop.title}` : null}
                  </p>
                </motion.button>
              );
            })
          ) : (
            <motion.div className="rounded-lg border border-dashed bg-white p-4 text-sm text-muted-foreground">
              No activities scheduled for the visible day.
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function CityTimeline({ stops }: { stops: CalendarStop[] }) {
  return (
    <Card className="navy-panel rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Route className="size-5 text-mint" />
          City timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {stops.length ? (
          stops.map((stop, index) => (
            <div key={stop.id} className="flex items-start gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-white text-sm font-bold text-primary">{index + 1}</span>
              <div>
                <p className="font-semibold text-white">{stop.title}</p>
                <p className="text-xs text-white/60">
                  {format(new Date(stop.startsAt ?? new Date()), "MMM d")} - {format(new Date(stop.endsAt ?? stop.startsAt ?? new Date()), "MMM d")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/60">Add city stops in the itinerary builder to unlock travel-day scheduling.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityDialog({
  activity,
  stop,
  onClose,
}: {
  activity: CalendarActivity | null;
  stop?: CalendarStop;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(activity)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{activity?.title ?? "Activity"}</DialogTitle>
          <DialogDescription>Calendar event details synchronized with your itinerary timeline.</DialogDescription>
        </DialogHeader>
        {activity ? (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">City stop</span>
                <Badge variant="sky">{stop?.title ?? "Unassigned"}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Time slot</span>
                <span className="text-sm font-semibold">
                  {activity.startsAt ? format(new Date(activity.startsAt), "MMM d, h:mm a") : "Unscheduled"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Estimated cost</span>
                <span className="text-sm font-bold">{formatCurrency(Number(activity.cost ?? 0))}</span>
              </div>
            </div>
            {activity.description ? <p className="text-sm leading-6 text-muted-foreground">{activity.description}</p> : null}
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="gradient">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyCalendar({ title, description }: { title: string; description: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="grid min-h-80 place-items-center p-8 text-center">
        <div className="grid justify-items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-6" />
          </span>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <Skeleton className="h-[720px]" />
      <div className="grid gap-4 content-start">
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
