// MockData+Expenses.swift
// Traveloop – Mock Data (Expenses, Checklists, Summaries)
// Financial tracking and packing data for the Paris & Rome trip.

import Foundation

extension MockData {

    // MARK: - Date helper

    private static func ed(_ month: Int, _ day: Int, _ hour: Int = 12, _ min: Int = 0) -> Date {
        var c = DateComponents()
        c.year = 2026; c.month = month; c.day = day; c.hour = hour; c.minute = min
        c.timeZone = TimeZone(identifier: "Europe/Paris")
        return Calendar.current.date(from: c) ?? Date()
    }

    // MARK: - Expenses

    static let expenses: [Expense] = [
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Hôtel Le Marais (5 nights)", amount: 925, currency: "EUR", convertedAmount: 925,
                category: .accommodation, date: ed(7,10,15), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 925), receipt: nil, notes: nil, location: "Paris", isRecurring: false, tags: ["Accommodation"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Air France DEL → CDG", amount: 485, currency: "EUR", convertedAmount: 485,
                category: .transport, date: ed(7,10,1), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 485), receipt: nil, notes: "Per person", location: nil, isRecurring: false, tags: ["Flight"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Montmartre Walking Tour", amount: 75, currency: "EUR", convertedAmount: 75,
                category: .activities, date: ed(7,10,17), paidBy: companionSophie.id,
                splitAmong: evenSplit(amount: 75), receipt: nil, notes: "3 tickets × €25", location: "Montmartre, Paris", isRecurring: false, tags: ["Tour"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Dinner at Le Consulat", amount: 135, currency: "EUR", convertedAmount: 135,
                category: .food, date: ed(7,10,20), paidBy: companionMarco.id,
                splitAmong: evenSplit(amount: 135), receipt: ReceiptInfo(imageName: nil, merchantName: "Le Consulat", merchantAddress: "18 Rue Norvins", scannedTotal: 135),
                notes: nil, location: "Montmartre, Paris", isRecurring: false, tags: ["Dinner"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Eiffel Tower Tickets", amount: 105, currency: "EUR", convertedAmount: 105,
                category: .activities, date: ed(7,11,9), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 105), receipt: nil, notes: "3 × €35 skip-the-line", location: "Eiffel Tower, Paris", isRecurring: false, tags: ["Tickets"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Seine River Cruise", amount: 54, currency: "EUR", convertedAmount: 54,
                category: .activities, date: ed(7,11,18), paidBy: companionSophie.id,
                splitAmong: evenSplit(amount: 54), receipt: nil, notes: nil, location: "Port de la Conférence, Paris", isRecurring: false, tags: ["Cruise"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Louvre Museum Entry", amount: 66, currency: "EUR", convertedAmount: 66,
                category: .activities, date: ed(7,12,9), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 66), receipt: nil, notes: "3 × €22", location: "Louvre, Paris", isRecurring: false, tags: ["Museum"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Trenitalia Paris → Rome", amount: 360, currency: "EUR", convertedAmount: 360,
                category: .transport, date: ed(7,15,8), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 360), receipt: nil, notes: "3 × €120", location: nil, isRecurring: false, tags: ["Train"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Trastevere Food Tour", amount: 195, currency: "EUR", convertedAmount: 195,
                category: .food, date: ed(7,15,17), paidBy: companionMarco.id,
                splitAmong: evenSplit(amount: 195), receipt: nil, notes: "3 × €65", location: "Trastevere, Rome", isRecurring: false, tags: ["Tour", "Food"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Colosseum Priority Tickets", amount: 72, currency: "EUR", convertedAmount: 72,
                category: .activities, date: ed(7,16,8), paidBy: companionSophie.id,
                splitAmong: evenSplit(amount: 72), receipt: nil, notes: "3 × €24 underground access", location: "Colosseum, Rome", isRecurring: false, tags: ["Tickets"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Vatican Museums Entry", amount: 60, currency: "EUR", convertedAmount: 60,
                category: .activities, date: ed(7,17,8), paidBy: currentUser.id,
                splitAmong: evenSplit(amount: 60), receipt: nil, notes: nil, location: "Vatican City", isRecurring: false, tags: ["Museum"]),
        Expense(id: UUID(), tripId: parisRomeTrip.id, title: "Daily Gelato Fund ☀️", amount: 48, currency: "EUR", convertedAmount: 48,
                category: .food, date: ed(7,18,11), paidBy: companionMarco.id,
                splitAmong: evenSplit(amount: 48), receipt: nil, notes: "~€4/day × 4 days × 3 ppl", location: "Various, Rome", isRecurring: true, tags: ["Gelato"]),
    ]

    /// Evenly splits an amount among the 3 travellers.
    private static func evenSplit(amount: Decimal) -> [ExpenseSplit] {
        let share = amount / 3
        return [
            ExpenseSplit(id: UUID(), companionId: currentUser.id, companionName: currentUser.fullName, share: share, isPaid: true),
            ExpenseSplit(id: UUID(), companionId: companionSophie.id, companionName: companionSophie.name, share: share, isPaid: false),
            ExpenseSplit(id: UUID(), companionId: companionMarco.id, companionName: companionMarco.name, share: share, isPaid: false),
        ]
    }

    // MARK: - Daily Expense Summaries (for charts)

    static let dailyExpenseSummaries: [DailyExpenseSummary] = [
        DailyExpenseSummary(id: UUID(), date: ed(7,10), totalSpent: 695, expenseCount: 3, topCategory: .accommodation, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,11), totalSpent: 199, expenseCount: 3, topCategory: .activities, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,12), totalSpent: 158, expenseCount: 3, topCategory: .activities, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,13), totalSpent: 78,  expenseCount: 2, topCategory: .food, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,14), totalSpent: 36,  expenseCount: 2, topCategory: .activities, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,15), totalSpent: 555, expenseCount: 2, topCategory: .transport, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,16), totalSpent: 117, expenseCount: 2, topCategory: .activities, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,17), totalSpent: 90,  expenseCount: 2, topCategory: .activities, currency: "EUR"),
        DailyExpenseSummary(id: UUID(), date: ed(7,18), totalSpent: 48,  expenseCount: 1, topCategory: .food, currency: "EUR"),
    ]

    // MARK: - Category Breakdown (for pie/donut chart)

    static let categoryBreakdown: [CategoryBreakdown] = [
        CategoryBreakdown(id: UUID(), category: .accommodation, totalAmount: 925, percentage: 0.34, transactionCount: 1, currency: "EUR"),
        CategoryBreakdown(id: UUID(), category: .transport, totalAmount: 845, percentage: 0.31, transactionCount: 2, currency: "EUR"),
        CategoryBreakdown(id: UUID(), category: .activities, totalAmount: 432, percentage: 0.16, transactionCount: 5, currency: "EUR"),
        CategoryBreakdown(id: UUID(), category: .food, totalAmount: 378, percentage: 0.14, transactionCount: 3, currency: "EUR"),
        CategoryBreakdown(id: UUID(), category: .shopping, totalAmount: 80,  percentage: 0.03, transactionCount: 1, currency: "EUR"),
        CategoryBreakdown(id: UUID(), category: .miscellaneous, totalAmount: 50, percentage: 0.02, transactionCount: 2, currency: "EUR"),
    ]

    // MARK: - Packing Checklist

    static let packingChecklist: Checklist = {
        let tripDate = ed(7, 9)
        return Checklist(
            id: UUID(), tripId: parisRomeTrip.id, title: "Paris & Rome Packing", type: .packing,
            items: [
                // Essentials
                ChecklistItem(id: UUID(), title: "Passport", isCompleted: true, category: .essentials, quantity: 1, priority: .critical, notes: "Check expiry > 6 months", assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,1)),
                ChecklistItem(id: UUID(), title: "Travel Insurance Docs", isCompleted: true, category: .essentials, quantity: 1, priority: .critical, notes: nil, assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,1)),
                ChecklistItem(id: UUID(), title: "Credit Cards (2x)", isCompleted: true, category: .essentials, quantity: 2, priority: .critical, notes: "Notify bank of travel dates", assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,1)),
                ChecklistItem(id: UUID(), title: "Cash — €200", isCompleted: false, category: .essentials, quantity: 1, priority: .high, notes: "Small denominations for tips", assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,1)),
                // Clothing
                ChecklistItem(id: UUID(), title: "T-Shirts", isCompleted: true, category: .clothing, quantity: 6, priority: .medium, notes: "Light fabrics — July heat", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,5)),
                ChecklistItem(id: UUID(), title: "Walking Shorts", isCompleted: true, category: .clothing, quantity: 3, priority: .medium, notes: nil, assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,5)),
                ChecklistItem(id: UUID(), title: "Light Jacket", isCompleted: false, category: .clothing, quantity: 1, priority: .medium, notes: "For Seine cruise / AC trains", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,5)),
                ChecklistItem(id: UUID(), title: "Comfortable Walking Shoes", isCompleted: true, category: .clothing, quantity: 1, priority: .high, notes: "Broken-in pair!", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,5)),
                ChecklistItem(id: UUID(), title: "Smart Outfit (Vatican)", isCompleted: false, category: .clothing, quantity: 1, priority: .high, notes: "Covered shoulders & knees required", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,5)),
                // Toiletries
                ChecklistItem(id: UUID(), title: "Sunscreen SPF 50", isCompleted: true, category: .toiletries, quantity: 1, priority: .high, notes: nil, assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,8)),
                ChecklistItem(id: UUID(), title: "Toothbrush & Paste", isCompleted: false, category: .toiletries, quantity: 1, priority: .medium, notes: nil, assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,8)),
                // Electronics
                ChecklistItem(id: UUID(), title: "Phone Charger + Cable", isCompleted: true, category: .electronics, quantity: 1, priority: .critical, notes: nil, assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,8)),
                ChecklistItem(id: UUID(), title: "EU Power Adaptor", isCompleted: false, category: .electronics, quantity: 2, priority: .high, notes: "Type C / Type F plugs", assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,8)),
                ChecklistItem(id: UUID(), title: "Camera + SD Cards", isCompleted: true, category: .electronics, quantity: 1, priority: .medium, notes: "Format cards before trip", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,8)),
                ChecklistItem(id: UUID(), title: "Portable Battery Pack", isCompleted: true, category: .electronics, quantity: 1, priority: .medium, notes: "Fully charge night before", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,8)),
                // Documents
                ChecklistItem(id: UUID(), title: "Flight Boarding Passes", isCompleted: false, category: .documents, quantity: 1, priority: .critical, notes: "Download offline copies", assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,10)),
                ChecklistItem(id: UUID(), title: "Hotel Confirmation Print", isCompleted: false, category: .documents, quantity: 2, priority: .high, notes: nil, assignedTo: nil, assignedName: nil, dueDate: tripDate, createdAt: ed(6,10)),
                // Health
                ChecklistItem(id: UUID(), title: "Medications & First Aid Kit", isCompleted: false, category: .health, quantity: 1, priority: .high, notes: "Paracetamol, band-aids, antihistamine", assignedTo: nil, assignedName: nil, dueDate: nil, createdAt: ed(6,12)),
            ],
            createdAt: ed(6, 1)
        )
    }()

    // MARK: - Pre-Trip Tasks Checklist

    static let preTripChecklist: Checklist = {
        let tripDate = ed(7, 9)
        return Checklist(
            id: UUID(), tripId: parisRomeTrip.id, title: "Pre-Trip Tasks", type: .preTasks,
            items: [
                ChecklistItem(id: UUID(), title: "Book Eiffel Tower skip-the-line", isCompleted: true, category: .preTripTask, quantity: 1, priority: .high, notes: nil, assignedTo: currentUser.id, assignedName: currentUser.fullName, dueDate: ed(6,15), createdAt: ed(5,10)),
                ChecklistItem(id: UUID(), title: "Reserve Louvre time slot", isCompleted: true, category: .preTripTask, quantity: 1, priority: .high, notes: "9 AM slot booked", assignedTo: currentUser.id, assignedName: currentUser.fullName, dueDate: ed(6,20), createdAt: ed(5,10)),
                ChecklistItem(id: UUID(), title: "Book Vatican early-bird entry", isCompleted: true, category: .preTripTask, quantity: 1, priority: .high, notes: nil, assignedTo: companionSophie.id, assignedName: companionSophie.name, dueDate: ed(6,25), createdAt: ed(5,10)),
                ChecklistItem(id: UUID(), title: "Notify bank of travel dates", isCompleted: true, category: .preTripTask, quantity: 1, priority: .critical, notes: "Jul 10–20, France & Italy", assignedTo: currentUser.id, assignedName: currentUser.fullName, dueDate: ed(7,1), createdAt: ed(5,10)),
                ChecklistItem(id: UUID(), title: "Download offline maps", isCompleted: false, category: .preTripTask, quantity: 1, priority: .medium, notes: "Paris + Rome in Google Maps", assignedTo: companionMarco.id, assignedName: companionMarco.name, dueDate: ed(7,8), createdAt: ed(5,10)),
                ChecklistItem(id: UUID(), title: "Arrange airport transfer", isCompleted: false, category: .preTripTask, quantity: 1, priority: .high, notes: "CDG → Hotel, early morning arrival", assignedTo: currentUser.id, assignedName: currentUser.fullName, dueDate: ed(7,5), createdAt: ed(5,15)),
            ],
            createdAt: ed(5, 10)
        )
    }()

    /// All checklists for the trip.
    static let allChecklists: [Checklist] = [packingChecklist, preTripChecklist]
}
