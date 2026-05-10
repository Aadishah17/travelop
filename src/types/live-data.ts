export type DestinationResult = {
  id: string;
  name: string;
  fullName: string;
  country?: string;
  countryCode?: string;
  region?: string;
  type?: "city" | "region" | "country" | "locality" | "place";
  latitude?: number;
  longitude?: number;
  mapboxId?: string;
  source: "mapbox";
};

export type WeatherForecast = {
  location: string;
  days: Array<{
    date: string;
    minCelsius: number;
    maxCelsius: number;
    description: string;
    icon?: string;
  }>;
};

export type DiscoveredActivity = {
  id: string;
  title: string;
  category: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  price?: string;
  imageUrl?: string;
  url?: string;
  startsAt?: string;
  providerId?: string;
  source: "google_places" | "yelp" | "ticketmaster";
};

export type LiveProviderStatus = {
  provider: "mapbox" | "openweather" | "google_places" | "yelp" | "ticketmaster";
  configured: boolean;
  ok: boolean;
  message?: string;
};

export type DestinationSearchResponse = {
  items: DestinationResult[];
  providers: LiveProviderStatus[];
};

export type ActivityDiscoveryResponse = {
  items: DiscoveredActivity[];
  providers: LiveProviderStatus[];
};
