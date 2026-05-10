// ExpenseInvoiceScreen.swift
// Traveloop – Expense Invoice & Billing
// Premium SaaS-style invoice dashboard with glassmorphism.
// Features: Invoice header, traveller details, itemised cost table,
// financial summary, split breakdown, and actionable toolbar.

import SwiftUI

// MARK: - Expense Invoice Screen

struct ExpenseInvoiceScreen: View {

    // MARK: - Properties

    let trip: Trip
    private var expenses: [Expense] { MockData.expenses }
    private let user = MockData.currentUser
    private let invoiceID = "TRV-2026-07-0042"
    private let invoiceDate = Date()

    // MARK: - State

    @State private var appeared = false
    @State private var markedAsPaid = false
    @State private var showExportAlert = false
    @State private var showDownloadAlert = false
    @State private var selectedExpense: Expense?

    // MARK: - Computed

    private var subtotal: Decimal {
        expenses.reduce(0) { $0 + $1.amount }
    }
    private var taxRate: Decimal { 0.10 }
    private var taxAmount: Decimal { subtotal * taxRate }
    private var serviceCharge: Decimal { 15.00 }
    private var discount: Decimal { 45.00 }
    private var grandTotal: Decimal { subtotal + taxAmount + serviceCharge - discount }

    // MARK: - Body

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: Theme.Spacing.lg) {

                    // 1. Invoice Header
                    invoiceHeader
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -15)

                    // 2. Status & Actions Bar
                    statusActionsBar
                        .opacity(appeared ? 1 : 0)

                    // 3. Traveller Details Card
                    travellerDetailsCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // 4. Itemised Expense Table
                    expenseTable
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // 5. Financial Summary
                    financialSummaryCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // 6. Split Breakdown
                    splitBreakdownCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // 7. Footer
                    invoiceFooter
                        .opacity(appeared ? 1 : 0)
                }
                .padding(Theme.Spacing.md)
                .padding(.bottom, 110)
            }
        }
        .navigationTitle("Invoice")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { toolbarButtons }
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
        .alert("PDF Downloaded", isPresented: $showDownloadAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Invoice \(invoiceID) has been saved to your Files.")
        }
        .alert("Export Successful", isPresented: $showExportAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Invoice data exported as CSV to your email.")
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarButtons: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Menu {
                Button { showDownloadAlert = true } label: {
                    Label("Download PDF", systemImage: "arrow.down.doc")
                }
                Button { showExportAlert = true } label: {
                    Label("Export CSV", systemImage: "square.and.arrow.up")
                }
                Button { } label: {
                    Label("Share Invoice", systemImage: "paperplane")
                }
                Divider()
                Button { } label: {
                    Label("Print", systemImage: "printer")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.system(size: 17, weight: .medium))
                    .foregroundStyle(Theme.Color.textSecondary)
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Invoice Header
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var invoiceHeader: some View {
        GlassCard(style: .regular, shadow: Theme.Shadow.medium) {
            VStack(spacing: Theme.Spacing.md) {
                // Logo + Brand
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(Theme.Gradient.primaryHero)
                                    .frame(width: 36, height: 36)
                                Image(systemName: "globe.europe.africa")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundStyle(.white)
                            }
                            VStack(alignment: .leading, spacing: 0) {
                                Text("TRAVELOOP")
                                    .font(.system(size: 16, weight: .bold))
                                    .kerning(2)
                                    .foregroundStyle(Theme.Color.textPrimary)
                                Text("Travel Invoice")
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(Theme.Color.textTertiary)
                            }
                        }
                    }
                    Spacer()

                    // Invoice badge
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("INVOICE")
                            .font(.system(size: 10, weight: .bold))
                            .kerning(2)
                            .foregroundStyle(Theme.Color.primary)
                        Text(invoiceID)
                            .font(Theme.Typography.label)
                            .foregroundStyle(Theme.Color.textPrimary)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                            .fill(Theme.Color.primary.opacity(0.06))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                            .strokeBorder(Theme.Color.primary.opacity(0.12), lineWidth: 1)
                    )
                }

                Divider().background(Color.white.opacity(0.08))

                // Meta row
                HStack(spacing: Theme.Spacing.xl) {
                    invoiceMeta(label: "Issue Date", value: formattedDate(invoiceDate))
                    invoiceMeta(label: "Due Date", value: formattedDate(invoiceDate.addingTimeInterval(86400 * 30)))
                    invoiceMeta(label: "Trip", value: trip.title)
                }
            }
        }
    }

    private func invoiceMeta(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .bold))
                .kerning(0.8)
                .foregroundStyle(Theme.Color.textTertiary)
            Text(value)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Color.textPrimary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Status & Actions Bar
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var statusActionsBar: some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Status badge
            HStack(spacing: 6) {
                Circle()
                    .fill(markedAsPaid ? Color(hex: "#2D7D46") : Color(hex: "#C44900"))
                    .frame(width: 8, height: 8)
                Text(markedAsPaid ? "Paid" : "Pending")
                    .font(Theme.Typography.label)
                    .foregroundStyle(markedAsPaid ? Color(hex: "#2D7D46") : Color(hex: "#C44900"))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule().fill(
                    (markedAsPaid ? Color(hex: "#2D7D46") : Color(hex: "#C44900")).opacity(0.08)
                )
            )

            Spacer()

            // Download PDF
            Button {
                showDownloadAlert = true
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: "arrow.down.doc.fill")
                        .font(.system(size: 13, weight: .semibold))
                    Text("PDF")
                        .font(Theme.Typography.label)
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Capsule().fill(Theme.Gradient.primaryHero))
                .shadow(color: Theme.Color.primary.opacity(0.3), radius: 6, y: 3)
            }
            .buttonStyle(.plain)

            // Export
            Button {
                showExportAlert = true
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Export")
                        .font(Theme.Typography.label)
                }
                .foregroundStyle(Theme.Color.primary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Theme.Color.primary.opacity(0.08))
                )
                .overlay(Capsule().strokeBorder(Theme.Color.primary.opacity(0.15), lineWidth: 1))
            }
            .buttonStyle(.plain)

            // Mark as Paid toggle
            Button {
                withAnimation(Theme.Animation.fastSpring) { markedAsPaid.toggle() }
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            } label: {
                Image(systemName: markedAsPaid ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundStyle(markedAsPaid ? Color(hex: "#2D7D46") : Theme.Color.textTertiary)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 4)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Traveller Details Card
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var travellerDetailsCard: some View {
        GlassCard(style: .light, shadow: Theme.Shadow.soft) {
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                sectionHeader(title: "Traveller Details", icon: "person.text.rectangle")

                HStack(spacing: Theme.Spacing.md) {
                    // Billed To
                    VStack(alignment: .leading, spacing: 6) {
                        metaLabel("BILLED TO")
                        Text(user.fullName)
                            .font(Theme.Typography.subheadline)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Text(user.email)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textSecondary)
                        if let phone = user.phoneNumber {
                            Text(phone)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Color.textTertiary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // Trip Info
                    VStack(alignment: .leading, spacing: 6) {
                        metaLabel("TRIP DETAILS")
                        Text(trip.title)
                            .font(Theme.Typography.subheadline)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Text(trip.dateRangeFormatted)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textSecondary)
                        Text("\(trip.companions.count + 1) travellers · \(trip.destinations.count) cities")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Expense Table
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var expenseTable: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Section Header
            HStack {
                sectionHeader(title: "Itemised Expenses", icon: "list.bullet.rectangle")
                Spacer()
                Text("\(expenses.count) items")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.top, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.md)

            // Table Header Row
            tableHeaderRow
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.xs)

            Divider().background(Color.white.opacity(0.1))
                .padding(.horizontal, Theme.Spacing.md)

            // Expense Rows
            ForEach(Array(expenses.enumerated()), id: \.element.id) { index, expense in
                VStack(spacing: 0) {
                    expenseRow(expense: expense, index: index + 1)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.sm)

                    if index < expenses.count - 1 {
                        Divider().background(Color.white.opacity(0.05))
                            .padding(.horizontal, Theme.Spacing.xl)
                    }
                }
            }

            // Bottom padding
            Spacer().frame(height: Theme.Spacing.md)
        }
        .background(
            GlassSurface(style: .regular, cornerRadius: Theme.Radius.xl, applyShimmer: true)
        )
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
        .shadow(
            color: Theme.Color.shadowColor,
            radius: Theme.Shadow.soft.radius,
            x: Theme.Shadow.soft.x,
            y: Theme.Shadow.soft.y
        )
    }

    private var tableHeaderRow: some View {
        HStack(spacing: 0) {
            Text("#")
                .frame(width: 24, alignment: .leading)
            Text("DESCRIPTION")
                .frame(maxWidth: .infinity, alignment: .leading)
            Text("CATEGORY")
                .frame(width: 80, alignment: .center)
            Text("AMOUNT")
                .frame(width: 70, alignment: .trailing)
        }
        .font(.system(size: 9, weight: .bold))
        .kerning(0.8)
        .foregroundStyle(Theme.Color.textTertiary)
    }

    private func expenseRow(expense: Expense, index: Int) -> some View {
        HStack(spacing: 0) {
            // Index
            Text("\(index)")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Color.textTertiary)
                .frame(width: 24, alignment: .leading)

            // Description
            VStack(alignment: .leading, spacing: 2) {
                Text(expense.title)
                    .font(Theme.Typography.bodyLarge)
                    .foregroundStyle(Theme.Color.textPrimary)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    Text(expense.dateFormatted)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.textTertiary)
                    if let loc = expense.location {
                        Text("·")
                            .foregroundStyle(Theme.Color.textTertiary)
                        Text(loc)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                            .lineLimit(1)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Category
            HStack(spacing: 3) {
                Image(systemName: expense.category.icon)
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(Color(hex: expense.category.colorHex))
            }
            .frame(width: 80, alignment: .center)

            // Amount
            Text(expense.formattedAmount)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Color.textPrimary)
                .frame(width: 70, alignment: .trailing)
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Financial Summary
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var financialSummaryCard: some View {
        GlassCard(style: .regular, shadow: Theme.Shadow.medium) {
            VStack(spacing: Theme.Spacing.md) {
                sectionHeader(title: "Financial Summary", icon: "chart.bar.doc.horizontal")

                Divider().background(Color.white.opacity(0.08))

                VStack(spacing: 10) {
                    summaryRow(label: "Subtotal (\(expenses.count) items)", value: subtotal)
                    summaryRow(label: "Tax (10%)", value: taxAmount)
                    summaryRow(label: "Service Charge", value: serviceCharge)
                    summaryRow(label: "Discount", value: -discount, color: Color(hex: "#2D7D46"))

                    // Divider before total
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Theme.Color.primary.opacity(0.3), Theme.Color.secondary.opacity(0.3)],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(height: 1)
                        .padding(.vertical, 4)

                    // Grand Total
                    HStack {
                        Text("Grand Total")
                            .font(Theme.Typography.headlineSmall)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Spacer()
                        Text(formatCurrency(grandTotal))
                            .font(Theme.Typography.headline)
                            .foregroundStyle(Theme.Color.primary)
                    }

                    // Per-person
                    HStack {
                        Text("Per Person (\(trip.companions.count + 1) travellers)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                        Spacer()
                        Text(formatCurrency(grandTotal / Decimal(trip.companions.count + 1)))
                            .font(Theme.Typography.label)
                            .foregroundStyle(Theme.Color.textSecondary)
                    }
                }
            }
        }
    }

    private func summaryRow(label: String, value: Decimal, color: Color = Theme.Color.textSecondary) -> some View {
        HStack {
            Text(label)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textSecondary)
            Spacer()
            Text(formatCurrency(value))
                .font(Theme.Typography.bodyLarge)
                .foregroundStyle(color)
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Split Breakdown
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var splitBreakdownCard: some View {
        GlassCard(style: .light, shadow: Theme.Shadow.soft) {
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                sectionHeader(title: "Split Breakdown", icon: "person.2.circle")

                ForEach(splitMembers, id: \.name) { member in
                    HStack(spacing: Theme.Spacing.md) {
                        // Avatar
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: member.gradient,
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 38, height: 38)
                            Text(member.initials)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(member.name)
                                .font(Theme.Typography.subheadline)
                                .foregroundStyle(Theme.Color.textPrimary)
                            Text(member.role)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Color.textTertiary)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text(formatCurrency(member.owes))
                                .font(Theme.Typography.subheadline)
                                .foregroundStyle(Theme.Color.textPrimary)

                            HStack(spacing: 4) {
                                Circle()
                                    .fill(member.isPaid ? Color(hex: "#2D7D46") : Color(hex: "#C44900"))
                                    .frame(width: 6, height: 6)
                                Text(member.isPaid ? "Settled" : "Outstanding")
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(member.isPaid ? Color(hex: "#2D7D46") : Color(hex: "#C44900"))
                            }
                        }
                    }

                    if member.name != splitMembers.last?.name {
                        Divider().background(Color.white.opacity(0.06))
                    }
                }
            }
        }
    }

    // MARK: - Invoice Footer

    private var invoiceFooter: some View {
        VStack(spacing: Theme.Spacing.md) {
            Divider().background(Color.white.opacity(0.08))

            VStack(spacing: 6) {
                Text("Thank you for travelling with Traveloop")
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(Theme.Color.textSecondary)

                Text("This is a system-generated invoice. For queries, contact support@traveloop.app")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
                    .multilineTextAlignment(.center)

                HStack(spacing: Theme.Spacing.md) {
                    footerLink(icon: "globe", text: "traveloop.app")
                    footerLink(icon: "envelope", text: "support@traveloop.app")
                }
                .padding(.top, 4)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, Theme.Spacing.md)
    }

    private func footerLink(icon: String, text: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .medium))
            Text(text)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(Theme.Color.primary.opacity(0.7))
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Helpers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private func sectionHeader(title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.Color.primary)
            Text(title)
                .font(Theme.Typography.subheadline)
                .foregroundStyle(Theme.Color.textPrimary)
        }
    }

    private func metaLabel(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 9, weight: .bold))
            .kerning(0.8)
            .foregroundStyle(Theme.Color.textTertiary)
    }

    private func formattedDate(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "d MMM yyyy"
        return fmt.string(from: date)
    }

    private func formatCurrency(_ value: Decimal) -> String {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = "EUR"
        fmt.maximumFractionDigits = 2
        return fmt.string(from: NSDecimalNumber(decimal: value)) ?? "€\(value)"
    }

    // MARK: - Split Members Data

    private var splitMembers: [SplitMember] {
        let perPerson = grandTotal / 3
        return [
            SplitMember(
                name: user.fullName, initials: user.initials, role: "Organiser",
                gradient: [Theme.Color.primary, Theme.Color.secondary],
                owes: perPerson, isPaid: true
            ),
            SplitMember(
                name: "Sophie Laurent", initials: "SL", role: "Traveller",
                gradient: [Theme.Color.secondary, Theme.Color.tertiary],
                owes: perPerson, isPaid: false
            ),
            SplitMember(
                name: "Marco Bianchi", initials: "MB", role: "Traveller",
                gradient: [Color(hex: "#6B4FA0"), Theme.Color.primary],
                owes: perPerson, isPaid: false
            ),
        ]
    }
}

// MARK: - Split Member Helper

private struct SplitMember {
    let name: String
    let initials: String
    let role: String
    let gradient: [Color]
    let owes: Decimal
    let isPaid: Bool
}
