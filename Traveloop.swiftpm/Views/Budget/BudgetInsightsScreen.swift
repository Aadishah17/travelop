// BudgetInsightsScreen.swift
// Traveloop – Budget Insights
// Advanced financial tracking with circular progress charts and category breakdowns.

import SwiftUI

struct BudgetInsightsScreen: View {
    
    // MARK: - Properties
    
    let trip: Trip
    private var expenses: [Expense] { MockData.expenses }
    private var breakdown: [CategoryBreakdown] { MockData.categoryBreakdown }
    
    // MARK: - State
    
    @State private var appeared = false
    @State private var selectedCategory: CategoryBreakdown?
    
    // MARK: - Body
    
    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: Theme.Spacing.lg) {
                    
                    // 1. Spending Overview (Circular Progress)
                    spendingOverviewCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                    
                    // 2. Financial Breakdown (Subtotal, Tax, etc.)
                    financialBreakdownCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                    
                    // 3. View Invoice CTA
                    NavigationLink(destination: ExpenseInvoiceScreen(trip: trip)) {
                        HStack(spacing: Theme.Spacing.sm) {
                            Image(systemName: "doc.text.fill")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(.white)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("View Full Invoice")
                                    .font(Theme.Typography.buttonLabel)
                                    .foregroundStyle(.white)
                                Text("Itemised breakdown, PDF export & split details")
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(.white.opacity(0.6))
                        }
                        .padding(Theme.Spacing.md)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                                .fill(Theme.Gradient.primaryHero)
                        )
                        .shadow(color: Theme.Color.primary.opacity(0.3), radius: 12, y: 6)
                    }
                    .buttonStyle(.plain)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)

                    // 4. Category Breakdown List
                    categoryList
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                    
                    // 4. Recent Transactions
                    recentTransactionsSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                }
                .padding(Theme.Spacing.md)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Budget Insights")
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Spending Overview (Circular Progress)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private var spendingOverviewCard: some View {
        GlassCard(style: .regular, shadow: Theme.Shadow.medium) {
            VStack(spacing: Theme.Spacing.lg) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Total Spending")
                            .font(Theme.Typography.subheadline)
                            .foregroundStyle(Theme.Color.textSecondary)
                        Text("€\(Int(NSDecimalNumber(decimal: trip.budget.spent).intValue))")
                            .font(Theme.Typography.displayMedium)
                            .foregroundStyle(Theme.Color.textPrimary)
                    }
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("Budget")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                        Text("€\(Int(NSDecimalNumber(decimal: trip.budget.totalBudget).intValue))")
                            .font(Theme.Typography.subheadline)
                            .foregroundStyle(Theme.Color.textSecondary)
                    }
                }
                
                // Circular Progress Chart
                ZStack {
                    // Category Rings (Simplified Multi-ring view)
                    ForEach(Array(breakdown.enumerated()), id: \.element.id) { index, item in
                        Circle()
                            .trim(from: 0, to: item.percentage)
                            .stroke(
                                Color(hex: item.category.colorHex),
                                style: StrokeStyle(lineWidth: 12, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90 + Double(index * 45))) // Simplified stacking
                            .frame(width: 160 - CGFloat(index * 2), height: 160 - CGFloat(index * 2))
                    }
                    
                    // Center Content
                    VStack(spacing: 2) {
                        Text("\(Int(trip.budget.spentPercentage * 100))%")
                            .font(Theme.Typography.headline)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Text("Utilized")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                    }
                }
                .frame(height: 180)
                .padding(.vertical, 10)
                
                // Legend
                FlowLayout(spacing: 8) {
                    ForEach(breakdown) { item in
                        HStack(spacing: 4) {
                            Circle()
                                .fill(Color(hex: item.category.colorHex))
                                .frame(width: 8, height: 8)
                            Text(item.category.rawValue)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Color.textSecondary)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(Color.white.opacity(0.1)))
                    }
                }
            }
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Financial Breakdown
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private var financialBreakdownCard: some View {
        GlassCard(style: .light) {
            VStack(spacing: Theme.Spacing.md) {
                HStack {
                    Text("Financial Summary")
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(Theme.Color.textPrimary)
                    Spacer()
                }
                
                Divider().background(Color.white.opacity(0.1))
                
                VStack(spacing: 12) {
                    breakdownRow(label: "Subtotal", value: trip.budget.spent, color: Theme.Color.textSecondary)
                    breakdownRow(label: "Estimated Tax (10%)", value: trip.budget.spent * 0.1, color: Theme.Color.textSecondary)
                    breakdownRow(label: "Discounts", value: -45.00, color: Color.green)
                    
                    Divider().background(Color.white.opacity(0.1))
                    
                    breakdownRow(label: "Grand Total", value: trip.budget.spent * 1.1 - 45.00, color: Theme.Color.textPrimary, isBold: true)
                }
            }
        }
    }
    
    private func breakdownRow(label: String, value: Decimal, color: Color, isBold: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(isBold ? Theme.Typography.subheadline : Theme.Typography.body)
                .foregroundStyle(Theme.Color.textSecondary)
            Spacer()
            Text("€\(NSDecimalNumber(decimal: value).doubleValue, specifier: "%.2f")")
                .font(isBold ? Theme.Typography.headlineSmall : Theme.Typography.bodyLarge)
                .foregroundStyle(color)
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Category List
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private var categoryList: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("By Category")
                .font(Theme.Typography.subheadline)
                .foregroundStyle(Theme.Color.textPrimary)
            
            ForEach(breakdown) { item in
                GlassCard(style: .regular, padding: EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16)) {
                    HStack(spacing: Theme.Spacing.md) {
                        ZStack {
                            Circle()
                                .fill(Color(hex: item.category.colorHex).opacity(0.15))
                                .frame(width: 40, height: 40)
                            Image(systemName: item.category.icon)
                                .font(.system(size: 16))
                                .foregroundStyle(Color(hex: item.category.colorHex))
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.category.rawValue)
                                .font(Theme.Typography.subheadline)
                                .foregroundStyle(Theme.Color.textPrimary)
                            Text("\(item.transactionCount) transactions")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Color.textTertiary)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("€\(NSDecimalNumber(decimal: item.totalAmount).intValue)")
                                .font(Theme.Typography.subheadline)
                                .foregroundStyle(Theme.Color.textPrimary)
                            
                            // Mini progress bar
                            ZStack(alignment: .leading) {
                                Capsule()
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 60, height: 4)
                                Capsule()
                                    .fill(Color(hex: item.category.colorHex))
                                    .frame(width: 60 * CGFloat(item.percentage), height: 4)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Recent Transactions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private var recentTransactionsSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Text("Recent Transactions")
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(Theme.Color.textPrimary)
                Spacer()
                Button("See All") { }
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.primary)
            }
            
            ForEach(expenses.prefix(5)) { expense in
                HStack(spacing: Theme.Spacing.md) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(expense.title)
                            .font(Theme.Typography.bodyLarge)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Text(expense.date.formatted(date: .abbreviated, time: .omitted))
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                    }
                    Spacer()
                    Text("-€\(NSDecimalNumber(decimal: expense.amount).intValue)")
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(Theme.Color.textPrimary)
                }
                .padding(.vertical, 8)
                Divider().background(Color.white.opacity(0.05))
            }
        }
        .padding(Theme.Spacing.md)
        .glassCard(style: .light)
    }
}
