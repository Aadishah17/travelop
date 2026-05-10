// HomeTabPlaceholder.swift
// Traveloop – Home Tab
// Displays upcoming trips, quick stats, and a greeting.

import SwiftUI

struct HomeTabPlaceholder: View {

    private let user = MockData.currentUser
    private let trips = MockData.allTrips

    @State private var appeared = false

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    // Greeting
                    greetingHeader
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)

                    // Stats row
                    statsRow
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)

                    // Upcoming trips
                    sectionLabel("Your Trips")
                        .opacity(appeared ? 1 : 0)

                    ForEach(Array(trips.enumerated()), id: \.element.id) { index, trip in
                        tripCard(trip)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 30)
                    }

                    // Quick actions
                    sectionLabel("Quick Actions")
                        .opacity(appeared ? 1 : 0)

                    quickActionsGrid
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, 100)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.15)) {
                appeared = true
            }
        }
    }

    // MARK: - Greeting

    private var greetingHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                Text(greetingText)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textSecondary)

                Text("Hey, \(user.firstName)! 👋")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Color.textPrimary)
            }

            Spacer()

            ZStack {
                Circle()
                    .fill(Theme.Gradient.primaryHero)
                    .frame(width: 44, height: 44)

                Text(user.initials)
                    .font(Theme.Typography.label)
                    .foregroundStyle(.white)
            }
        }
    }

    // MARK: - Stats

    private var statsRow: some View {
        HStack(spacing: Theme.Spacing.sm) {
            statBadge(icon: "airplane", value: "\(user.stats.tripsCompleted)", label: "Trips")
            statBadge(icon: "globe", value: "\(user.stats.countriesVisited)", label: "Countries")
            statBadge(icon: "camera", value: "\(user.stats.photosUploaded)", label: "Photos")
        }
    }

    private func statBadge(icon: String, value: String, label: String) -> some View {
        VStack(spacing: Theme.Spacing.xxs) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .medium))
                .foregroundStyle(Theme.Color.primary)
            Text(value)
                .font(Theme.Typography.headlineSmall)
                .foregroundStyle(Theme.Color.textPrimary)
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .glassCard(
            style: .light,
            cornerRadius: Theme.Radius.lg,
            padding: EdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.sm, bottom: Theme.Spacing.md, trailing: Theme.Spacing.sm),
            shadow: Theme.Shadow.soft
        )
    }

    // MARK: - Trip Card

    private func tripCard(_ trip: Trip) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            // Header row
            HStack(spacing: Theme.Spacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                        .fill(Theme.Gradient.primaryHero)
                        .frame(width: 48, height: 48)

                    Image(systemName: trip.coverImageName)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(trip.title)
                        .font(Theme.Typography.headlineSmall)
                        .foregroundStyle(Theme.Color.textPrimary)

                    Text(trip.destinationNames)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Color.textSecondary)
                }

                Spacer()

                // Status badge
                Text(trip.status.rawValue)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.primary)
                    .padding(.horizontal, Theme.Spacing.xs)
                    .padding(.vertical, Theme.Spacing.xxs)
                    .background(
                        Capsule()
                            .fill(Theme.Color.primary.opacity(0.10))
                    )
            }

            // Info row
            HStack(spacing: Theme.Spacing.md) {
                infoChip(icon: "calendar", text: trip.dateRangeFormatted)
                infoChip(icon: "moon", text: "\(trip.totalNights) nights")
                infoChip(icon: "person.2", text: "\(trip.companions.count)")
            }

            // Budget bar (if trip has budget)
            if trip.budget.totalBudget > 0 {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Budget")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                        Spacer()
                        Text(trip.budget.formattedSpent)
                            .font(Theme.Typography.label)
                            .foregroundStyle(Theme.Color.textPrimary)
                        Text("/ \(trip.budget.formattedBudget)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textTertiary)
                    }

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.15))
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(Theme.Gradient.primaryHero)
                                .frame(width: geo.size.width * min(trip.budget.spentPercentage, 1.0), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
            }
        }
        .glassCard(
            style: .regular,
            cornerRadius: Theme.Radius.xl,
            shadow: Theme.Shadow.soft
        )
    }

    private func infoChip(icon: String, text: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 11, weight: .medium))
            Text(text)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(Theme.Color.textSecondary)
    }

    // MARK: - Quick Actions

    private var quickActionsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.sm) {
            quickAction(icon: "plus.circle", title: "New Trip", gradient: Theme.Gradient.primaryHero)
            quickAction(icon: "suitcase", title: "Packing", gradient: Theme.Gradient.nature)
            quickAction(icon: "dollarsign.circle", title: "Budget", gradient: LinearGradient(colors: [Color(hex: "#C44900"), Color(hex: "#9B2335")], startPoint: .topLeading, endPoint: .bottomTrailing))
            quickAction(icon: "checklist", title: "Tasks", gradient: LinearGradient(colors: [Color(hex: "#6B4FA0"), Color(hex: "#004AC6")], startPoint: .topLeading, endPoint: .bottomTrailing))
        }
    }

    private func quickAction(icon: String, title: String, gradient: LinearGradient) -> some View {
        VStack(spacing: Theme.Spacing.xs) {
            ZStack {
                Circle()
                    .fill(gradient)
                    .frame(width: 44, height: 44)

                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(.white)
            }

            Text(title)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Color.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .glassCard(
            style: .light,
            cornerRadius: Theme.Radius.lg,
            padding: EdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.sm, bottom: Theme.Spacing.md, trailing: Theme.Spacing.sm),
            shadow: Theme.Shadow.soft
        )
    }

    // MARK: - Helpers

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(Theme.Typography.headlineSmall)
            .foregroundStyle(Theme.Color.textPrimary)
            .padding(.top, Theme.Spacing.xs)
    }

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good Morning"
        case 12..<17: return "Good Afternoon"
        case 17..<21: return "Good Evening"
        default:      return "Good Night"
        }
    }
}
