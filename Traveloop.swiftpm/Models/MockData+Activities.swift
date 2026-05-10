// MockData+Activities.swift
// Traveloop – Mock Data (Activities & Itinerary)
// Day-by-day itinerary for the Paris & Rome trip.

import Foundation

extension MockData {

    // MARK: - Date helper (local shorthand)

    private static func d(_ month: Int, _ day: Int, _ hour: Int, _ min: Int = 0) -> Date {
        var c = DateComponents()
        c.year = 2026; c.month = month; c.day = day; c.hour = hour; c.minute = min
        c.timeZone = TimeZone(identifier: "Europe/Paris")
        return Calendar.current.date(from: c) ?? Date()
    }

    // MARK: - Paris Activities (Days 1–5)

    static let parisActivities: [[Activity]] = [
        // Day 1 — Arrival & Montmartre
        [
            Activity(id: UUID(), title: "Check in at Hôtel Le Marais", description: "Settle in, freshen up after the flight.", category: .relaxation,
                     location: ActivityLocation(name: "Hôtel Le Marais Étoile", address: "12 Rue de Rivoli", latitude: 48.8566, longitude: 2.3522),
                     startTime: d(7,10,15), endTime: d(7,10,16), estimatedCost: nil, currency: "EUR", isBooked: true, bookingReference: "HLM-78429",
                     rating: nil, notes: nil, imageNames: ["bed.double"], isFavorite: false, status: .confirmed),
            Activity(id: UUID(), title: "Montmartre Walking Tour", description: "Explore Sacré-Cœur, Place du Tertre, and the artists' quarter.", category: .sightseeing,
                     location: ActivityLocation(name: "Sacré-Cœur", address: "35 Rue du Chevalier de la Barre", latitude: 48.8867, longitude: 2.3431),
                     startTime: d(7,10,17), endTime: d(7,10,19,30), estimatedCost: 25, currency: "EUR", isBooked: true, bookingReference: nil,
                     rating: nil, notes: "Wear comfortable shoes", imageNames: ["binoculars"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "Dinner at Le Consulat", description: "Classic French bistro on the hilltop.", category: .dining,
                     location: ActivityLocation(name: "Le Consulat", address: "18 Rue Norvins", latitude: 48.8863, longitude: 2.3406),
                     startTime: d(7,10,20), endTime: d(7,10,22), estimatedCost: 55, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: "Ask for terrace seating", imageNames: ["fork.knife"], isFavorite: false, status: .planned),
        ],
        // Day 2 — Eiffel Tower & Seine
        [
            Activity(id: UUID(), title: "Eiffel Tower Summit", description: "Skip-the-line tickets to the top.", category: .sightseeing,
                     location: ActivityLocation(name: "Eiffel Tower", address: "Champ de Mars, 5 Av. Anatole France", latitude: 48.8584, longitude: 2.2945),
                     startTime: d(7,11,9), endTime: d(7,11,11,30), estimatedCost: 35, currency: "EUR", isBooked: true, bookingReference: "ETK-44210",
                     rating: nil, notes: nil, imageNames: ["binoculars"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "Lunch at Café de Flore", description: "Iconic Left Bank café — croque monsieur and café crème.", category: .dining,
                     location: ActivityLocation(name: "Café de Flore", address: "172 Bd Saint-Germain", latitude: 48.8540, longitude: 2.3325),
                     startTime: d(7,11,12,30), endTime: d(7,11,14), estimatedCost: 40, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["fork.knife"], isFavorite: false, status: .planned),
            Activity(id: UUID(), title: "Seine River Cruise", description: "1-hour sunset cruise past Notre-Dame and the Louvre.", category: .sightseeing,
                     location: ActivityLocation(name: "Bateaux Mouches", address: "Port de la Conférence", latitude: 48.8638, longitude: 2.3062),
                     startTime: d(7,11,18), endTime: d(7,11,19,30), estimatedCost: 18, currency: "EUR", isBooked: true, bookingReference: "BM-7712",
                     rating: nil, notes: "Bring a light jacket", imageNames: ["water.waves"], isFavorite: true, status: .confirmed),
        ],
        // Day 3 — Louvre & Le Marais
        [
            Activity(id: UUID(), title: "The Louvre Museum", description: "Mona Lisa, Venus de Milo, and Egyptian antiquities.", category: .museum,
                     location: ActivityLocation(name: "Musée du Louvre", address: "Rue de Rivoli", latitude: 48.8606, longitude: 2.3376),
                     startTime: d(7,12,9), endTime: d(7,12,13), estimatedCost: 22, currency: "EUR", isBooked: true, bookingReference: "LVR-55031",
                     rating: nil, notes: "Enter via Passage Richelieu (shorter queue)", imageNames: ["building.columns"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "Falafel at L'As du Fallafel", description: "Best falafel in the Marais — always a queue, always worth it.", category: .dining,
                     location: ActivityLocation(name: "L'As du Fallafel", address: "34 Rue des Rosiers", latitude: 48.8570, longitude: 2.3580),
                     startTime: d(7,12,13,30), endTime: d(7,12,14,30), estimatedCost: 12, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["fork.knife"], isFavorite: false, status: .planned),
            Activity(id: UUID(), title: "Le Marais Vintage Shopping", description: "Browse boutiques and vintage stores.", category: .shopping,
                     location: ActivityLocation(name: "Le Marais", address: "Rue des Francs-Bourgeois", latitude: 48.8580, longitude: 2.3600),
                     startTime: d(7,12,15,30), endTime: d(7,12,18), estimatedCost: 80, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["bag"], isFavorite: false, status: .planned),
        ],
        // Day 4 — Versailles Day Trip
        [
            Activity(id: UUID(), title: "Palace of Versailles", description: "Full-day excursion: Hall of Mirrors, gardens, Grand Trianon.", category: .culture,
                     location: ActivityLocation(name: "Château de Versailles", address: "Place d'Armes, Versailles", latitude: 48.8049, longitude: 2.1204),
                     startTime: d(7,13,9), endTime: d(7,13,16), estimatedCost: 30, currency: "EUR", isBooked: true, bookingReference: "VRS-33017",
                     rating: nil, notes: "RER C from Saint-Michel", imageNames: ["building.columns"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "Dinner at Le Petit Cler", description: "Neighbourhood gem on Rue Cler.", category: .dining,
                     location: ActivityLocation(name: "Le Petit Cler", address: "29 Rue Cler", latitude: 48.8573, longitude: 2.3005),
                     startTime: d(7,13,19,30), endTime: d(7,13,21,30), estimatedCost: 48, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["fork.knife"], isFavorite: false, status: .planned),
        ],
        // Day 5 — Musée d'Orsay & Departure
        [
            Activity(id: UUID(), title: "Musée d'Orsay", description: "Impressionist masterpieces: Monet, Renoir, Van Gogh.", category: .museum,
                     location: ActivityLocation(name: "Musée d'Orsay", address: "1 Rue de la Légion d'Honneur", latitude: 48.8600, longitude: 2.3266),
                     startTime: d(7,14,9,30), endTime: d(7,14,12), estimatedCost: 16, currency: "EUR", isBooked: true, bookingReference: "MO-88912",
                     rating: nil, notes: nil, imageNames: ["building.columns"], isFavorite: false, status: .confirmed),
            Activity(id: UUID(), title: "Farewell Pastries at Pierre Hermé", description: "Stock up on macarons for the train.", category: .dining,
                     location: ActivityLocation(name: "Pierre Hermé", address: "72 Rue Bonaparte", latitude: 48.8510, longitude: 2.3340),
                     startTime: d(7,14,13), endTime: d(7,14,14), estimatedCost: 20, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["cup.and.saucer"], isFavorite: true, status: .planned),
        ],
    ]

    // MARK: - Rome Activities (Days 6–9)

    static let romeActivities: [[Activity]] = [
        // Day 6 — Arrival & Trastevere
        [
            Activity(id: UUID(), title: "Check in at Trastevere Apartment", description: "Settle into the rooftop terrace apartment.", category: .relaxation,
                     location: ActivityLocation(name: "Trastevere Terrace", address: "Via della Lungaretta 42", latitude: 41.8892, longitude: 12.4700),
                     startTime: d(7,15,14), endTime: d(7,15,15), estimatedCost: nil, currency: "EUR", isBooked: true, bookingReference: "TTA-91053",
                     rating: nil, notes: nil, imageNames: ["house"], isFavorite: false, status: .confirmed),
            Activity(id: UUID(), title: "Trastevere Food Tour", description: "Guided walking tour: supplì, pasta, gelato, and wine.", category: .dining,
                     location: ActivityLocation(name: "Piazza di Santa Maria", address: "Trastevere", latitude: 41.8895, longitude: 12.4693),
                     startTime: d(7,15,17), endTime: d(7,15,20), estimatedCost: 65, currency: "EUR", isBooked: true, bookingReference: "TFT-20145",
                     rating: nil, notes: "Meet at the fountain", imageNames: ["fork.knife"], isFavorite: true, status: .confirmed),
        ],
        // Day 7 — Colosseum & Forum
        [
            Activity(id: UUID(), title: "Colosseum & Roman Forum", description: "Priority access. Underground level + arena floor.", category: .sightseeing,
                     location: ActivityLocation(name: "Colosseum", address: "Piazza del Colosseo", latitude: 41.8902, longitude: 12.4922),
                     startTime: d(7,16,8,30), endTime: d(7,16,12), estimatedCost: 24, currency: "EUR", isBooked: true, bookingReference: "COL-67234",
                     rating: nil, notes: "Bring water — no shade", imageNames: ["building.columns"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "Lunch at Roscioli", description: "Legendary Roman deli & restaurant.", category: .dining,
                     location: ActivityLocation(name: "Roscioli", address: "Via dei Giubbonari 21", latitude: 41.8950, longitude: 12.4735),
                     startTime: d(7,16,12,30), endTime: d(7,16,14), estimatedCost: 45, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: "Try the cacio e pepe", imageNames: ["fork.knife"], isFavorite: false, status: .planned),
            Activity(id: UUID(), title: "Palatine Hill Sunset", description: "Golden hour views over the Forum.", category: .photography,
                     location: ActivityLocation(name: "Palatine Hill", address: "Via di San Gregorio", latitude: 41.8892, longitude: 12.4874),
                     startTime: d(7,16,17,30), endTime: d(7,16,19,30), estimatedCost: nil, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["camera"], isFavorite: true, status: .planned),
        ],
        // Day 8 — Vatican City
        [
            Activity(id: UUID(), title: "Vatican Museums & Sistine Chapel", description: "Early-bird entry before the crowds.", category: .museum,
                     location: ActivityLocation(name: "Vatican Museums", address: "Viale Vaticano", latitude: 41.9065, longitude: 12.4536),
                     startTime: d(7,17,8), endTime: d(7,17,12), estimatedCost: 20, currency: "EUR", isBooked: true, bookingReference: "VAT-10298",
                     rating: nil, notes: "Dress code: covered shoulders & knees", imageNames: ["building.columns"], isFavorite: true, status: .confirmed),
            Activity(id: UUID(), title: "St. Peter's Basilica Dome Climb", description: "551 steps to a panoramic view of Rome.", category: .adventure,
                     location: ActivityLocation(name: "St. Peter's Basilica", address: "Piazza San Pietro", latitude: 41.9022, longitude: 12.4539),
                     startTime: d(7,17,13), endTime: d(7,17,14,30), estimatedCost: 10, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["figure.hiking"], isFavorite: false, status: .planned),
            Activity(id: UUID(), title: "Aperitivo at Castel Sant'Angelo", description: "Negroni with a fortress view.", category: .nightlife,
                     location: ActivityLocation(name: "Castel Sant'Angelo", address: "Lungotevere Castello", latitude: 41.9031, longitude: 12.4663),
                     startTime: d(7,17,18), endTime: d(7,17,20), estimatedCost: 30, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: nil, imageNames: ["moon.stars"], isFavorite: false, status: .planned),
        ],
        // Day 9 — Trevi, Pantheon & Departure
        [
            Activity(id: UUID(), title: "Trevi Fountain & Pantheon Walk", description: "Morning stroll through Rome's iconic landmarks.", category: .sightseeing,
                     location: ActivityLocation(name: "Trevi Fountain", address: "Piazza di Trevi", latitude: 41.9009, longitude: 12.4833),
                     startTime: d(7,18,8,30), endTime: d(7,18,10,30), estimatedCost: nil, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: "Toss a coin!", imageNames: ["binoculars"], isFavorite: true, status: .planned),
            Activity(id: UUID(), title: "Gelato at Giolitti", description: "Rome's most famous gelateria since 1890.", category: .dining,
                     location: ActivityLocation(name: "Giolitti", address: "Via degli Uffici del Vicario 40", latitude: 41.8993, longitude: 12.4787),
                     startTime: d(7,18,11), endTime: d(7,18,11,45), estimatedCost: 8, currency: "EUR", isBooked: false, bookingReference: nil,
                     rating: nil, notes: "Try pistachio + stracciatella", imageNames: ["cup.and.saucer"], isFavorite: false, status: .planned),
        ],
    ]

    // MARK: - Full Itinerary

    static var parisRomeItinerary: Itinerary {
        let allDays = parisActivities + romeActivities
        let dayTitles = [
            "Arrival in Paris",
            "Eiffel Tower & Seine",
            "Art & Le Marais",
            "Versailles Day Trip",
            "Orsay & Au Revoir Paris",
            "Benvenuti a Roma",
            "Ancient Rome",
            "Vatican City",
            "Arrivederci Roma"
        ]
        let days: [ItineraryDay] = allDays.enumerated().map { idx, acts in
            ItineraryDay(
                id: UUID(),
                dayNumber: idx + 1,
                date: date(2026, 7, 10 + idx),
                title: dayTitles[idx],
                activities: acts,
                notes: nil
            )
        }
        return Itinerary(
            id: UUID(),
            tripId: parisRomeTrip.id,
            days: days
        )
    }
}
