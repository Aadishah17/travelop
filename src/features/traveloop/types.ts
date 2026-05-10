export type TripStatus =
  | "draft"
  | "planned"
  | "active"
  | "completed"
  | "archived"
  | "DRAFT"
  | "PLANNED"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

export type TripViewMode = "overview" | "itinerary" | "map" | "budget" | "notes";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "AUD" | "CAD" | string;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

export interface Destination {
  id: string;
  name: string;
  country?: string;
  region?: string;
  description?: string;
  imageUrl?: string;
  coordinates?: GeoPoint;
  averageRating?: number;
  tags?: string[];
}

export interface Trip {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string | null;
  destination?: Destination | string | null;
  coverImageUrl?: string;
  coverImage?: string | null;
  destinationName?: string;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  endsAt?: string;
  travelers?: number;
  status?: TripStatus;
  budget?: MoneyAmount | number | string | null;
  spent?: MoneyAmount;
  currency?: CurrencyCode;
  visibility?: "PRIVATE" | "PUBLIC" | string;
  stopsCount?: number;
  activitiesCount?: number;
  stops?: Stop[];
  activities?: Activity[];
  expenses?: Expense[];
  packingItems?: PackingItem[];
  notes?: NoteEntry[];
  sharedItineraries?: Array<{ slug?: string; permission?: string }>;
  collaborators?: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
  updatedAt?: string;
  createdAt?: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  delta?: number;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}

export interface DashboardSummary {
  metrics: DashboardMetric[];
  upcomingTrips: Trip[];
  recentTrips: Trip[];
  recommendedDestinations?: Destination[];
  budgetByMonth?: BudgetDatum[];
}

export interface Stop {
  id: string;
  tripId: string;
  title: string;
  kind?: "CITY" | "REGION" | "LODGING" | "TRANSIT" | "CUSTOM" | string;
  city?: string;
  country?: string;
  address?: string;
  startsAt?: string;
  endsAt?: string;
  notes?: string;
  order?: number;
  position?: number;
  imageUrl?: string;
  coordinates?: GeoPoint;
  activities?: Activity[];
}

export type ActivityCategory =
  | "food"
  | "stay"
  | "flight"
  | "transport"
  | "tour"
  | "sightseeing"
  | "shopping"
  | "wellness"
  | "other"
  | "FOOD"
  | "TOUR"
  | "OUTDOOR"
  | "CULTURE"
  | "SHOPPING"
  | "NIGHTLIFE"
  | "TRANSPORT"
  | "LODGING"
  | "OTHER";

export interface Activity {
  id: string;
  tripId?: string;
  stopId?: string;
  title: string;
  description?: string;
  category?: ActivityCategory;
  imageUrl?: string;
  locationName?: string;
  startsAt?: string;
  endsAt?: string;
  durationMinutes?: number;
  price?: MoneyAmount;
  cost?: number | string | null;
  currency?: CurrencyCode;
  rating?: number;
  bookingUrl?: string;
  coordinates?: GeoPoint;
  isBooked?: boolean;
  completed?: boolean;
  order?: number;
  position?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  category: ActivityCategory | "insurance" | "visa" | "fees";
  amount: MoneyAmount | number | string;
  currency?: CurrencyCode;
  paidBy?: string;
  incurredAt?: string;
  date?: string;
  note?: string;
}

export interface BudgetDatum {
  name: string;
  planned: number;
  actual: number;
  category?: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  label: string;
  category?: string;
  customCategory?: string | null;
  quantity?: number;
  packed?: boolean;
  isPacked?: boolean;
  assignedTo?: string;
}

export interface NoteEntry {
  id: string;
  tripId: string;
  title?: string;
  body: string;
  journalDate?: string | null;
  mood?: "excited" | "calm" | "busy" | "tired" | "inspired";
  imageUrl?: string | null;
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WeatherDay {
  date: string;
  condition: string;
  icon?: string;
  highC: number;
  lowC: number;
  precipitationChance?: number;
  windKph?: number;
}

export interface WeatherForecast {
  destination: string;
  current?: {
    temperatureC: number;
    condition: string;
    icon?: string;
  };
  days: WeatherDay[];
}

export interface ActivityDiscoveryResult {
  activities: Activity[];
  destination?: Destination;
  nextCursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}

export type ListResponse<T> = T[] | PaginatedResult<T> | { data: T[] };

export type CreateTripInput = Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>;
export type UpdateTripInput = Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>;
export type CreateStopInput = Omit<Partial<Stop>, "id" | "tripId"> & Pick<Stop, "title">;
export type UpdateStopInput = Partial<Omit<Stop, "id" | "tripId">>;
export type CreateActivityInput = Omit<Partial<Activity>, "id" | "tripId"> & Pick<Activity, "title">;
export type UpdateActivityInput = Partial<Omit<Activity, "id" | "tripId">>;
export type CreateExpenseInput = Omit<Partial<Expense>, "id" | "tripId"> & Pick<Expense, "title" | "amount" | "category">;
export type UpdateExpenseInput = Partial<Omit<Expense, "id" | "tripId">>;
export type CreatePackingItemInput = Omit<Partial<PackingItem>, "id" | "tripId"> & Pick<PackingItem, "label">;
export type UpdatePackingItemInput = Partial<Omit<PackingItem, "id" | "tripId">>;
export type CreateNoteInput = Omit<Partial<NoteEntry>, "id" | "tripId" | "createdAt" | "updatedAt"> & Pick<NoteEntry, "body">;
export type UpdateNoteInput = Partial<Omit<NoteEntry, "id" | "tripId" | "createdAt" | "updatedAt">>;
