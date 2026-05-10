// Expense.swift
// Traveloop – Data Architecture
// Defines expense tracking, categories, split logic, and daily summaries.

import Foundation

// MARK: - Expense

/// A single recorded expenditure during a trip.
/// Drives: Budget screen expense list, Expense detail, Split-bill screen,
///         Category breakdown chart, Daily spending graph.
struct Expense: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var tripId: UUID
    var title: String
    var amount: Decimal
    var currency: String
    var convertedAmount: Decimal?    // In the trip's primary currency
    var category: ExpenseCategory
    var date: Date
    var paidBy: UUID                 // Companion ID who fronted the cost
    var splitAmong: [ExpenseSplit]
    var receipt: ReceiptInfo?
    var notes: String?
    var location: String?            // Freeform, e.g. "Café de Flore, Paris"
    var isRecurring: Bool
    var tags: [String]

    // MARK: Computed

    var formattedAmount: String {
        Self.formatter(for: currency).string(
            from: NSDecimalNumber(decimal: amount)
        ) ?? "\(currency) \(amount)"
    }

    var dateFormatted: String {
        let fmt = DateFormatter()
        fmt.dateStyle = .medium
        return fmt.string(from: date)
    }

    var timeFormatted: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "h:mm a"
        return fmt.string(from: date)
    }

    var splitCount: Int { splitAmong.count }

    var isEvenSplit: Bool {
        guard !splitAmong.isEmpty else { return true }
        let firstShare = splitAmong.first?.share
        return splitAmong.allSatisfy { $0.share == firstShare }
    }

    private static func formatter(for code: String) -> NumberFormatter {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = code
        fmt.maximumFractionDigits = 2
        return fmt
    }
}

// MARK: - Expense Category

enum ExpenseCategory: String, Codable, CaseIterable, Hashable, Sendable {
    case accommodation  = "Accommodation"
    case food           = "Food & Drinks"
    case transport      = "Transport"
    case activities     = "Activities"
    case shopping       = "Shopping"
    case health         = "Health"
    case communication  = "Communication"
    case tips           = "Tips"
    case insurance      = "Insurance"
    case miscellaneous  = "Miscellaneous"

    var icon: String {
        switch self {
        case .accommodation: return "bed.double"
        case .food:          return "fork.knife"
        case .transport:     return "car"
        case .activities:    return "ticket"
        case .shopping:      return "bag"
        case .health:        return "cross.case"
        case .communication: return "wifi"
        case .tips:          return "hand.thumbsup"
        case .insurance:     return "shield.checkered"
        case .miscellaneous: return "ellipsis.circle"
        }
    }

    var colorHex: String {
        switch self {
        case .accommodation: return "#004AC6"
        case .food:          return "#C44900"
        case .transport:     return "#006591"
        case .activities:    return "#6B4FA0"
        case .shopping:      return "#9B2335"
        case .health:        return "#D32F2F"
        case .communication: return "#1A6B8A"
        case .tips:          return "#006242"
        case .insurance:     return "#4B5275"
        case .miscellaneous: return "#8890AB"
        }
    }
}

// MARK: - Expense Split

/// How a single expense is divided among companions.
/// Drives: Split-bill screen per-person breakdown.
struct ExpenseSplit: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var companionId: UUID
    var companionName: String
    var share: Decimal
    var isPaid: Bool

    var formattedShare: String {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = "EUR"
        fmt.maximumFractionDigits = 2
        return fmt.string(from: NSDecimalNumber(decimal: share)) ?? "€\(share)"
    }
}

// MARK: - Receipt Info

/// Optional receipt metadata attached to an expense.
struct ReceiptInfo: Codable, Hashable, Sendable {
    var imageName: String?           // Local asset or file name
    var merchantName: String?
    var merchantAddress: String?
    var scannedTotal: Decimal?
}

// MARK: - Daily Expense Summary

/// Aggregated expenses for a single day — used for the spending bar chart.
/// Drives: Budget screen daily chart, Expense timeline.
struct DailyExpenseSummary: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var date: Date
    var totalSpent: Decimal
    var expenseCount: Int
    var topCategory: ExpenseCategory
    var currency: String

    var dateLabel: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "d MMM"
        return fmt.string(from: date)
    }

    var dayOfWeek: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "EEE"
        return fmt.string(from: date)
    }

    var formattedTotal: String {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = currency
        fmt.maximumFractionDigits = 0
        return fmt.string(from: NSDecimalNumber(decimal: totalSpent)) ?? "\(currency) \(totalSpent)"
    }
}

// MARK: - Category Breakdown

/// Per-category spending aggregation for pie / donut charts.
/// Drives: Budget screen category chart.
struct CategoryBreakdown: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var category: ExpenseCategory
    var totalAmount: Decimal
    var percentage: Double            // 0.0 – 1.0
    var transactionCount: Int
    var currency: String
}
