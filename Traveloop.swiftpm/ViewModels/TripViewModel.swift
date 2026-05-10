// TripViewModel.swift
// Traveloop – MVVM View Model
// Central observable state for trip data, navigation, and user session.
// Drives: HomeScreen, ItineraryBuilder, Budget, Packing — all read from here.

import SwiftUI

// MARK: - Navigation Destination

/// Type-safe navigation destinations used with NavigationStack path.
enum AppDestination: Hashable {
    case itinerary(Trip)
    case budgetInsights(Trip)
    case packingChecklist(Trip)
    case expenseInvoice(Trip)
    case activityDetail(Activity)
}

// MARK: - Trip View Model

/// The single source of truth for trip-related state across the app.
/// Injected via `.environmentObject()` at the root level so every
/// child screen can read/write without prop-drilling.
///
/// Architecture note: This replaces scattered `@State` properties
/// with a unified, testable state container following MVVM.
@MainActor
final class TripViewModel: ObservableObject {

    // ─── Published State ───────────────────────────────────────

    /// All trips available to the current user.
    @Published var trips: [Trip]

    /// The currently selected / featured trip (hero banner).
    @Published var selectedTrip: Trip

    /// Full itinerary for the selected trip.
    @Published var itinerary: Itinerary

    /// All expenses for the selected trip.
    @Published var expenses: [Expense]

    /// Packing checklist items (mutable for toggle).
    @Published var packingItems: [ChecklistItem]

    /// Current user session.
    @Published var currentUser: User

    // ─── Navigation State ──────────────────────────────────────

    /// NavigationStack path for the Home tab.
    @Published var homePath: [AppDestination] = []

    // ─── Loading / Error ───────────────────────────────────────

    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // ─── Init ──────────────────────────────────────────────────

    init() {
        // Bootstrap from MockData — swap for a real service layer later.
        self.trips        = MockData.allTrips
        self.selectedTrip = MockData.parisRomeTrip
        self.itinerary    = MockData.parisRomeItinerary
        self.expenses     = MockData.expenses
        self.packingItems = MockData.packingChecklist.items
        self.currentUser  = MockData.currentUser
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Navigation Actions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// Push to itinerary for a specific trip.
    func navigateToItinerary(for trip: Trip) {
        homePath.append(.itinerary(trip))
    }

    /// Push to budget insights.
    func navigateToBudget(for trip: Trip) {
        homePath.append(.budgetInsights(trip))
    }

    /// Push to packing checklist.
    func navigateToPacking(for trip: Trip) {
        homePath.append(.packingChecklist(trip))
    }

    /// Push to expense invoice.
    func navigateToInvoice(for trip: Trip) {
        homePath.append(.expenseInvoice(trip))
    }

    /// Pop to root.
    func popToRoot() {
        homePath.removeAll()
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Packing Actions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// Toggle a packing item's completion state.
    func togglePackingItem(_ item: ChecklistItem) {
        if let index = packingItems.firstIndex(where: { $0.id == item.id }) {
            packingItems[index].isCompleted.toggle()
        }
    }

    /// Packing progress (0.0 – 1.0).
    var packingProgress: Double {
        guard !packingItems.isEmpty else { return 0 }
        return Double(packingItems.filter(\.isCompleted).count) / Double(packingItems.count)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Budget Computed Properties
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// Total spent across all expenses.
    var totalSpent: Decimal {
        expenses.reduce(0) { $0 + $1.amount }
    }

    /// Spending by category.
    var spendingByCategory: [ExpenseCategory: Decimal] {
        Dictionary(grouping: expenses, by: \.category)
            .mapValues { $0.reduce(0) { $0 + $1.amount } }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Data Refresh
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// Simulates a data refresh (swap for real API call later).
    func refreshData() async {
        isLoading = true
        errorMessage = nil

        // Simulate network latency
        try? await Task.sleep(nanoseconds: 800_000_000)

        // Re-fetch from mock (replace with real service)
        trips        = MockData.allTrips
        selectedTrip = MockData.parisRomeTrip
        itinerary    = MockData.parisRomeItinerary
        expenses     = MockData.expenses

        isLoading = false
    }
}
