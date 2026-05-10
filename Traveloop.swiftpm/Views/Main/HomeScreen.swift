// HomeScreen.swift
// Traveloop – Main Home Screen
// High-end hero banner, horizontal "Top Regional Selections", upcoming trips,
// and quick-action grid — all driven by MockData and the glassmorphism system.

import SwiftUI

// MARK: - Home Screen

struct HomeScreen: View {

    // MARK: - Data

    private let user  = MockData.currentUser
    private let trips = MockData.allTrips
    private let trip  = MockData.parisRomeTrip

    // MARK: - State

    @State private var appeared      = false
    @State private var heroAnimated  = false
    @State private var scrollOffset: CGFloat = 0

    // MARK: - Body

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {

                    // ── Hero Banner ──────────────────────────
                    heroBanner
                        .padding(.bottom, Theme.Spacing.lg)

                    // ── Top Regional Selections ─────────────
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        sectionHeader(title: "Top Regional Selections", subtitle: "Curated journeys by continent")
                            .padding(.horizontal, Theme.Spacing.md)

                        regionalCarousel
                    }
                    .padding(.bottom, Theme.Spacing.xl)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)

                    // ── Your Upcoming Trips ─────────────────
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        sectionHeader(title: "Your Trips", subtitle: nil)
                            .padding(.horizontal, Theme.Spacing.md)

                        ForEach(trips) { t in
                            NavigationLink(value: t) {
                                TripCardView(trip: t)
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal, Theme.Spacing.md)
                        }
                    }
                    .padding(.bottom, Theme.Spacing.xl)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 25)

                    // ── Quick Actions ────────────────────────
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        sectionHeader(title: "Quick Actions", subtitle: nil)
                            .padding(.horizontal, Theme.Spacing.md)

                        quickActionsRow
                            .padding(.horizontal, Theme.Spacing.md)
                    }
                    .padding(.bottom, 110)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { toolbarContent }
        .navigationDestination(for: Trip.self) { trip in
            ItineraryBuilderScreen(trip: trip)
        }
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1))  { heroAnimated = true }
            withAnimation(Theme.Animation.spring.delay(0.35)) { appeared = true }
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            VStack(alignment: .leading, spacing: 0) {
                Text(greetingText)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
                Text("Hey, \(user.firstName)!")
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(Theme.Color.textPrimary)
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            HStack(spacing: Theme.Spacing.sm) {
                Button { } label: {
                    Image(systemName: "bell")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(Theme.Color.textSecondary)
                }
                avatarView
            }
        }
    }

    private var avatarView: some View {
        ZStack {
            Circle()
                .fill(Theme.Gradient.primaryHero)
                .frame(width: 34, height: 34)
            Text(user.initials)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.white)
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Hero Banner
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var heroBanner: some View {
        ZStack(alignment: .bottomLeading) {
            // Background gradient with decorative shapes
            heroBackground

            // Content overlay
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                // Destination badge
                HStack(spacing: 6) {
                    Text(trip.destinations.first?.flag ?? "🌍")
                        .font(.system(size: 16))
                    Text("NEXT ADVENTURE")
                        .font(Theme.Typography.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(.white.opacity(0.85))
                        .kerning(1.5)
                }
                .padding(.horizontal, Theme.Spacing.sm)
                .padding(.vertical, Theme.Spacing.xxs)
                .background(Capsule().fill(.white.opacity(0.15)))

                // Trip title
                Text(trip.title)
                    .font(Theme.Typography.displayLarge)
                    .foregroundStyle(.white)
                    .shadow(color: .black.opacity(0.2), radius: 8, y: 4)

                // Subtitle
                Text(trip.description)
                    .font(Theme.Typography.body)
                    .foregroundStyle(.white.opacity(0.8))
                    .lineLimit(2)

                // Stats chips
                HStack(spacing: Theme.Spacing.sm) {
                    heroPill(icon: "calendar", text: trip.dateRangeFormatted)
                    heroPill(icon: "moon.fill", text: "\(trip.totalNights) nights")
                    heroPill(icon: "person.2.fill", text: "\(trip.companions.count) pax")
                }
                .padding(.top, Theme.Spacing.xxs)

                // Countdown + CTA
                HStack(spacing: Theme.Spacing.md) {
                    // Countdown
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(trip.daysUntilDeparture)")
                            .font(Theme.Typography.displayMedium)
                            .foregroundStyle(.white)
                        Text("days to go")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.white.opacity(0.7))
                    }

                    Spacer()

                    // CTA
                    NavigationLink(value: trip) {
                        HStack(spacing: 6) {
                            Text("View Itinerary")
                                .font(Theme.Typography.buttonLabel)
                            Image(systemName: "arrow.right")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .foregroundStyle(Theme.Color.primary)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.sm)
                        .background(
                            Capsule()
                                .fill(.white)
                                .shadow(color: .black.opacity(0.15), radius: 12, y: 4)
                        )
                    }
                }
                .padding(.top, Theme.Spacing.xs)
            }
            .padding(Theme.Spacing.lg)
            .padding(.top, Theme.Spacing.xl)
        }
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xxl, style: .continuous))
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.top, Theme.Spacing.xs)
        .shadow(color: Theme.Color.primary.opacity(0.25), radius: 30, y: 12)
        .scaleEffect(heroAnimated ? 1 : 0.95)
        .opacity(heroAnimated ? 1 : 0)
    }

    private var heroBackground: some View {
        ZStack {
            // Base gradient
            LinearGradient(
                colors: [
                    Color(hex: "#0036A3"),
                    Color(hex: "#004AC6"),
                    Color(hex: "#006591"),
                    Color(hex: "#006242")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Decorative circles
            Circle()
                .fill(.white.opacity(0.06))
                .frame(width: 260, height: 260)
                .offset(x: 130, y: -80)

            Circle()
                .fill(.white.opacity(0.04))
                .frame(width: 180, height: 180)
                .offset(x: -100, y: 120)

            // Grid pattern overlay
            GridPatternView()
                .opacity(0.04)

            // Bottom gradient fade
            LinearGradient(
                colors: [.clear, .black.opacity(0.25)],
                startPoint: .center,
                endPoint: .bottom
            )
        }
        .frame(height: 380)
    }

    private func heroPill(icon: String, text: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .semibold))
            Text(text)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(.white.opacity(0.9))
        .padding(.horizontal, Theme.Spacing.xs)
        .padding(.vertical, 4)
        .background(Capsule().fill(.white.opacity(0.12)))
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Regional Selections Carousel
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var regionalCarousel: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.md) {
                ForEach(RegionalSelection.allSelections) { region in
                    RegionalCardView(region: region)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.xxs) // shadow bleed
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Quick Actions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var quickActionsRow: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Theme.Spacing.sm), count: 4), spacing: Theme.Spacing.sm) {
            quickActionItem(icon: "plus.circle.fill",     title: "New Trip",  gradient: Theme.Gradient.primaryHero, destination: nil)
            
            NavigationLink(destination: PackingChecklistScreen(trip: trip)) {
                quickActionItem(icon: "suitcase.fill",        title: "Packing",   gradient: Theme.Gradient.nature, destination: "packing")
            }
            .buttonStyle(.plain)
            
            NavigationLink(destination: BudgetInsightsScreen(trip: trip)) {
                quickActionItem(icon: "dollarsign.circle.fill",title: "Budget",   gradient: LinearGradient(colors: [Color(hex: "#C44900"), Color(hex: "#9B2335")], startPoint: .topLeading, endPoint: .bottomTrailing), destination: "budget")
            }
            .buttonStyle(.plain)
            
            quickActionItem(icon: "checklist",            title: "Tasks",     gradient: LinearGradient(colors: [Color(hex: "#6B4FA0"), Color(hex: "#004AC6")], startPoint: .topLeading, endPoint: .bottomTrailing), destination: nil)
        }
    }

    private func quickActionItem(icon: String, title: String, gradient: LinearGradient, destination: String?) -> some View {
        VStack(spacing: 6) {
            ZStack {
                Circle().fill(gradient).frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(.white)
            }
            Text(title)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Color.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.sm)
        .glassBackground(style: .light, cornerRadius: Theme.Radius.lg)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Helpers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private func sectionHeader(title: String, subtitle: String?) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(Theme.Typography.headlineSmall)
                .foregroundStyle(Theme.Color.textPrimary)
            if let subtitle {
                Text(subtitle)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }
        }
    }

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good Morning ☀️"
        case 12..<17: return "Good Afternoon 🌤"
        case 17..<21: return "Good Evening 🌅"
        default:      return "Good Night 🌙"
        }
    }
}

// MARK: - Grid Pattern (Decorative)

/// Subtle grid overlay for the hero banner background.
private struct GridPatternView: View {
    var body: some View {
        Canvas { context, size in
            let step: CGFloat = 28
            for x in stride(from: 0, through: size.width, by: step) {
                var path = Path()
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))
                context.stroke(path, with: .color(.white), lineWidth: 0.5)
            }
            for y in stride(from: 0, through: size.height, by: step) {
                var path = Path()
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: size.width, y: y))
                context.stroke(path, with: .color(.white), lineWidth: 0.5)
            }
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Regional Selection Model & Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

struct RegionalSelection: Identifiable {
    let id = UUID()
    let region: String
    let tagline: String
    let icon: String
    let gradientColors: [Color]
    let destinations: [String]

    static let allSelections: [RegionalSelection] = [
        RegionalSelection(
            region: "Europe",
            tagline: "Timeless Heritage",
            icon: "building.columns.fill",
            gradientColors: [Color(hex: "#004AC6"), Color(hex: "#006591")],
            destinations: ["Paris", "Rome", "Barcelona", "Santorini"]
        ),
        RegionalSelection(
            region: "Asia",
            tagline: "Ancient & Modern",
            icon: "mountain.2.fill",
            gradientColors: [Color(hex: "#006242"), Color(hex: "#2D7D46")],
            destinations: ["Tokyo", "Bali", "Bangkok", "Seoul"]
        ),
        RegionalSelection(
            region: "Americas",
            tagline: "Wild Frontiers",
            icon: "globe.americas.fill",
            gradientColors: [Color(hex: "#C44900"), Color(hex: "#9B2335")],
            destinations: ["New York", "Cancún", "Patagonia", "Havana"]
        ),
        RegionalSelection(
            region: "Middle East",
            tagline: "Desert Opulence",
            icon: "sun.max.fill",
            gradientColors: [Color(hex: "#8B5E3C"), Color(hex: "#C44900")],
            destinations: ["Dubai", "Petra", "Istanbul", "Muscat"]
        ),
        RegionalSelection(
            region: "Africa",
            tagline: "Untamed Beauty",
            icon: "leaf.fill",
            gradientColors: [Color(hex: "#006242"), Color(hex: "#004AC6")],
            destinations: ["Cape Town", "Serengeti", "Marrakech", "Zanzibar"]
        ),
        RegionalSelection(
            region: "Oceania",
            tagline: "Island Paradise",
            icon: "water.waves",
            gradientColors: [Color(hex: "#006591"), Color(hex: "#1A6B8A")],
            destinations: ["Sydney", "Fiji", "Queenstown", "Bora Bora"]
        ),
    ]
}

/// A single regional selection card for the horizontal carousel.
struct RegionalCardView: View {

    let region: RegionalSelection
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top — gradient header with icon
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: region.gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // Decorative circle
                Circle()
                    .fill(.white.opacity(0.08))
                    .frame(width: 100, height: 100)
                    .offset(x: 80, y: -30)

                VStack(alignment: .leading, spacing: 4) {
                    Image(systemName: region.icon)
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(.white)

                    Text(region.region)
                        .font(Theme.Typography.headlineSmall)
                        .foregroundStyle(.white)

                    Text(region.tagline)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(.white.opacity(0.75))
                }
                .padding(Theme.Spacing.md)
            }
            .frame(height: 140)

            // Bottom — destination tags
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                FlowLayout(spacing: 6) {
                    ForEach(region.destinations, id: \.self) { dest in
                        Text(dest)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textSecondary)
                            .padding(.horizontal, Theme.Spacing.xs)
                            .padding(.vertical, 3)
                            .background(
                                Capsule()
                                    .fill(Theme.Color.background)
                            )
                    }
                }
            }
            .padding(Theme.Spacing.sm)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(width: 200)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))
        .glassBackground(style: .light, cornerRadius: Theme.Radius.xl)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.08), radius: 16, y: 6)
        .scaleEffect(isPressed ? 0.96 : 1)
        .animation(Theme.Animation.fastSpring, value: isPressed)
        .onTapGesture { }
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Trip Card Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Reusable trip card used on the Home screen and elsewhere.
struct TripCardView: View {

    let trip: Trip

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            // Header
            HStack(spacing: Theme.Spacing.sm) {
                // Icon
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

                statusBadge
            }

            // Info chips
            HStack(spacing: Theme.Spacing.md) {
                chipView(icon: "calendar", text: trip.dateRangeFormatted)
                chipView(icon: "moon.fill", text: "\(trip.totalNights) nights")
                chipView(icon: "person.2.fill", text: "\(trip.companions.count)")
            }

            // Budget progress
            if trip.budget.totalBudget > 0 && trip.budget.spent > 0 {
                budgetBar
            }
        }
        .glassCard(style: .regular, cornerRadius: Theme.Radius.xl, shadow: Theme.Shadow.soft)
    }

    private var statusBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: trip.status.icon)
                .font(.system(size: 10, weight: .semibold))
            Text(trip.status.rawValue)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(Theme.Color.primary)
        .padding(.horizontal, Theme.Spacing.xs)
        .padding(.vertical, Theme.Spacing.xxs)
        .background(Capsule().fill(Theme.Color.primary.opacity(0.10)))
    }

    private func chipView(icon: String, text: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .medium))
            Text(text)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(Theme.Color.textSecondary)
    }

    private var budgetBar: some View {
        VStack(spacing: 4) {
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
                        .fill(Color.white.opacity(0.12))
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
