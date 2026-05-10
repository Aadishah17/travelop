export const traveloopKeys = {
  all: ["traveloop"] as const,
  dashboard: (filters?: object) => [...traveloopKeys.all, "dashboard", filters ?? {}] as const,
  trips: () => [...traveloopKeys.all, "trips"] as const,
  tripList: (filters?: object) => [...traveloopKeys.trips(), "list", filters ?? {}] as const,
  trip: (tripId: string) => [...traveloopKeys.trips(), "detail", tripId] as const,
  stops: (tripId: string) => [...traveloopKeys.trip(tripId), "stops"] as const,
  activities: (tripId: string, filters?: object) => [...traveloopKeys.trip(tripId), "activities", filters ?? {}] as const,
  expenses: (tripId: string) => [...traveloopKeys.trip(tripId), "expenses"] as const,
  packing: (tripId: string) => [...traveloopKeys.trip(tripId), "packing"] as const,
  notes: (tripId: string) => [...traveloopKeys.trip(tripId), "notes"] as const,
  destinationSearch: (query: string, filters?: object) =>
    [...traveloopKeys.all, "destination-search", query, filters ?? {}] as const,
  weather: (filters: object) => [...traveloopKeys.all, "weather", filters] as const,
  activityDiscovery: (filters: object) => [...traveloopKeys.all, "activity-discovery", filters] as const
};
