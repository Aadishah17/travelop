// ChecklistItem.swift
// Traveloop – Data Architecture
// Defines packing checklists, pre-trip checklists, and template support.

import Foundation

// MARK: - ChecklistItem

/// A single to-do / packing item within a checklist.
/// Drives: Packing screen item rows, Pre-trip checklist, Completion tracker.
struct ChecklistItem: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var isCompleted: Bool
    var category: ChecklistCategory
    var quantity: Int
    var priority: ChecklistPriority
    var notes: String?
    var assignedTo: UUID?            // Companion ID
    var assignedName: String?
    var dueDate: Date?
    var createdAt: Date

    var isOverdue: Bool {
        guard let due = dueDate, !isCompleted else { return false }
        return due < Date()
    }
}

// MARK: - Checklist Category

enum ChecklistCategory: String, Codable, CaseIterable, Hashable, Sendable {
    case essentials     = "Essentials"
    case clothing       = "Clothing"
    case toiletries     = "Toiletries"
    case electronics    = "Electronics"
    case documents      = "Documents"
    case health         = "Health"
    case entertainment  = "Entertainment"
    case snacks         = "Snacks"
    case accessories    = "Accessories"
    case preTripTask    = "Pre-Trip Task"

    var icon: String {
        switch self {
        case .essentials:    return "star"
        case .clothing:      return "tshirt"
        case .toiletries:    return "drop"
        case .electronics:   return "bolt"
        case .documents:     return "doc.text"
        case .health:        return "cross.case"
        case .entertainment: return "headphones"
        case .snacks:        return "cup.and.saucer"
        case .accessories:   return "sunglasses"
        case .preTripTask:   return "checklist"
        }
    }

    var colorHex: String {
        switch self {
        case .essentials:    return "#004AC6"
        case .clothing:      return "#6B4FA0"
        case .toiletries:    return "#006591"
        case .electronics:   return "#1A6B8A"
        case .documents:     return "#C44900"
        case .health:        return "#D32F2F"
        case .entertainment: return "#2D1B69"
        case .snacks:        return "#8B5E3C"
        case .accessories:   return "#9B2335"
        case .preTripTask:   return "#006242"
        }
    }
}

// MARK: - Checklist Priority

enum ChecklistPriority: String, Codable, CaseIterable, Comparable, Hashable, Sendable {
    case low      = "Low"
    case medium   = "Medium"
    case high     = "High"
    case critical = "Critical"

    var icon: String {
        switch self {
        case .low:      return "arrow.down"
        case .medium:   return "equal"
        case .high:     return "arrow.up"
        case .critical: return "exclamationmark.triangle"
        }
    }

    var sortOrder: Int {
        switch self {
        case .critical: return 0
        case .high:     return 1
        case .medium:   return 2
        case .low:      return 3
        }
    }

    static func < (lhs: ChecklistPriority, rhs: ChecklistPriority) -> Bool {
        lhs.sortOrder < rhs.sortOrder
    }
}

// MARK: - Checklist (Container)

/// Groups checklist items for a trip — supports both packing lists and pre-trip task lists.
/// Drives: Packing screen, Pre-trip checklist screen, Progress ring.
struct Checklist: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var tripId: UUID
    var title: String
    var type: ChecklistType
    var items: [ChecklistItem]
    var createdAt: Date

    // MARK: Computed

    var totalItems: Int { items.count }

    var completedItems: Int { items.filter(\.isCompleted).count }

    var progressPercentage: Double {
        guard totalItems > 0 else { return 0 }
        return Double(completedItems) / Double(totalItems)
    }

    var isFullyPacked: Bool { completedItems == totalItems }

    var overdueCount: Int { items.filter(\.isOverdue).count }

    var itemsByCategory: [ChecklistCategory: [ChecklistItem]] {
        Dictionary(grouping: items, by: \.category)
    }

    var criticalUnpacked: [ChecklistItem] {
        items.filter { !$0.isCompleted && $0.priority == .critical }
    }
}

enum ChecklistType: String, Codable, CaseIterable, Hashable, Sendable {
    case packing   = "Packing List"
    case preTasks  = "Pre-Trip Tasks"
    case shopping  = "Shopping List"

    var icon: String {
        switch self {
        case .packing:  return "suitcase"
        case .preTasks: return "checklist"
        case .shopping: return "cart"
        }
    }
}
