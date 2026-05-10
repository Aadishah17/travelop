import type {
  ActivityDiscoveryResponse,
  DestinationResult,
  DestinationSearchResponse,
  LiveProviderStatus,
  WeatherForecast,
} from "@/types/live-data";

type MapboxFeature = {
  id: string;
  place_name?: string;
  text?: string;
  place_type?: string[];
  center?: [number, number];
  context?: Array<{ id?: string; text?: string; short_code?: string }>;
};

type OpenWeatherItem = {
  dt_txt: string;
  main: { temp_min: number; temp_max: number };
  weather: Array<{ description: string; icon?: string }>;
};

type DestinationSearchInput = {
  q: string;
  limit: number;
  country?: string;
  region?: string;
  type?: "city" | "region" | "country" | "locality" | "place";
};

type ActivityDiscoveryInput = {
  location: string;
  query: string;
  limit: number;
  lat?: number;
  lon?: number;
  category?: string;
  price?: string;
};

function providerStatus(
  provider: LiveProviderStatus["provider"],
  configured: boolean,
  ok: boolean,
  message?: string,
): LiveProviderStatus {
  return { provider, configured, ok, message };
}

function mapboxType(type?: DestinationSearchInput["type"]) {
  if (type === "city") return "place";
  if (type === "place") return "poi,place,locality";
  return type ?? "place,region,country,locality";
}

function contextValue(feature: MapboxFeature, prefix: string) {
  return feature.context?.find((item) => item.id?.startsWith(prefix));
}

function featureType(feature: MapboxFeature): DestinationResult["type"] {
  const primary = feature.place_type?.[0];
  if (primary === "place") return "city";
  if (primary === "region" || primary === "country" || primary === "locality") return primary;
  return "place";
}

export async function searchDestinations(input: DestinationSearchInput): Promise<DestinationSearchResponse> {
  const token = process.env.MAPBOX_TOKEN;

  if (!token) {
    return {
      items: [],
      providers: [providerStatus("mapbox", false, false, "MAPBOX_TOKEN is not configured.")],
    };
  }

  const params = new URLSearchParams({
    access_token: token,
    autocomplete: "true",
    fuzzyMatch: "true",
    limit: String(input.limit),
    types: mapboxType(input.type),
  });

  if (input.country) params.set("country", input.country.toLowerCase());

  const query = [input.q, input.region].filter(Boolean).join(" ");
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`,
    { next: { revalidate: 60 * 60 } },
  );

  if (!response.ok) {
    return {
      items: [],
      providers: [providerStatus("mapbox", true, false, `Mapbox returned ${response.status}.`)],
    };
  }

  const payload = (await response.json()) as { features?: MapboxFeature[] };
  const items = (payload.features ?? []).map((feature) => {
    const country = contextValue(feature, "country");
    const region = contextValue(feature, "region");

    return {
      id: feature.id,
      mapboxId: feature.id,
      name: feature.text ?? feature.place_name ?? "Unknown destination",
      fullName: feature.place_name ?? feature.text ?? "Unknown destination",
      country: country?.text,
      countryCode: country?.short_code?.toUpperCase(),
      region: region?.text,
      longitude: feature.center?.[0],
      latitude: feature.center?.[1],
      type: featureType(feature),
      source: "mapbox" as const,
    };
  });

  return {
    items,
    providers: [providerStatus("mapbox", true, true)],
  };
}

export async function getWeatherForecast(input: {
  location?: string;
  lat?: number;
  lon?: number;
}): Promise<WeatherForecast | null> {
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key || (!input.location && (input.lat === undefined || input.lon === undefined))) {
    return null;
  }

  const params = new URLSearchParams({
    appid: key,
    units: "metric",
  });

  if (input.location) {
    params.set("q", input.location);
  } else {
    params.set("lat", String(input.lat));
    params.set("lon", String(input.lon));
  }

  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`, {
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    city?: { name?: string; country?: string };
    list?: OpenWeatherItem[];
  };

  const byDate = new Map<string, OpenWeatherItem[]>();

  for (const item of payload.list ?? []) {
    const date = item.dt_txt.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), item]);
  }

  return {
    location: [payload.city?.name, payload.city?.country].filter(Boolean).join(", ") || input.location || "Requested location",
    days: Array.from(byDate.entries()).map(([date, items]) => {
      const temperatures = items.flatMap((item) => [item.main.temp_min, item.main.temp_max]);
      const noonish = items[Math.floor(items.length / 2)];

      return {
        date,
        minCelsius: Math.min(...temperatures),
        maxCelsius: Math.max(...temperatures),
        description: noonish?.weather[0]?.description ?? "Forecast unavailable",
        icon: noonish?.weather[0]?.icon,
      };
    }),
  };
}

export async function discoverActivities(input: ActivityDiscoveryInput): Promise<ActivityDiscoveryResponse> {
  const providerResults = await Promise.allSettled([
    searchGooglePlaces(input),
    searchYelp(input),
    searchTicketmaster(input),
  ]);

  const items = providerResults
    .flatMap((result) => (result.status === "fulfilled" ? result.value.items : []))
    .filter((activity, index, all) => all.findIndex((item) => `${item.source}:${item.providerId ?? item.id}` === `${activity.source}:${activity.providerId ?? activity.id}`) === index)
    .slice(0, input.limit);
  const providers = providerResults.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.providers
      : [providerStatus("google_places", true, false, result.reason instanceof Error ? result.reason.message : "Provider failed.")],
  );

  return { items, providers };
}

async function searchGooglePlaces(input: ActivityDiscoveryInput): Promise<ActivityDiscoveryResponse> {
  const key = process.env.GOOGLE_PLACES_API_KEY;

  if (!key) {
    return {
      items: [],
      providers: [providerStatus("google_places", false, false, "GOOGLE_PLACES_API_KEY is not configured.")],
    };
  }

  const params = new URLSearchParams({
    key,
    query: [input.query, input.location].filter(Boolean).join(" "),
  });

  if (input.lat !== undefined && input.lon !== undefined) {
    params.set("location", `${input.lat},${input.lon}`);
    params.set("radius", "12000");
  }

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return {
      items: [],
      providers: [providerStatus("google_places", true, false, `Google Places returned ${response.status}.`)],
    };
  }

  const payload = (await response.json()) as {
    status?: string;
    error_message?: string;
    results?: Array<{
      place_id: string;
      name: string;
      formatted_address?: string;
      rating?: number;
      user_ratings_total?: number;
      price_level?: number;
      types?: string[];
      photos?: Array<{ photo_reference: string }>;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  };

  if (payload.status && !["OK", "ZERO_RESULTS"].includes(payload.status)) {
    return {
      items: [],
      providers: [providerStatus("google_places", true, false, payload.error_message ?? payload.status)],
    };
  }

  return {
    items: (payload.results ?? []).slice(0, input.limit).map((place) => ({
      id: `google-${place.place_id}`,
      providerId: place.place_id,
      title: place.name,
      category: place.types?.[0]?.replaceAll("_", " ") ?? "Attraction",
      address: place.formatted_address,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      price: place.price_level ? "$".repeat(place.price_level) : undefined,
      imageUrl: place.photos?.[0]?.photo_reference
        ? `/api/live/places/photo?reference=${encodeURIComponent(place.photos[0].photo_reference)}`
        : undefined,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
      source: "google_places",
    })),
    providers: [providerStatus("google_places", true, true)],
  };
}

async function searchYelp(input: ActivityDiscoveryInput): Promise<ActivityDiscoveryResponse> {
  const key = process.env.YELP_API_KEY;

  if (!key) {
    return {
      items: [],
      providers: [providerStatus("yelp", false, false, "YELP_API_KEY is not configured.")],
    };
  }

  const params = new URLSearchParams({
    location: input.location,
    term: input.query,
    limit: String(Math.min(input.limit, 20)),
    sort_by: "best_match",
  });

  if (input.lat !== undefined && input.lon !== undefined) {
    params.delete("location");
    params.set("latitude", String(input.lat));
    params.set("longitude", String(input.lon));
  }

  if (input.price) params.set("price", input.price);
  if (input.category) params.set("categories", input.category);

  const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${key}` },
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    return {
      items: [],
      providers: [providerStatus("yelp", true, false, `Yelp returned ${response.status}.`)],
    };
  }

  const payload = (await response.json()) as {
    businesses?: Array<{
      id: string;
      name: string;
      url?: string;
      image_url?: string;
      rating?: number;
      review_count?: number;
      price?: string;
      categories?: Array<{ title: string }>;
      coordinates?: { latitude?: number; longitude?: number };
      location?: { display_address?: string[] };
    }>;
  };

  return {
    items: (payload.businesses ?? []).map((business) => ({
      id: `yelp-${business.id}`,
      providerId: business.id,
      title: business.name,
      category: business.categories?.[0]?.title ?? "Restaurant",
      address: business.location?.display_address?.join(", "),
      latitude: business.coordinates?.latitude,
      longitude: business.coordinates?.longitude,
      rating: business.rating,
      reviewCount: business.review_count,
      price: business.price,
      imageUrl: business.image_url,
      url: business.url,
      source: "yelp",
    })),
    providers: [providerStatus("yelp", true, true)],
  };
}

async function searchTicketmaster(input: ActivityDiscoveryInput): Promise<ActivityDiscoveryResponse> {
  const key = process.env.TICKETMASTER_API_KEY;

  if (!key) {
    return {
      items: [],
      providers: [providerStatus("ticketmaster", false, false, "TICKETMASTER_API_KEY is not configured.")],
    };
  }

  const params = new URLSearchParams({
    apikey: key,
    keyword: input.query,
    city: input.location.split(",")[0]?.trim() || input.location,
    size: String(Math.min(input.limit, 20)),
    sort: "relevance,desc",
  });

  if (input.lat !== undefined && input.lon !== undefined) {
    params.set("latlong", `${input.lat},${input.lon}`);
    params.delete("city");
  }

  const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`, {
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    return {
      items: [],
      providers: [providerStatus("ticketmaster", true, false, `Ticketmaster returned ${response.status}.`)],
    };
  }

  const payload = (await response.json()) as {
    _embedded?: {
      events?: Array<{
        id: string;
        name: string;
        url?: string;
        images?: Array<{ url: string; width?: number; height?: number }>;
        dates?: { start?: { dateTime?: string; localDate?: string } };
        priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
        classifications?: Array<{ segment?: { name?: string } }>;
        _embedded?: {
          venues?: Array<{
            name?: string;
            city?: { name?: string };
            country?: { name?: string };
            location?: { latitude?: string; longitude?: string };
          }>;
        };
      }>;
    };
  };

  return {
    items: (payload._embedded?.events ?? []).map((event) => {
      const venue = event._embedded?.venues?.[0];
      const price = event.priceRanges?.[0];
      const image = event.images?.toSorted((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];

      return {
        id: `ticketmaster-${event.id}`,
        providerId: event.id,
        title: event.name,
        category: event.classifications?.[0]?.segment?.name ?? "Event",
        address: [venue?.name, venue?.city?.name, venue?.country?.name].filter(Boolean).join(", ") || undefined,
        latitude: venue?.location?.latitude ? Number(venue.location.latitude) : undefined,
        longitude: venue?.location?.longitude ? Number(venue.location.longitude) : undefined,
        price:
          price?.min !== undefined
            ? `${price.currency ?? "USD"} ${Math.round(price.min)}${price.max ? `-${Math.round(price.max)}` : ""}`
            : undefined,
        imageUrl: image?.url,
        url: event.url,
        startsAt: event.dates?.start?.dateTime ?? event.dates?.start?.localDate,
        source: "ticketmaster",
      };
    }),
    providers: [providerStatus("ticketmaster", true, true)],
  };
}
