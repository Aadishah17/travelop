import type {
  Activity,
  ActivityDiscoveryResult,
  CreateActivityInput,
  CreateExpenseInput,
  CreateNoteInput,
  CreatePackingItemInput,
  CreateStopInput,
  CreateTripInput,
  DashboardSummary,
  Destination,
  Expense,
  ListResponse,
  NoteEntry,
  PackingItem,
  Stop,
  Trip,
  UpdateActivityInput,
  UpdateExpenseInput,
  UpdateNoteInput,
  UpdatePackingItemInput,
  UpdateStopInput,
  UpdateTripInput,
  WeatherForecast
} from "./types";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = object;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const toQueryString = (params?: QueryParams) => {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value as QueryValue];
    values.forEach((item) => {
      if (item !== undefined && item !== null && item !== "") {
        search.append(key, String(item));
      }
    });
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

const request = async <T>(path: string, init?: RequestInit, params?: QueryParams): Promise<T> => {
  const response = await fetch(`${path}${toQueryString(params)}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error?.message ?? payload?.error ?? "Traveloop request failed";
    throw new ApiError(message, response.status, payload);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
};

const body = (value?: unknown) => (value === undefined ? undefined : JSON.stringify(value));

export const unwrapList = <T>(response: ListResponse<T>): T[] => {
  if (Array.isArray(response)) return response;
  if ("items" in response) return response.items;
  return response.data;
};

export const traveloopApi = {
  dashboard: (params?: QueryParams) => request<DashboardSummary>("/api/dashboard", undefined, params),

  trips: {
    list: (params?: QueryParams) => request<ListResponse<Trip>>("/api/trips", undefined, params),
    detail: (tripId: string) => request<Trip>(`/api/trips/${tripId}`),
    create: (input: CreateTripInput) => request<Trip>("/api/trips", { method: "POST", body: body(input) }),
    update: (tripId: string, input: UpdateTripInput) =>
      request<Trip>(`/api/trips/${tripId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string) => {
      await request<void>(`/api/trips/${tripId}`, { method: "DELETE" });
      return { id: tripId };
    }
  },

  stops: {
    list: (tripId: string) => request<ListResponse<Stop>>(`/api/trips/${tripId}/stops`),
    create: (tripId: string, input: CreateStopInput) =>
      request<Stop>(`/api/trips/${tripId}/stops`, { method: "POST", body: body(input) }),
    update: (tripId: string, stopId: string, input: UpdateStopInput) =>
      request<Stop>(`/api/trips/${tripId}/stops/${stopId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string, stopId: string) => {
      await request<void>(`/api/trips/${tripId}/stops/${stopId}`, { method: "DELETE" });
      return { id: stopId };
    },
    reorder: (tripId: string, stops: Array<{ id: string; position: number }>) =>
      request<Stop[]>(`/api/trips/${tripId}/stops/reorder`, { method: "PATCH", body: body({ stops }) })
  },

  activities: {
    list: (tripId: string, params?: QueryParams) => request<ListResponse<Activity>>(`/api/trips/${tripId}/activities`, undefined, params),
    create: (tripId: string, input: CreateActivityInput) =>
      request<Activity>(`/api/trips/${tripId}/activities`, { method: "POST", body: body(input) }),
    update: (tripId: string, activityId: string, input: UpdateActivityInput) =>
      request<Activity>(`/api/trips/${tripId}/activities/${activityId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string, activityId: string) => {
      await request<void>(`/api/trips/${tripId}/activities/${activityId}`, { method: "DELETE" });
      return { id: activityId };
    }
  },

  expenses: {
    list: (tripId: string) => request<ListResponse<Expense>>(`/api/trips/${tripId}/expenses`),
    create: (tripId: string, input: CreateExpenseInput) =>
      request<Expense>(`/api/trips/${tripId}/expenses`, { method: "POST", body: body(input) }),
    update: (tripId: string, expenseId: string, input: UpdateExpenseInput) =>
      request<Expense>(`/api/trips/${tripId}/expenses/${expenseId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string, expenseId: string) => {
      await request<void>(`/api/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" });
      return { id: expenseId };
    }
  },

  packing: {
    list: (tripId: string) => request<ListResponse<PackingItem>>(`/api/trips/${tripId}/packing`),
    create: (tripId: string, input: CreatePackingItemInput) =>
      request<PackingItem>(`/api/trips/${tripId}/packing`, { method: "POST", body: body(input) }),
    update: (tripId: string, itemId: string, input: UpdatePackingItemInput) =>
      request<PackingItem>(`/api/trips/${tripId}/packing/${itemId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string, itemId: string) => {
      await request<void>(`/api/trips/${tripId}/packing/${itemId}`, { method: "DELETE" });
      return { id: itemId };
    }
  },

  notes: {
    list: (tripId: string) => request<ListResponse<NoteEntry>>(`/api/trips/${tripId}/notes`),
    create: (tripId: string, input: CreateNoteInput) =>
      request<NoteEntry>(`/api/trips/${tripId}/notes`, { method: "POST", body: body(input) }),
    update: (tripId: string, noteId: string, input: UpdateNoteInput) =>
      request<NoteEntry>(`/api/trips/${tripId}/notes/${noteId}`, { method: "PATCH", body: body(input) }),
    remove: async (tripId: string, noteId: string) => {
      await request<void>(`/api/trips/${tripId}/notes/${noteId}`, { method: "DELETE" });
      return { id: noteId };
    }
  },

  searchDestinations: (query: string, params?: QueryParams) =>
    request<ListResponse<Destination>>("/api/search/destinations", undefined, { q: query, ...params }),

  weather: (params: QueryParams) => request<WeatherForecast>("/api/weather", undefined, params),

  discoverActivities: (params: QueryParams) =>
    request<ActivityDiscoveryResult>("/api/discover/activities", undefined, params)
};
