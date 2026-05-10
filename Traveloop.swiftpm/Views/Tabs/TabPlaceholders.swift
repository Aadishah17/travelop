// TabPlaceholders.swift
// Traveloop – Tab Placeholder Screens
// Polished placeholder views for Search, Plan, Community, and Profile tabs.

import SwiftUI

// MARK: - Search Tab

struct SearchTabPlaceholder: View {

    @State private var searchText: String = ""
    @State private var appeared = false

    private let categories: [(icon: String, name: String, color: Color)] = [
        ("airplane",          "Flights",       Color(hex: "#004AC6")),
        ("building.2",        "Hotels",        Color(hex: "#006591")),
        ("fork.knife",        "Restaurants",   Color(hex: "#C44900")),
        ("building.columns",  "Attractions",   Color(hex: "#6B4FA0")),
        ("figure.hiking",     "Adventures",    Color(hex: "#006242")),
        ("bag",               "Shopping",      Color(hex: "#9B2335")),
    ]

    private let trending = ["Santorini", "Bali", "Tokyo", "Barcelona", "Maldives", "Swiss Alps"]

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    // Search bar
                    searchBar
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // Categories
                    sectionLabel("Explore by Category")
                    categoryGrid
                        .opacity(appeared ? 1 : 0)

                    // Trending
                    sectionLabel("Trending Destinations")
                    trendingTags
                        .opacity(appeared ? 1 : 0)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Search")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
    }

    private var searchBar: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.Color.textTertiary)
            TextField("Search destinations, activities...", text: $searchText)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textPrimary)
            if !searchText.isEmpty {
                Button { searchText = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.Color.textTertiary)
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.md)
        .frame(height: 50)
        .glassBackground(style: .regular, cornerRadius: Theme.Radius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                .strokeBorder(Color.white.opacity(0.2), lineWidth: 1)
        )
    }

    private var categoryGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.sm) {
            ForEach(categories, id: \.name) { cat in
                VStack(spacing: Theme.Spacing.xs) {
                    ZStack {
                        Circle()
                            .fill(cat.color.opacity(0.12))
                            .frame(width: 52, height: 52)
                        Image(systemName: cat.icon)
                            .font(.system(size: 22, weight: .medium))
                            .foregroundStyle(cat.color)
                    }
                    Text(cat.name)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .glassCard(
                    style: .light,
                    cornerRadius: Theme.Radius.lg,
                    padding: EdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.xs, bottom: Theme.Spacing.sm, trailing: Theme.Spacing.xs),
                    shadow: nil
                )
            }
        }
    }

    private var trendingTags: some View {
        FlowLayout(spacing: Theme.Spacing.xs) {
            ForEach(trending, id: \.self) { dest in
                Text(dest)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.primary)
                    .padding(.horizontal, Theme.Spacing.md)
                    .padding(.vertical, Theme.Spacing.xs)
                    .background(
                        Capsule()
                            .fill(Theme.Color.primary.opacity(0.08))
                    )
                    .overlay(
                        Capsule().strokeBorder(Theme.Color.primary.opacity(0.15), lineWidth: 1)
                    )
            }
        }
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(Theme.Typography.headlineSmall)
            .foregroundStyle(Theme.Color.textPrimary)
            .padding(.top, Theme.Spacing.xs)
    }
}

// MARK: - Plan Tab

struct PlanTabPlaceholder: View {

    private let itinerary = MockData.parisRomeItinerary
    @State private var appeared = false

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    // Progress overview
                    progressCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)

                    sectionLabel("Day-by-Day")

                    ForEach(itinerary.days) { day in
                        dayRow(day)
                            .opacity(appeared ? 1 : 0)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Plan")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
    }

    private var progressCard: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Progress ring
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.15), lineWidth: 6)
                    .frame(width: 60, height: 60)
                Circle()
                    .trim(from: 0, to: itinerary.progressPercentage)
                    .stroke(Theme.Color.primary, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))
                Text("\(Int(itinerary.progressPercentage * 100))%")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.textPrimary)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Paris & Rome")
                    .font(Theme.Typography.headlineSmall)
                    .foregroundStyle(Theme.Color.textPrimary)
                Text("\(itinerary.completedActivities)/\(itinerary.totalActivities) activities planned")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Color.textSecondary)
                Text("\(itinerary.days.count) days · 2 cities")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }

            Spacer()
        }
        .glassCard(style: .regular, cornerRadius: Theme.Radius.xl, shadow: Theme.Shadow.soft)
    }

    private func dayRow(_ day: ItineraryDay) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Day number
            VStack(spacing: 2) {
                Text("DAY")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
                Text("\(day.dayNumber)")
                    .font(Theme.Typography.headlineSmall)
                    .foregroundStyle(Theme.Color.primary)
            }
            .frame(width: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text(day.title)
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(Theme.Color.textPrimary)
                Text("\(day.activityCount) activities · \(day.dateFormatted)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .glassCard(
            style: .light,
            cornerRadius: Theme.Radius.lg,
            padding: EdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.md, bottom: Theme.Spacing.md, trailing: Theme.Spacing.md),
            shadow: nil
        )
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(Theme.Typography.headlineSmall)
            .foregroundStyle(Theme.Color.textPrimary)
    }
}

// MARK: - Community Tab

struct CommunityTabPlaceholder: View {

    @State private var appeared = false

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            VStack(spacing: Theme.Spacing.xl) {
                Spacer()

                ZStack {
                    Circle()
                        .fill(Theme.Color.secondary.opacity(0.10))
                        .frame(width: 120, height: 120)
                    Image(systemName: "person.2.circle")
                        .font(.system(size: 56, weight: .light))
                        .foregroundStyle(Theme.Color.secondary)
                }
                .scaleEffect(appeared ? 1 : 0.7)
                .opacity(appeared ? 1 : 0)

                VStack(spacing: Theme.Spacing.xs) {
                    Text("Community")
                        .font(Theme.Typography.headline)
                        .foregroundStyle(Theme.Color.textPrimary)
                    Text("Share stories, get inspired, and\nconnect with fellow travellers.")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Color.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .opacity(appeared ? 1 : 0)

                Button {
                } label: {
                    Text("Coming Soon")
                        .font(Theme.Typography.buttonLabel)
                        .foregroundStyle(.white)
                        .padding(.horizontal, Theme.Spacing.xl)
                        .padding(.vertical, Theme.Spacing.sm)
                        .background(Theme.Gradient.nature)
                        .clipShape(Capsule())
                        .shadow(color: Theme.Color.secondary.opacity(0.3), radius: 12, y: 4)
                }
                .opacity(appeared ? 1 : 0)
                .disabled(true)

                Spacer()
                Spacer()
            }
            .padding(.horizontal, Theme.Spacing.lg)
        }
        .navigationTitle("Community")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.15)) { appeared = true }
        }
    }
}

// MARK: - Profile Tab

struct ProfileTabPlaceholder: View {

    @AppStorage("isLoggedIn") private var isLoggedIn: Bool = true
    private let user = MockData.currentUser
    @State private var appeared = false

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: Theme.Spacing.lg) {
                    // Avatar + name
                    profileHeader
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)

                    // Stats
                    statsGrid
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 15)

                    // Menu items
                    menuSection
                        .opacity(appeared ? 1 : 0)

                    // Logout
                    logoutButton
                        .opacity(appeared ? 1 : 0)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: Theme.Spacing.sm) {
            ZStack {
                Circle()
                    .fill(Theme.Gradient.primaryHero)
                    .frame(width: 80, height: 80)
                    .shadow(color: Theme.Color.primary.opacity(0.3), radius: 16, y: 6)

                Text(user.initials)
                    .font(Theme.Typography.headline)
                    .foregroundStyle(.white)
            }

            Text(user.fullName)
                .font(Theme.Typography.headline)
                .foregroundStyle(Theme.Color.textPrimary)

            Text(user.email)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textSecondary)

            if user.isVerified {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(Theme.Color.primary)
                    Text("Verified Traveller")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.primary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .glassCard(style: .regular, cornerRadius: Theme.Radius.xxl, shadow: Theme.Shadow.soft)
    }

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.sm) {
            statItem(value: "\(user.stats.tripsCompleted)", label: "Trips", icon: "airplane")
            statItem(value: "\(user.stats.countriesVisited)", label: "Countries", icon: "flag")
            statItem(value: user.stats.formattedDistance, label: "Distance", icon: "point.topleft.down.to.point.bottomright.curvepath")
        }
    }

    private func statItem(value: String, label: String, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .medium))
                .foregroundStyle(Theme.Color.secondary)
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
            padding: EdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.xs, bottom: Theme.Spacing.md, trailing: Theme.Spacing.xs),
            shadow: nil
        )
    }

    private var menuSection: some View {
        VStack(spacing: 1) {
            menuRow(icon: "gearshape", title: "Settings")
            menuRow(icon: "bell", title: "Notifications")
            menuRow(icon: "shield.checkered", title: "Privacy & Security")
            menuRow(icon: "questionmark.circle", title: "Help & Support")
            menuRow(icon: "star", title: "Rate Traveloop")
        }
        .glassCard(
            style: .light,
            cornerRadius: Theme.Radius.xl,
            padding: EdgeInsets(top: Theme.Spacing.xs, leading: 0, bottom: Theme.Spacing.xs, trailing: 0),
            shadow: Theme.Shadow.soft
        )
    }

    private func menuRow(icon: String, title: String) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(Theme.Color.secondary)
                .frame(width: 24)
            Text(title)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textPrimary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.sm)
    }

    private var logoutButton: some View {
        Button {
            withAnimation(Theme.Animation.spring) {
                isLoggedIn = false
            }
        } label: {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Log Out")
            }
            .font(Theme.Typography.buttonLabel)
            .foregroundStyle(.red.opacity(0.8))
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .glassCard(
                style: .light,
                cornerRadius: Theme.Radius.lg,
                padding: EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0),
                shadow: nil
            )
        }
    }
}

// MARK: - Flow Layout (for Search tags)

struct FlowLayout: Layout {

    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}
