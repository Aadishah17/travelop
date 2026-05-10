// User.swift
// Traveloop – Data Architecture
// Defines the authenticated user profile, preferences, and travel statistics.

import Foundation

// MARK: - User

/// Represents an authenticated Traveloop user.
/// Drives: Profile screen, Settings screen, Trip companions list, Social/sharing features.
struct User: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var firstName: String
    var lastName: String
    var email: String
    var avatarURL: URL?
    var phoneNumber: String?
    var dateOfBirth: Date?
    var nationality: String?

    /// Preferred currency code (ISO 4217), e.g. "USD", "EUR"
    var preferredCurrency: String
    var preferences: TravelPreferences
    var stats: TravelStats
    var memberSince: Date
    var isVerified: Bool

    var fullName: String { "\(firstName) \(lastName)" }
    var initials: String {
        let f = firstName.prefix(1).uppercased()
        let l = lastName.prefix(1).uppercased()
        return "\(f)\(l)"
    }
}

// MARK: - Travel Preferences

/// User-configurable travel preferences for personalisation.
/// Drives: Onboarding screen, Settings screen, Recommendation engine.
struct TravelPreferences: Codable, Hashable, Sendable {
    var travelStyle: TravelStyle
    var preferredActivities: [ActivityCategory]
    var dietaryRestrictions: [String]
    var accessibilityNeeds: [String]
    var notificationsEnabled: Bool
    var autoConvertCurrency: Bool
}

enum TravelStyle: String, Codable, CaseIterable, Hashable, Sendable {
    case budget       = "Budget"
    case comfort      = "Comfort"
    case luxury       = "Luxury"
    case backpacker   = "Backpacker"
    case adventure    = "Adventure"

    var icon: String {
        switch self {
        case .budget:     return "dollarsign.circle"
        case .comfort:    return "sofa"
        case .luxury:     return "crown"
        case .backpacker: return "figure.hiking"
        case .adventure:  return "mountain.2"
        }
    }
}

// MARK: - Travel Stats

/// Aggregated lifetime travel statistics.
/// Drives: Profile screen stats cards, Achievements/Badges.
struct TravelStats: Codable, Hashable, Sendable {
    var tripsCompleted: Int
    var countriesVisited: Int
    var citiesExplored: Int
    var totalDistanceKm: Double
    var totalDaysTravelled: Int
    var photosUploaded: Int

    var formattedDistance: String {
        if totalDistanceKm >= 1_000 {
            return String(format: "%.1fk km", totalDistanceKm / 1_000)
        }
        return "\(Int(totalDistanceKm)) km"
    }
}

// MARK: - Companion (Lightweight User Reference)

/// A lightweight reference to another user travelling on the same trip.
/// Drives: Trip detail companions section, Expense split screen.
struct Companion: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var name: String
    var avatarURL: URL?
    var email: String?
    var role: CompanionRole

    var initials: String {
        let parts = name.split(separator: " ")
        let f = parts.first?.prefix(1).uppercased() ?? ""
        let l = parts.count > 1 ? String(parts.last!.prefix(1)).uppercased() : ""
        return "\(f)\(l)"
    }
}

enum CompanionRole: String, Codable, CaseIterable, Hashable, Sendable {
    case organiser  = "Organiser"
    case traveller  = "Traveller"
    case viewer     = "Viewer"

    var icon: String {
        switch self {
        case .organiser: return "star.circle.fill"
        case .traveller: return "person.circle.fill"
        case .viewer:    return "eye.circle.fill"
        }
    }
}
