// Trip.swift
// Traveloop – Data Architecture
// Defines the core Trip model with destinations, status, and metadata.

import Foundation

// MARK: - Trip

/// The central domain model — a multi-destination trip plan.
/// Drives: Home screen trip cards, Trip detail screen, Trip overview,
///         Map screen, Countdown timer, Trip status indicators.
struct Trip: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var description: String
    var coverImageName: String  // SF Symbol or asset catalogue name
    var destinations: [Destination]
    var startDate: Date
    var endDate: Date
    var companions: [Companion]
    var status: TripStatus
    var budget: BudgetSummary
    var transportation: [Transportation]
    var notes: String
    var tags: [String]
    var createdAt: Date
    var updatedAt: Date

    // MARK: Computed

    var totalDays: Int {
        Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 0
    }

    var totalNights: Int {
        max(totalDays - 1, 0)
    }

    var daysUntilDeparture: Int {
        let now = Date()
        return max(Calendar.current.dateComponents([.day], from: now, to: startDate).day ?? 0, 0)
    }

    var isUpcoming: Bool { status == .upcoming && startDate > Date() }
    var isActive: Bool   { status == .active }
    var isPast: Bool     { status == .completed }

    var dateRangeFormatted: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "d MMM"
        let start = fmt.string(from: startDate)
        fmt.dateFormat = "d MMM yyyy"
        let end = fmt.string(from: endDate)
        return "\(start) – \(end)"
    }

    var destinationNames: String {
        destinations.map(\.city).joined(separator: " → ")
    }
}

// MARK: - Trip Status

enum TripStatus: String, Codable, CaseIterable, Hashable, Sendable {
    case draft      = "Draft"
    case upcoming   = "Upcoming"
    case active     = "Active"
    case completed  = "Completed"
    case cancelled  = "Cancelled"

    var icon: String {
        switch self {
        case .draft:     return "doc.badge.ellipsis"
        case .upcoming:  return "calendar.badge.clock"
        case .active:    return "airplane.departure"
        case .completed: return "checkmark.seal.fill"
        case .cancelled: return "xmark.circle"
        }
    }

    var tintColorName: String {
        switch self {
        case .draft:     return "textTertiary"
        case .upcoming:  return "primary"
        case .active:    return "tertiary"
        case .completed: return "secondary"
        case .cancelled: return "textTertiary"
        }
    }
}

// MARK: - Destination

/// A single city/location within a multi-stop trip.
/// Drives: Destination cards, Map pins, Day-by-day itinerary grouping.
struct Destination: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var city: String
    var country: String
    var countryCode: String          // ISO 3166-1 alpha-2
    var latitude: Double
    var longitude: Double
    var arrivalDate: Date
    var departureDate: Date
    var accommodation: Accommodation?
    var weatherSummary: String?      // e.g. "Partly Cloudy, 22°C"
    var timeZoneIdentifier: String   // e.g. "Europe/Paris"

    var flag: String {
        countryCode
            .uppercased()
            .unicodeScalars
            .compactMap { UnicodeScalar(127397 + $0.value) }
            .map(String.init)
            .joined()
    }

    var nightsCount: Int {
        Calendar.current.dateComponents([.day], from: arrivalDate, to: departureDate).day ?? 0
    }
}

// MARK: - Accommodation

/// Where the traveller stays at a destination.
/// Drives: Accommodation card in trip detail, Booking confirmation screen.
struct Accommodation: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var name: String
    var type: AccommodationType
    var address: String
    var latitude: Double
    var longitude: Double
    var checkIn: Date
    var checkOut: Date
    var confirmationCode: String?
    var pricePerNight: Decimal
    var currency: String
    var rating: Double?            // 0.0–5.0
    var contactPhone: String?
    var notes: String?
}

enum AccommodationType: String, Codable, CaseIterable, Hashable, Sendable {
    case hotel      = "Hotel"
    case hostel     = "Hostel"
    case apartment  = "Apartment"
    case resort     = "Resort"
    case villa      = "Villa"
    case bnb        = "B&B"

    var icon: String {
        switch self {
        case .hotel:     return "building.2"
        case .hostel:    return "bed.double"
        case .apartment: return "house"
        case .resort:    return "beach.umbrella"
        case .villa:     return "house.lodge"
        case .bnb:       return "cup.and.saucer"
        }
    }
}

// MARK: - Transportation

/// Inter-city or intra-city transport segments.
/// Drives: Itinerary timeline connectors, Transport detail cards.
struct Transportation: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var type: TransportType
    var provider: String           // e.g. "Air France", "Trenitalia"
    var referenceNumber: String?   // Booking / PNR code
    var departureLocation: String
    var arrivalLocation: String
    var departureTime: Date
    var arrivalTime: Date
    var seatInfo: String?
    var price: Decimal
    var currency: String
    var notes: String?

    var durationFormatted: String {
        let interval = arrivalTime.timeIntervalSince(departureTime)
        let hours   = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }
}

enum TransportType: String, Codable, CaseIterable, Hashable, Sendable {
    case flight     = "Flight"
    case train      = "Train"
    case bus        = "Bus"
    case ferry      = "Ferry"
    case car        = "Car"
    case taxi       = "Taxi"
    case walk       = "Walk"
    case metro      = "Metro"

    var icon: String {
        switch self {
        case .flight: return "airplane"
        case .train:  return "tram"
        case .bus:    return "bus"
        case .ferry:  return "ferry"
        case .car:    return "car"
        case .taxi:   return "car.side"
        case .walk:   return "figure.walk"
        case .metro:  return "tram.tunnel.fill"
        }
    }
}

// MARK: - Budget Summary

/// Aggregated budget overview embedded in each trip.
/// Drives: Budget screen header, Trip card budget indicator.
struct BudgetSummary: Codable, Hashable, Sendable {
    var totalBudget: Decimal
    var spent: Decimal
    var currency: String

    var remaining: Decimal { totalBudget - spent }

    var spentPercentage: Double {
        guard totalBudget > 0 else { return 0 }
        return NSDecimalNumber(decimal: spent).doubleValue /
               NSDecimalNumber(decimal: totalBudget).doubleValue
    }

    var isOverBudget: Bool { spent > totalBudget }

    var formattedBudget: String {
        Self.currencyFormatter(for: currency).string(
            from: NSDecimalNumber(decimal: totalBudget)
        ) ?? "\(currency) \(totalBudget)"
    }

    var formattedSpent: String {
        Self.currencyFormatter(for: currency).string(
            from: NSDecimalNumber(decimal: spent)
        ) ?? "\(currency) \(spent)"
    }

    var formattedRemaining: String {
        Self.currencyFormatter(for: currency).string(
            from: NSDecimalNumber(decimal: remaining)
        ) ?? "\(currency) \(remaining)"
    }

    private static func currencyFormatter(for code: String) -> NumberFormatter {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = code
        fmt.maximumFractionDigits = 0
        return fmt
    }
}
