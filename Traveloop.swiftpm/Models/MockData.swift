// MockData.swift
// Traveloop – Mock Data (Core)
// Provides realistic sample data for a "Paris & Rome" trip.
// Used across all 14 screens during development and previews.

import Foundation

// MARK: - Date Helper

extension MockData {
    /// Creates a Date relative to a reference "trip start" date.
    static func date(_ year: Int, _ month: Int, _ day: Int,
                     _ hour: Int = 0, _ minute: Int = 0) -> Date {
        var comps = DateComponents()
        comps.year = year; comps.month = month; comps.day = day
        comps.hour = hour; comps.minute = minute
        comps.timeZone = TimeZone(identifier: "Europe/Paris")
        return Calendar.current.date(from: comps) ?? Date()
    }
}

// MARK: - MockData Namespace

enum MockData {

    // MARK: - Companions

    static let companionSophie = Companion(
        id: UUID(uuidString: "A1A1A1A1-1111-1111-1111-AAAAAAAAAAAA")!,
        name: "Sophie Laurent",
        avatarURL: nil,
        email: "sophie@example.com",
        role: .traveller
    )

    static let companionMarco = Companion(
        id: UUID(uuidString: "B2B2B2B2-2222-2222-2222-BBBBBBBBBBBB")!,
        name: "Marco Bianchi",
        avatarURL: nil,
        email: "marco@example.com",
        role: .traveller
    )

    // MARK: - Current User

    static let currentUser = User(
        id: UUID(uuidString: "C3C3C3C3-3333-3333-3333-CCCCCCCCCCCC")!,
        firstName: "Aarav",
        lastName: "Sharma",
        email: "aarav@traveloop.app",
        avatarURL: nil,
        phoneNumber: "+91 98765 43210",
        dateOfBirth: date(1998, 5, 14),
        nationality: "IN",
        preferredCurrency: "EUR",
        preferences: TravelPreferences(
            travelStyle: .comfort,
            preferredActivities: [.sightseeing, .dining, .museum, .culture],
            dietaryRestrictions: ["Vegetarian"],
            accessibilityNeeds: [],
            notificationsEnabled: true,
            autoConvertCurrency: true
        ),
        stats: TravelStats(
            tripsCompleted: 12,
            countriesVisited: 9,
            citiesExplored: 23,
            totalDistanceKm: 47_500,
            totalDaysTravelled: 96,
            photosUploaded: 1_842
        ),
        memberSince: date(2024, 1, 15),
        isVerified: true
    )

    // MARK: - Accommodations

    static let parisHotel = Accommodation(
        id: UUID(uuidString: "D4D4D4D4-4444-4444-4444-DDDDDDDDDDDD")!,
        name: "Hôtel Le Marais Étoile",
        type: .hotel,
        address: "12 Rue de Rivoli, 75004 Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        checkIn: date(2026, 7, 10, 15, 0),
        checkOut: date(2026, 7, 15, 11, 0),
        confirmationCode: "HLM-78429",
        pricePerNight: 185,
        currency: "EUR",
        rating: 4.6,
        contactPhone: "+33 1 42 72 60 46",
        notes: "River-view room requested"
    )

    static let romeApartment = Accommodation(
        id: UUID(uuidString: "E5E5E5E5-5555-5555-5555-EEEEEEEEEEEE")!,
        name: "Trastevere Terrace Apartment",
        type: .apartment,
        address: "Via della Lungaretta 42, 00153 Roma",
        latitude: 41.8892,
        longitude: 12.4700,
        checkIn: date(2026, 7, 15, 14, 0),
        checkOut: date(2026, 7, 19, 10, 0),
        confirmationCode: "TTA-91053",
        pricePerNight: 145,
        currency: "EUR",
        rating: 4.8,
        contactPhone: "+39 06 580 3231",
        notes: "Rooftop terrace access included"
    )

    // MARK: - Destinations

    static let paris = Destination(
        id: UUID(uuidString: "F6F6F6F6-6666-6666-6666-FFFFFFFFFFFF")!,
        city: "Paris",
        country: "France",
        countryCode: "FR",
        latitude: 48.8566,
        longitude: 2.3522,
        arrivalDate: date(2026, 7, 10),
        departureDate: date(2026, 7, 15),
        accommodation: parisHotel,
        weatherSummary: "Partly Cloudy, 24°C",
        timeZoneIdentifier: "Europe/Paris"
    )

    static let rome = Destination(
        id: UUID(uuidString: "17171717-7777-7777-7777-111111111111")!,
        city: "Rome",
        country: "Italy",
        countryCode: "IT",
        latitude: 41.9028,
        longitude: 12.4964,
        arrivalDate: date(2026, 7, 15),
        departureDate: date(2026, 7, 19),
        accommodation: romeApartment,
        weatherSummary: "Sunny, 31°C",
        timeZoneIdentifier: "Europe/Rome"
    )

    // MARK: - Transportation

    static let flightToParisId = UUID(uuidString: "28282828-8888-8888-8888-222222222222")!
    static let trainParisToRomeId = UUID(uuidString: "39393939-9999-9999-9999-333333333333")!
    static let flightHomeId = UUID(uuidString: "4A4A4A4A-AAAA-AAAA-AAAA-444444444444")!

    static let transportation: [Transportation] = [
        Transportation(
            id: flightToParisId,
            type: .flight,
            provider: "Air France",
            referenceNumber: "AF1782",
            departureLocation: "DEL – Indira Gandhi Intl",
            arrivalLocation: "CDG – Charles de Gaulle",
            departureTime: date(2026, 7, 10, 1, 30),
            arrivalTime: date(2026, 7, 10, 7, 45),
            seatInfo: "14A, 14B, 14C – Economy Plus",
            price: 485,
            currency: "EUR",
            notes: "Meal: Vegetarian pre-ordered"
        ),
        Transportation(
            id: trainParisToRomeId,
            type: .train,
            provider: "Trenitalia Frecciarossa",
            referenceNumber: "TRN-90821",
            departureLocation: "Paris Gare de Lyon",
            arrivalLocation: "Roma Termini",
            departureTime: date(2026, 7, 15, 8, 15),
            arrivalTime: date(2026, 7, 15, 13, 30),
            seatInfo: "Coach 7, Seats 42-44",
            price: 120,
            currency: "EUR",
            notes: "Scenic Alpine route"
        ),
        Transportation(
            id: flightHomeId,
            type: .flight,
            provider: "Alitalia",
            referenceNumber: "AZ2046",
            departureLocation: "FCO – Fiumicino",
            arrivalLocation: "DEL – Indira Gandhi Intl",
            departureTime: date(2026, 7, 19, 14, 20),
            arrivalTime: date(2026, 7, 20, 3, 10),
            seatInfo: "22A, 22B, 22C – Economy",
            price: 410,
            currency: "EUR",
            notes: nil
        )
    ]

    // MARK: - Trip

    static let parisRomeTrip = Trip(
        id: UUID(uuidString: "5B5B5B5B-BBBB-BBBB-BBBB-555555555555")!,
        title: "Paris & Rome",
        description: "A 10-day journey through iconic European culture — from Parisian art and cuisine to Roman history and piazzas.",
        coverImageName: "airplane.departure",
        destinations: [paris, rome],
        startDate: date(2026, 7, 10),
        endDate: date(2026, 7, 19),
        companions: [
            Companion(id: currentUser.id, name: currentUser.fullName, avatarURL: nil, email: currentUser.email, role: .organiser),
            companionSophie,
            companionMarco
        ],
        status: .upcoming,
        budget: BudgetSummary(totalBudget: 4500, spent: 1940, currency: "EUR"),
        transportation: transportation,
        notes: "Remember: Museum passes, comfortable walking shoes, EU power adaptors.",
        tags: ["Europe", "Culture", "Food", "Summer 2026"],
        createdAt: date(2026, 5, 1),
        updatedAt: date(2026, 5, 10)
    )

    // MARK: - Secondary Trip (for home screen list)

    static let tokyoTrip = Trip(
        id: UUID(uuidString: "6C6C6C6C-CCCC-CCCC-CCCC-666666666666")!,
        title: "Tokyo Adventure",
        description: "Cherry blossoms, ramen, and neon lights.",
        coverImageName: "leaf",
        destinations: [
            Destination(
                id: UUID(), city: "Tokyo", country: "Japan", countryCode: "JP",
                latitude: 35.6762, longitude: 139.6503,
                arrivalDate: date(2026, 10, 5), departureDate: date(2026, 10, 12),
                accommodation: nil, weatherSummary: "Clear, 18°C",
                timeZoneIdentifier: "Asia/Tokyo"
            )
        ],
        startDate: date(2026, 10, 5),
        endDate: date(2026, 10, 12),
        companions: [
            Companion(id: currentUser.id, name: currentUser.fullName, avatarURL: nil, email: currentUser.email, role: .organiser)
        ],
        status: .draft,
        budget: BudgetSummary(totalBudget: 3000, spent: 0, currency: "JPY"),
        transportation: [],
        notes: "",
        tags: ["Asia", "Solo", "Food"],
        createdAt: date(2026, 5, 8),
        updatedAt: date(2026, 5, 8)
    )

    /// All trips for the home screen.
    static let allTrips: [Trip] = [parisRomeTrip, tokyoTrip]
}
