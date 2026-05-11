/**
 * Destination Photo Library
 * Maps destination names to curated Unsplash landmark photos.
 * Each entry uses a high-quality, royalty-free Unsplash image URL showing
 * the most iconic landmark of that destination.
 */

export interface DestinationPhoto {
  city: string;
  country: string;
  landmark: string;
  imageUrl: string;
  /** Optional tags for fuzzy matching */
  aliases?: string[];
}

const UNSPLASH_PARAMS = "auto=format&fit=crop&w=1200&q=80";

/**
 * Curated destination → landmark photo map.
 * All URLs are static Unsplash links (no API key required).
 */
export const DESTINATION_PHOTOS: DestinationPhoto[] = [
  // ── Asia ──
  { city: "Tokyo", country: "Japan", landmark: "Tokyo Tower & Skyline", imageUrl: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?${UNSPLASH_PARAMS}`, aliases: ["tokyo", "shinjuku", "shibuya"] },
  { city: "Kyoto", country: "Japan", landmark: "Fushimi Inari Shrine", imageUrl: `https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?${UNSPLASH_PARAMS}`, aliases: ["kyoto"] },
  { city: "Osaka", country: "Japan", landmark: "Osaka Castle", imageUrl: `https://images.unsplash.com/photo-1590559899731-a382839e5549?${UNSPLASH_PARAMS}`, aliases: ["osaka"] },
  { city: "Seoul", country: "South Korea", landmark: "Gyeongbokgung Palace", imageUrl: `https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?${UNSPLASH_PARAMS}`, aliases: ["seoul", "korea"] },
  { city: "Bangkok", country: "Thailand", landmark: "Wat Arun Temple", imageUrl: `https://images.unsplash.com/photo-1508009603885-50cf7c579365?${UNSPLASH_PARAMS}`, aliases: ["bangkok", "thailand"] },
  { city: "Singapore", country: "Singapore", landmark: "Marina Bay Sands", imageUrl: `https://images.unsplash.com/photo-1525625293386-3f8f99389edd?${UNSPLASH_PARAMS}`, aliases: ["singapore"] },
  { city: "Hong Kong", country: "China", landmark: "Victoria Harbour", imageUrl: `https://images.unsplash.com/photo-1536599018102-9f803c140fc1?${UNSPLASH_PARAMS}`, aliases: ["hong kong", "hongkong"] },
  { city: "Shanghai", country: "China", landmark: "The Bund Skyline", imageUrl: `https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?${UNSPLASH_PARAMS}`, aliases: ["shanghai"] },
  { city: "Beijing", country: "China", landmark: "Great Wall of China", imageUrl: `https://images.unsplash.com/photo-1508804185872-d7badad00f7d?${UNSPLASH_PARAMS}`, aliases: ["beijing", "peking", "great wall"] },
  { city: "Bali", country: "Indonesia", landmark: "Ulun Danu Beratan Temple", imageUrl: `https://images.unsplash.com/photo-1537996194471-e657df975ab4?${UNSPLASH_PARAMS}`, aliases: ["bali", "ubud", "denpasar"] },
  { city: "Hanoi", country: "Vietnam", landmark: "Hoan Kiem Lake", imageUrl: `https://images.unsplash.com/photo-1583417319070-4a69db38a482?${UNSPLASH_PARAMS}`, aliases: ["hanoi", "vietnam"] },
  { city: "Mumbai", country: "India", landmark: "Gateway of India", imageUrl: `https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?${UNSPLASH_PARAMS}`, aliases: ["mumbai", "bombay"] },
  { city: "New Delhi", country: "India", landmark: "India Gate", imageUrl: `https://images.unsplash.com/photo-1587474260584-136574528ed5?${UNSPLASH_PARAMS}`, aliases: ["delhi", "new delhi"] },
  { city: "Jaipur", country: "India", landmark: "Hawa Mahal", imageUrl: `https://images.unsplash.com/photo-1477587458883-47145ed94245?${UNSPLASH_PARAMS}`, aliases: ["jaipur", "pink city"] },
  { city: "Agra", country: "India", landmark: "Taj Mahal", imageUrl: `https://images.unsplash.com/photo-1564507592333-c60657eea523?${UNSPLASH_PARAMS}`, aliases: ["agra", "taj mahal"] },
  { city: "Dubai", country: "UAE", landmark: "Burj Khalifa", imageUrl: `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?${UNSPLASH_PARAMS}`, aliases: ["dubai", "uae"] },
  { city: "Kuala Lumpur", country: "Malaysia", landmark: "Petronas Towers", imageUrl: `https://images.unsplash.com/photo-1596422846543-75c6fc197f07?${UNSPLASH_PARAMS}`, aliases: ["kuala lumpur", "kl", "malaysia"] },
  { city: "Maldives", country: "Maldives", landmark: "Overwater Villas", imageUrl: `https://images.unsplash.com/photo-1514282401047-d79a71a590e8?${UNSPLASH_PARAMS}`, aliases: ["maldives", "male"] },
  { city: "Kathmandu", country: "Nepal", landmark: "Boudhanath Stupa", imageUrl: `https://images.unsplash.com/photo-1558799401-1dcba79834c2?${UNSPLASH_PARAMS}`, aliases: ["kathmandu", "nepal"] },

  // ── Europe ──
  { city: "Paris", country: "France", landmark: "Eiffel Tower", imageUrl: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?${UNSPLASH_PARAMS}`, aliases: ["paris", "eiffel tower"] },
  { city: "London", country: "United Kingdom", landmark: "Big Ben & Parliament", imageUrl: `https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?${UNSPLASH_PARAMS}`, aliases: ["london", "uk", "england", "big ben"] },
  { city: "Rome", country: "Italy", landmark: "Colosseum", imageUrl: `https://images.unsplash.com/photo-1552832230-c0197dd311b5?${UNSPLASH_PARAMS}`, aliases: ["rome", "roma", "colosseum"] },
  { city: "Venice", country: "Italy", landmark: "Grand Canal", imageUrl: `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?${UNSPLASH_PARAMS}`, aliases: ["venice", "venezia"] },
  { city: "Florence", country: "Italy", landmark: "Florence Cathedral", imageUrl: `https://images.unsplash.com/photo-1543429258-c5030ee63b33?${UNSPLASH_PARAMS}`, aliases: ["florence", "firenze"] },
  { city: "Barcelona", country: "Spain", landmark: "Sagrada Familia", imageUrl: `https://images.unsplash.com/photo-1583422409516-2895a77efded?${UNSPLASH_PARAMS}`, aliases: ["barcelona", "sagrada familia"] },
  { city: "Madrid", country: "Spain", landmark: "Royal Palace", imageUrl: `https://images.unsplash.com/photo-1539037116277-4db20889f2d4?${UNSPLASH_PARAMS}`, aliases: ["madrid"] },
  { city: "Amsterdam", country: "Netherlands", landmark: "Canal Houses", imageUrl: `https://images.unsplash.com/photo-1534351590666-13e3e96b5017?${UNSPLASH_PARAMS}`, aliases: ["amsterdam", "netherlands", "holland"] },
  { city: "Berlin", country: "Germany", landmark: "Brandenburg Gate", imageUrl: `https://images.unsplash.com/photo-1560969184-10fe8719e047?${UNSPLASH_PARAMS}`, aliases: ["berlin"] },
  { city: "Munich", country: "Germany", landmark: "Marienplatz", imageUrl: `https://images.unsplash.com/photo-1595867818082-083862f3d630?${UNSPLASH_PARAMS}`, aliases: ["munich", "munchen", "münchen"] },
  { city: "Prague", country: "Czech Republic", landmark: "Charles Bridge", imageUrl: `https://images.unsplash.com/photo-1519677100203-a0e668c92439?${UNSPLASH_PARAMS}`, aliases: ["prague", "praha"] },
  { city: "Vienna", country: "Austria", landmark: "Schönbrunn Palace", imageUrl: `https://images.unsplash.com/photo-1516550893923-42d28e5677af?${UNSPLASH_PARAMS}`, aliases: ["vienna", "wien"] },
  { city: "Budapest", country: "Hungary", landmark: "Hungarian Parliament", imageUrl: `https://images.unsplash.com/photo-1551867633-194f125bddfa?${UNSPLASH_PARAMS}`, aliases: ["budapest"] },
  { city: "Lisbon", country: "Portugal", landmark: "Belém Tower", imageUrl: `https://images.unsplash.com/photo-1585208798174-6cedd86e019a?${UNSPLASH_PARAMS}`, aliases: ["lisbon", "lisboa"] },
  { city: "Porto", country: "Portugal", landmark: "Ribeira District", imageUrl: `https://images.unsplash.com/photo-1555881400-74d7acaacd8b?${UNSPLASH_PARAMS}`, aliases: ["porto", "oporto"] },
  { city: "Athens", country: "Greece", landmark: "Acropolis", imageUrl: `https://images.unsplash.com/photo-1555993539-1732b0258235?${UNSPLASH_PARAMS}`, aliases: ["athens", "acropolis"] },
  { city: "Santorini", country: "Greece", landmark: "Oia Blue Domes", imageUrl: `https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?${UNSPLASH_PARAMS}`, aliases: ["santorini", "oia"] },
  { city: "Istanbul", country: "Turkey", landmark: "Hagia Sophia", imageUrl: `https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?${UNSPLASH_PARAMS}`, aliases: ["istanbul", "constantinople"] },
  { city: "Zürich", country: "Switzerland", landmark: "Lake Zurich & Alps", imageUrl: `https://images.unsplash.com/photo-1515488764276-beab7607c1e6?${UNSPLASH_PARAMS}`, aliases: ["zurich", "zürich"] },
  { city: "Edinburgh", country: "United Kingdom", landmark: "Edinburgh Castle", imageUrl: `https://images.unsplash.com/photo-1506377585622-bedcbb027afc?${UNSPLASH_PARAMS}`, aliases: ["edinburgh", "scotland"] },
  { city: "Dublin", country: "Ireland", landmark: "Temple Bar", imageUrl: `https://images.unsplash.com/photo-1549918864-48ac978761a4?${UNSPLASH_PARAMS}`, aliases: ["dublin", "ireland"] },
  { city: "Copenhagen", country: "Denmark", landmark: "Nyhavn", imageUrl: `https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?${UNSPLASH_PARAMS}`, aliases: ["copenhagen", "denmark"] },
  { city: "Stockholm", country: "Sweden", landmark: "Gamla Stan", imageUrl: `https://images.unsplash.com/photo-1509356843151-3e7d96241e11?${UNSPLASH_PARAMS}`, aliases: ["stockholm", "sweden"] },
  { city: "Oslo", country: "Norway", landmark: "Oslo Opera House", imageUrl: `https://images.unsplash.com/photo-1533928298208-27ff66555d8d?${UNSPLASH_PARAMS}`, aliases: ["oslo", "norway"] },
  { city: "Helsinki", country: "Finland", landmark: "Helsinki Cathedral", imageUrl: `https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?${UNSPLASH_PARAMS}`, aliases: ["helsinki", "finland"] },
  { city: "Reykjavik", country: "Iceland", landmark: "Hallgrímskirkja", imageUrl: `https://images.unsplash.com/photo-1504829857797-ddff29c27927?${UNSPLASH_PARAMS}`, aliases: ["reykjavik", "iceland"] },
  { city: "Dubrovnik", country: "Croatia", landmark: "Old Town Walls", imageUrl: `https://images.unsplash.com/photo-1555990538-1e6e5e0b4b0f?${UNSPLASH_PARAMS}`, aliases: ["dubrovnik", "croatia"] },
  { city: "Bruges", country: "Belgium", landmark: "Belfry of Bruges", imageUrl: `https://images.unsplash.com/photo-1491557345352-5929e343eb89?${UNSPLASH_PARAMS}`, aliases: ["bruges", "brugge"] },
  { city: "Warsaw", country: "Poland", landmark: "Old Town Market Square", imageUrl: `https://images.unsplash.com/photo-1519197924294-4ba991a11128?${UNSPLASH_PARAMS}`, aliases: ["warsaw", "warszawa"] },
  { city: "Krakow", country: "Poland", landmark: "Wawel Castle", imageUrl: `https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?${UNSPLASH_PARAMS}`, aliases: ["krakow", "cracow", "kraków"] },
  { city: "Moscow", country: "Russia", landmark: "St. Basil's Cathedral", imageUrl: `https://images.unsplash.com/photo-1513326738677-b964603b136d?${UNSPLASH_PARAMS}`, aliases: ["moscow", "moskva"] },

  // ── Americas ──
  { city: "New York", country: "USA", landmark: "Statue of Liberty", imageUrl: `https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?${UNSPLASH_PARAMS}`, aliases: ["new york", "nyc", "manhattan", "new york city"] },
  { city: "San Francisco", country: "USA", landmark: "Golden Gate Bridge", imageUrl: `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?${UNSPLASH_PARAMS}`, aliases: ["san francisco", "sf", "golden gate"] },
  { city: "Los Angeles", country: "USA", landmark: "Hollywood Sign", imageUrl: `https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?${UNSPLASH_PARAMS}`, aliases: ["los angeles", "la", "hollywood"] },
  { city: "Chicago", country: "USA", landmark: "Cloud Gate (The Bean)", imageUrl: `https://images.unsplash.com/photo-1494522855154-9297ac14b55f?${UNSPLASH_PARAMS}`, aliases: ["chicago"] },
  { city: "Washington DC", country: "USA", landmark: "Capitol Building", imageUrl: `https://images.unsplash.com/photo-1501466044931-62695aada8e9?${UNSPLASH_PARAMS}`, aliases: ["washington", "dc", "washington dc"] },
  { city: "Las Vegas", country: "USA", landmark: "The Strip", imageUrl: `https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?${UNSPLASH_PARAMS}`, aliases: ["las vegas", "vegas"] },
  { city: "Miami", country: "USA", landmark: "South Beach", imageUrl: `https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?${UNSPLASH_PARAMS}`, aliases: ["miami", "south beach"] },
  { city: "Havana", country: "Cuba", landmark: "El Capitolio", imageUrl: `https://images.unsplash.com/photo-1500759285222-a95626b934cb?${UNSPLASH_PARAMS}`, aliases: ["havana", "cuba"] },
  { city: "Mexico City", country: "Mexico", landmark: "Palacio de Bellas Artes", imageUrl: `https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?${UNSPLASH_PARAMS}`, aliases: ["mexico city", "cdmx", "mexico"] },
  { city: "Cancún", country: "Mexico", landmark: "Beach Resort", imageUrl: `https://images.unsplash.com/photo-1510097467424-192d713fd8b2?${UNSPLASH_PARAMS}`, aliases: ["cancun", "cancún"] },
  { city: "Rio de Janeiro", country: "Brazil", landmark: "Christ the Redeemer", imageUrl: `https://images.unsplash.com/photo-1483729558449-99ef09a8c325?${UNSPLASH_PARAMS}`, aliases: ["rio", "rio de janeiro"] },
  { city: "Buenos Aires", country: "Argentina", landmark: "La Boca", imageUrl: `https://images.unsplash.com/photo-1589909202802-8f4aadce1849?${UNSPLASH_PARAMS}`, aliases: ["buenos aires", "argentina"] },
  { city: "Lima", country: "Peru", landmark: "Plaza de Armas", imageUrl: `https://images.unsplash.com/photo-1531968455001-5c5272a41129?${UNSPLASH_PARAMS}`, aliases: ["lima", "peru"] },
  { city: "Machu Picchu", country: "Peru", landmark: "Inca Citadel", imageUrl: `https://images.unsplash.com/photo-1526392060635-9d6019884377?${UNSPLASH_PARAMS}`, aliases: ["machu picchu", "cusco", "cuzco"] },
  { city: "Toronto", country: "Canada", landmark: "CN Tower", imageUrl: `https://images.unsplash.com/photo-1517090504332-af70b38b15e3?${UNSPLASH_PARAMS}`, aliases: ["toronto"] },
  { city: "Vancouver", country: "Canada", landmark: "Stanley Park", imageUrl: `https://images.unsplash.com/photo-1559511260-66a68e6c8585?${UNSPLASH_PARAMS}`, aliases: ["vancouver"] },

  // ── Africa & Middle East ──
  { city: "Cairo", country: "Egypt", landmark: "Pyramids of Giza", imageUrl: `https://images.unsplash.com/photo-1539650116574-8efeb43e2750?${UNSPLASH_PARAMS}`, aliases: ["cairo", "egypt", "pyramids", "giza"] },
  { city: "Marrakech", country: "Morocco", landmark: "Jemaa el-Fnaa", imageUrl: `https://images.unsplash.com/photo-1597212720158-e83cf22fe3a8?${UNSPLASH_PARAMS}`, aliases: ["marrakech", "marrakesh", "morocco"] },
  { city: "Cape Town", country: "South Africa", landmark: "Table Mountain", imageUrl: `https://images.unsplash.com/photo-1580060839134-75a5edca2e99?${UNSPLASH_PARAMS}`, aliases: ["cape town", "south africa"] },
  { city: "Nairobi", country: "Kenya", landmark: "Nairobi National Park", imageUrl: `https://images.unsplash.com/photo-1611348524140-53c9a25263d6?${UNSPLASH_PARAMS}`, aliases: ["nairobi", "kenya"] },
  { city: "Jerusalem", country: "Israel", landmark: "Dome of the Rock", imageUrl: `https://images.unsplash.com/photo-1544735716-392fe2489ffa?${UNSPLASH_PARAMS}`, aliases: ["jerusalem", "israel"] },
  { city: "Petra", country: "Jordan", landmark: "The Treasury", imageUrl: `https://images.unsplash.com/photo-1579606032821-4e6161c81571?${UNSPLASH_PARAMS}`, aliases: ["petra", "jordan"] },

  // ── Oceania ──
  { city: "Sydney", country: "Australia", landmark: "Sydney Opera House", imageUrl: `https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?${UNSPLASH_PARAMS}`, aliases: ["sydney", "australia"] },
  { city: "Melbourne", country: "Australia", landmark: "Flinders Street Station", imageUrl: `https://images.unsplash.com/photo-1514395462725-fb4566210144?${UNSPLASH_PARAMS}`, aliases: ["melbourne"] },
  { city: "Auckland", country: "New Zealand", landmark: "Sky Tower", imageUrl: `https://images.unsplash.com/photo-1507699622108-4be3abd695ad?${UNSPLASH_PARAMS}`, aliases: ["auckland", "new zealand"] },
  { city: "Queenstown", country: "New Zealand", landmark: "Lake Wakatipu", imageUrl: `https://images.unsplash.com/photo-1589871973318-9ca1258faa3d?${UNSPLASH_PARAMS}`, aliases: ["queenstown"] },
];

/** Normalize input for matching */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Resolve a destination name to a photo.
 * Uses exact city match → alias match → fuzzy substring match.
 */
export function resolveDestinationPhoto(destination: string): DestinationPhoto | null {
  if (!destination?.trim()) return null;

  const query = normalize(destination);

  // 1. Exact city name match
  const exact = DESTINATION_PHOTOS.find(
    (d) => normalize(d.city) === query
  );
  if (exact) return exact;

  // 2. Alias match
  const aliasMatch = DESTINATION_PHOTOS.find(
    (d) => d.aliases?.some((alias) => alias === query)
  );
  if (aliasMatch) return aliasMatch;

  // 3. Check if query contains city name or alias
  const containsMatch = DESTINATION_PHOTOS.find(
    (d) =>
      query.includes(normalize(d.city)) ||
      d.aliases?.some((alias) => query.includes(alias))
  );
  if (containsMatch) return containsMatch;

  // 4. Check if city name or alias is contained in query
  const reverseMatch = DESTINATION_PHOTOS.find(
    (d) =>
      normalize(d.city).includes(query) ||
      d.aliases?.some((alias) => alias.includes(query))
  );
  if (reverseMatch) return reverseMatch;

  // 5. Country match (fallback to first destination in that country)
  const countryMatch = DESTINATION_PHOTOS.find(
    (d) => normalize(d.country) === query || normalize(d.country).includes(query)
  );
  if (countryMatch) return countryMatch;

  return null;
}

/**
 * Get just the image URL for a destination, or null.
 */
export function getDestinationImageUrl(destination: string): string | null {
  return resolveDestinationPhoto(destination)?.imageUrl ?? null;
}
