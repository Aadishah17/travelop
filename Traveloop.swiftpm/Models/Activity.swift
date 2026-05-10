// Activity.swift
// Traveloop – Data Architecture
// Defines activities, itinerary days, and the full day-by-day itinerary model.

import Foundation

// MARK: - Activity

/// A single scheduled event within an itinerary day.
/// Drives: Day timeline screen, Activity detail screen, Map pin overlay.
struct Activity: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var description: String
    var category: ActivityCategory
    var location: ActivityLocation
    var startTime: Date
    var endTime: Date?
    var estimatedCost: Decimal?
    var currency: String
    var isBooked: Bool
    var bookingReference: String?
    var rating: Double?               // User's personal rating 0.0–5.0
    var notes: String?
    var imageNames: [String]          // SF Symbols or asset names
    var isFavorite: Bool
    var status: ActivityStatus

    // MARK: Computed

    var durationFormatted: String {
        guard let end = endTime else { return "Open-ended" }
        let interval = end.timeIntervalSince(startTime)
        let hours   = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60
        if hours > 0 && minutes > 0 { return "\(hours)h \(minutes)m" }
        if hours > 0 { return "\(hours)h" }
        return "\(minutes)m"
    }

    var timeFormatted: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "h:mm a"
        return fmt.string(from: startTime)
    }

    var formattedCost: String? {
        guard let cost = estimatedCost else { return nil }
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = currency
        fmt.maximumFractionDigits = 0
        return fmt.string(from: NSDecimalNumber(decimal: cost))
    }
}

// MARK: - Activity Category

enum ActivityCategory: String, Codable, CaseIterable, Hashable, Sendable {
    case sightseeing    = "Sightseeing"
    case museum         = "Museum"
    case dining         = "Dining"
    case adventure      = "Adventure"
    case shopping       = "Shopping"
    case nightlife      = "Nightlife"
    case relaxation     = "Relaxation"
    case culture        = "Culture"
    case nature         = "Nature"
    case transport      = "Transport"
    case photography    = "Photography"
    case workshop       = "Workshop"

    var icon: String {
        switch self {
        case .sightseeing:  return "binoculars"
        case .museum:       return "building.columns"
        case .dining:       return "fork.knife"
        case .adventure:    return "figure.hiking"
        case .shopping:     return "bag"
        case .nightlife:    return "moon.stars"
        case .relaxation:   return "leaf"
        case .culture:      return "theatermasks"
        case .nature:       return "tree"
        case .transport:    return "airplane"
        case .photography:  return "camera"
        case .workshop:     return "paintpalette"
        }
    }

    var colorHex: String {
        switch self {
        case .sightseeing:  return "#004AC6"
        case .museum:       return "#6B4FA0"
        case .dining:       return "#C44900"
        case .adventure:    return "#006242"
        case .shopping:     return "#9B2335"
        case .nightlife:    return "#2D1B69"
        case .relaxation:   return "#006591"
        case .culture:      return "#8B5E3C"
        case .nature:       return "#2D7D46"
        case .transport:    return "#4B5275"
        case .photography:  return "#1A6B8A"
        case .workshop:     return "#A0522D"
        }
    }
}

// MARK: - Activity Status

enum ActivityStatus: String, Codable, CaseIterable, Hashable, Sendable {
    case planned    = "Planned"
    case confirmed  = "Confirmed"
    case inProgress = "In Progress"
    case completed  = "Completed"
    case skipped    = "Skipped"

    var icon: String {
        switch self {
        case .planned:    return "circle"
        case .confirmed:  return "checkmark.circle"
        case .inProgress: return "play.circle"
        case .completed:  return "checkmark.circle.fill"
        case .skipped:    return "forward.circle"
        }
    }
}

// MARK: - Activity Location

/// Geo-pinnable location for an activity.
struct ActivityLocation: Codable, Hashable, Sendable {
    var name: String               // "Eiffel Tower"
    var address: String?           // "Champ de Mars, 5 Av. Anatole France"
    var latitude: Double
    var longitude: Double
}

// MARK: - Itinerary Day

/// Groups activities for a single calendar day within a trip.
/// Drives: Day-by-day itinerary tabs, Timeline view.
struct ItineraryDay: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var dayNumber: Int             // 1-indexed
    var date: Date
    var title: String              // e.g. "Arrival in Paris"
    var activities: [Activity]
    var notes: String?

    var activityCount: Int { activities.count }

    var dateFormatted: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "EEEE, d MMM"
        return fmt.string(from: date)
    }

    var estimatedDayCost: Decimal {
        activities.compactMap(\.estimatedCost).reduce(0, +)
    }
}

// MARK: - Full Itinerary

/// The complete day-by-day plan for a trip.
/// Drives: Itinerary screen, Overview summary, Progress tracker.
struct Itinerary: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var tripId: UUID
    var days: [ItineraryDay]

    var totalActivities: Int {
        days.reduce(0) { $0 + $1.activityCount }
    }

    var completedActivities: Int {
        days.flatMap(\.activities).filter { $0.status == .completed }.count
    }

    var progressPercentage: Double {
        guard totalActivities > 0 else { return 0 }
        return Double(completedActivities) / Double(totalActivities)
    }

    var estimatedTotalCost: Decimal {
        days.reduce(0) { $0 + $1.estimatedDayCost }
    }

    func day(for number: Int) -> ItineraryDay? {
        days.first { $0.dayNumber == number }
    }
}
