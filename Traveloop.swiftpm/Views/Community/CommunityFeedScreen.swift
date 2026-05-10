// CommunityFeedScreen.swift
// Traveloop – Community Social Feed
// Scrollable glassmorphic cards where travellers share trip stories.
// Features: Group By / Filter / Sort By pill actions, destination imagery,
// user avatars, engagement metrics, and the signature frosted-glass aesthetic.

import SwiftUI

// MARK: - Community Feed Screen

struct CommunityFeedScreen: View {

    // MARK: - State

    @State private var appeared = false
    @State private var selectedFilter: FeedFilter = .all
    @State private var selectedSort: FeedSort = .recent
    @State private var selectedGroup: FeedGroup = .none
    @State private var showFilterSheet = false
    @State private var showSortSheet = false
    @State private var showGroupSheet = false

    // MARK: - Data

    private let posts = CommunityPost.sampleFeed

    private var filteredPosts: [CommunityPost] {
        let filtered: [CommunityPost]
        switch selectedFilter {
        case .all:        filtered = posts
        case .trending:   filtered = posts.filter { $0.likes > 60 }
        case .recent:     filtered = posts.sorted { $0.postedAt > $1.postedAt }
        case .following:  filtered = posts.filter { $0.isFollowing }
        }

        switch selectedSort {
        case .recent:     return filtered.sorted { $0.postedAt > $1.postedAt }
        case .popular:    return filtered.sorted { $0.likes > $1.likes }
        case .comments:   return filtered.sorted { $0.commentCount > $1.commentCount }
        }
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: Theme.Spacing.lg) {

                    // Header tagline
                    headerTagline
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -10)

                    // Action pills
                    actionPillsRow
                        .opacity(appeared ? 1 : 0)

                    // Feed cards
                    LazyVStack(spacing: Theme.Spacing.md) {
                        ForEach(Array(filteredPosts.enumerated()), id: \.element.id) { index, post in
                            CommunityPostCard(post: post)
                                .opacity(appeared ? 1 : 0)
                                .offset(y: appeared ? 0 : 20)
                                .animation(
                                    Theme.Animation.spring.delay(Double(index) * 0.06),
                                    value: appeared
                                )
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, 110)
            }
        }
        .navigationTitle("Community")
        .navigationBarTitleDisplayMode(.large)
        .toolbar { toolbarContent }
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
        .confirmationDialog("Filter By", isPresented: $showFilterSheet, titleVisibility: .visible) {
            ForEach(FeedFilter.allCases, id: \.self) { filter in
                Button(filter.label) { withAnimation(Theme.Animation.fastSpring) { selectedFilter = filter } }
            }
        }
        .confirmationDialog("Sort By", isPresented: $showSortSheet, titleVisibility: .visible) {
            ForEach(FeedSort.allCases, id: \.self) { sort in
                Button(sort.label) { withAnimation(Theme.Animation.fastSpring) { selectedSort = sort } }
            }
        }
        .confirmationDialog("Group By", isPresented: $showGroupSheet, titleVisibility: .visible) {
            ForEach(FeedGroup.allCases, id: \.self) { group in
                Button(group.label) { withAnimation(Theme.Animation.fastSpring) { selectedGroup = group } }
            }
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Button {
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundStyle(Theme.Color.primary)
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Header Tagline
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var headerTagline: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.Color.primary)
                Text("LIMITLESS EXPLORATION")
                    .font(.system(size: 11, weight: .bold))
                    .kerning(1.8)
                    .foregroundStyle(Theme.Color.primary)
            }

            Text("Stories from the road")
                .font(Theme.Typography.headline)
                .foregroundStyle(Theme.Color.textPrimary)

            Text("Discover where fellow travellers have been and get inspired for your next journey.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Color.textSecondary)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.bottom, Theme.Spacing.xxs)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Action Pills
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var actionPillsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                actionPill(icon: "line.3.horizontal.decrease.circle", title: "Filter", subtitle: selectedFilter.label, isActive: selectedFilter != .all) {
                    showFilterSheet = true
                }
                actionPill(icon: "arrow.up.arrow.down.circle", title: "Sort By", subtitle: selectedSort.label, isActive: selectedSort != .recent) {
                    showSortSheet = true
                }
                actionPill(icon: "rectangle.3.group", title: "Group By", subtitle: selectedGroup.label, isActive: selectedGroup != .none) {
                    showGroupSheet = true
                }

                // Quick filter chips
                ForEach(FeedFilter.allCases.filter { $0 != .all }, id: \.self) { filter in
                    quickChip(title: filter.label, isSelected: selectedFilter == filter) {
                        withAnimation(Theme.Animation.fastSpring) {
                            selectedFilter = selectedFilter == filter ? .all : filter
                        }
                    }
                }
            }
        }
    }

    private func actionPill(icon: String, title: String, subtitle: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                VStack(alignment: .leading, spacing: 0) {
                    Text(title)
                        .font(.system(size: 9, weight: .bold))
                        .kerning(0.5)
                        .foregroundStyle(isActive ? .white.opacity(0.7) : Theme.Color.textTertiary)
                    Text(subtitle)
                        .font(Theme.Typography.caption)
                }
            }
            .foregroundStyle(isActive ? .white : Theme.Color.textSecondary)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.xs)
            .background(
                Capsule().fill(
                    isActive
                        ? AnyShapeStyle(Theme.Gradient.primaryHero)
                        : AnyShapeStyle(Color.white.opacity(0.08))
                )
            )
            .overlay(
                Capsule().strokeBorder(
                    isActive ? Color.clear : Color.white.opacity(0.15),
                    lineWidth: 1
                )
            )
        }
        .buttonStyle(.plain)
    }

    private func quickChip(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Typography.label)
                .foregroundStyle(isSelected ? .white : Theme.Color.textSecondary)
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, 7)
                .background(
                    Capsule().fill(
                        isSelected
                            ? AnyShapeStyle(Theme.Color.secondary)
                            : AnyShapeStyle(Color.white.opacity(0.06))
                    )
                )
                .overlay(
                    Capsule().strokeBorder(
                        isSelected ? Color.clear : Color.white.opacity(0.12),
                        lineWidth: 1
                    )
                )
        }
        .buttonStyle(.plain)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Community Post Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// A single social feed card with destination image, user info, and engagement.
private struct CommunityPostCard: View {

    let post: CommunityPost
    @State private var isLiked = false
    @State private var isBookmarked = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {

            // ── Destination Image Header ──────────────────────
            destinationHeader

            // ── Content Area ──────────────────────────────────
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {

                // User Row
                userRow

                // Post text
                Text(post.text)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textPrimary)
                    .lineLimit(4)

                // Tags
                if !post.tags.isEmpty {
                    tagRow
                }

                // Engagement bar
                engagementBar
            }
            .padding(Theme.Spacing.md)
        }
        .background(
            GlassSurface(style: .regular, cornerRadius: Theme.Radius.xxl, applyShimmer: true)
        )
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xxl, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.xxl, style: .continuous)
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
        .shadow(
            color: Theme.Color.shadowColor,
            radius: Theme.Shadow.medium.radius,
            x: Theme.Shadow.medium.x,
            y: Theme.Shadow.medium.y
        )
    }

    // MARK: - Destination Image Header

    private var destinationHeader: some View {
        ZStack(alignment: .bottomLeading) {
            // Gradient background representing destination
            LinearGradient(
                colors: post.gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 180)
            .overlay(
                // Grid pattern
                Canvas { context, size in
                    let step: CGFloat = 24
                    for x in stride(from: 0, through: size.width, by: step) {
                        var path = Path()
                        path.move(to: CGPoint(x: x, y: 0))
                        path.addLine(to: CGPoint(x: x, y: size.height))
                        context.stroke(path, with: .color(.white.opacity(0.04)), lineWidth: 0.5)
                    }
                    for y in stride(from: 0, through: size.height, by: step) {
                        var path = Path()
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: size.width, y: y))
                        context.stroke(path, with: .color(.white.opacity(0.04)), lineWidth: 0.5)
                    }
                }
            )
            .overlay(
                // Bottom gradient scrim
                LinearGradient(
                    colors: [.clear, .black.opacity(0.35)],
                    startPoint: .center,
                    endPoint: .bottom
                )
            )
            .overlay(
                // Decorative circles
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.06))
                        .frame(width: 120, height: 120)
                        .offset(x: 100, y: -40)
                    Circle()
                        .fill(.white.opacity(0.04))
                        .frame(width: 80, height: 80)
                        .offset(x: -80, y: 50)
                }
            )

            // Destination icon + name overlay
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: post.destinationIcon)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(.white)

                VStack(alignment: .leading, spacing: 1) {
                    Text(post.destination)
                        .font(Theme.Typography.headlineSmall)
                        .foregroundStyle(.white)
                    Text(post.country)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(.white.opacity(0.8))
                }

                Spacer()

                // Time badge
                Text(post.timeAgo)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(.white.opacity(0.15)))
            }
            .padding(Theme.Spacing.md)
        }
    }

    // MARK: - User Row

    private var userRow: some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: post.avatarGradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 36, height: 36)
                Text(post.userInitials)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 4) {
                    Text(post.userName)
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(Theme.Color.textPrimary)

                    if post.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.Color.primary)
                    }
                }
                Text(post.userHandle)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }

            Spacer()

            if post.isFollowing {
                Text("Following")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(Theme.Color.secondary.opacity(0.1)))
            } else {
                Button { } label: {
                    Text("Follow")
                        .font(Theme.Typography.label)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Theme.Gradient.primaryHero))
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Tags

    private var tagRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(post.tags, id: \.self) { tag in
                    Text("#\(tag)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(
                            Capsule().fill(Theme.Color.secondary.opacity(0.08))
                        )
                }
            }
        }
    }

    // MARK: - Engagement Bar

    private var engagementBar: some View {
        HStack(spacing: Theme.Spacing.lg) {
            // Like
            Button {
                withAnimation(Theme.Animation.fastSpring) { isLiked.toggle() }
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: isLiked ? "heart.fill" : "heart")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(isLiked ? .red : Theme.Color.textTertiary)
                        .scaleEffect(isLiked ? 1.15 : 1.0)
                    Text("\(post.likes + (isLiked ? 1 : 0))")
                        .font(Theme.Typography.label)
                        .foregroundStyle(Theme.Color.textSecondary)
                }
            }
            .buttonStyle(.plain)

            // Comment
            HStack(spacing: 5) {
                Image(systemName: "bubble.right")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(Theme.Color.textTertiary)
                Text("\(post.commentCount)")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.textSecondary)
            }

            // Share
            Button { } label: {
                Image(systemName: "paperplane")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(Theme.Color.textTertiary)
            }
            .buttonStyle(.plain)

            Spacer()

            // Bookmark
            Button {
                withAnimation(Theme.Animation.fastSpring) { isBookmarked.toggle() }
            } label: {
                Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(isBookmarked ? Theme.Color.primary : Theme.Color.textTertiary)
            }
            .buttonStyle(.plain)
        }
        .padding(.top, Theme.Spacing.xxs)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Feed Enums
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

enum FeedFilter: String, CaseIterable {
    case all, trending, recent, following

    var label: String {
        switch self {
        case .all:       return "All Posts"
        case .trending:  return "Trending"
        case .recent:    return "Most Recent"
        case .following: return "Following"
        }
    }
}

enum FeedSort: String, CaseIterable {
    case recent, popular, comments

    var label: String {
        switch self {
        case .recent:   return "Recent"
        case .popular:  return "Most Liked"
        case .comments: return "Most Discussed"
        }
    }
}

enum FeedGroup: String, CaseIterable {
    case none, destination, continent

    var label: String {
        switch self {
        case .none:        return "None"
        case .destination: return "Destination"
        case .continent:   return "Continent"
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Community Post Model
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

struct CommunityPost: Identifiable {
    let id: UUID
    let userName: String
    let userHandle: String
    let userInitials: String
    let avatarGradient: [Color]
    let isVerified: Bool
    let isFollowing: Bool
    let destination: String
    let country: String
    let destinationIcon: String
    let gradientColors: [Color]
    let text: String
    let tags: [String]
    let likes: Int
    let commentCount: Int
    let postedAt: Date
    let timeAgo: String
}

// MARK: - Sample Feed Data

extension CommunityPost {
    static let sampleFeed: [CommunityPost] = [
        CommunityPost(
            id: UUID(), userName: "Sophie Laurent", userHandle: "@sophie.travels",
            userInitials: "SL",
            avatarGradient: [Color(hex: "#004AC6"), Color(hex: "#006591")],
            isVerified: true, isFollowing: true,
            destination: "Santorini", country: "Greece 🇬🇷",
            destinationIcon: "sun.max.fill",
            gradientColors: [Color(hex: "#006591"), Color(hex: "#004AC6")],
            text: "The sunset in Oia is something you have to experience in person. No photo does it justice — the way the light cascades over the caldera is genuinely breathtaking. 🌅",
            tags: ["Santorini", "Greece", "Sunset", "IslandLife"],
            likes: 128, commentCount: 24,
            postedAt: Date().addingTimeInterval(-3600 * 2),
            timeAgo: "2h ago"
        ),
        CommunityPost(
            id: UUID(), userName: "Marco Bianchi", userHandle: "@marco.explores",
            userInitials: "MB",
            avatarGradient: [Color(hex: "#006242"), Color(hex: "#2D7D46")],
            isVerified: false, isFollowing: true,
            destination: "Tokyo", country: "Japan 🇯🇵",
            destinationIcon: "building.2.fill",
            gradientColors: [Color(hex: "#9B2335"), Color(hex: "#C44900")],
            text: "Lost in the neon-lit streets of Shibuya at midnight. The energy here is electric — every corner is a new sensory overload. Ramen at 2 AM hits differently. 🍜✨",
            tags: ["Tokyo", "Japan", "Nightlife", "StreetFood"],
            likes: 89, commentCount: 15,
            postedAt: Date().addingTimeInterval(-3600 * 5),
            timeAgo: "5h ago"
        ),
        CommunityPost(
            id: UUID(), userName: "Priya Nair", userHandle: "@priya.wanderlust",
            userInitials: "PN",
            avatarGradient: [Color(hex: "#6B4FA0"), Color(hex: "#004AC6")],
            isVerified: true, isFollowing: false,
            destination: "Bali", country: "Indonesia 🇮🇩",
            destinationIcon: "leaf.fill",
            gradientColors: [Color(hex: "#006242"), Color(hex: "#2D7D46")],
            text: "Tegallalang Rice Terraces at sunrise — layers of green stretching into infinity. This is the Bali that makes you want to slow down and stay forever. 🌿",
            tags: ["Bali", "Indonesia", "Nature", "RiceTerraces"],
            likes: 215, commentCount: 42,
            postedAt: Date().addingTimeInterval(-3600 * 8),
            timeAgo: "8h ago"
        ),
        CommunityPost(
            id: UUID(), userName: "Aarav Sharma", userHandle: "@aarav.traveloop",
            userInitials: "AS",
            avatarGradient: [Color(hex: "#004AC6"), Color(hex: "#006242")],
            isVerified: true, isFollowing: false,
            destination: "Paris", country: "France 🇫🇷",
            destinationIcon: "building.columns.fill",
            gradientColors: [Color(hex: "#004AC6"), Color(hex: "#006591")],
            text: "Day 3 in Paris — The Louvre didn't disappoint. Pro tip: enter via Passage Richelieu to skip the main queue. The Egyptian antiquities wing is criminally underrated. 🏛️",
            tags: ["Paris", "France", "Museum", "TravelTips"],
            likes: 76, commentCount: 18,
            postedAt: Date().addingTimeInterval(-3600 * 12),
            timeAgo: "12h ago"
        ),
        CommunityPost(
            id: UUID(), userName: "Elena Costa", userHandle: "@elena.globe",
            userInitials: "EC",
            avatarGradient: [Color(hex: "#C44900"), Color(hex: "#9B2335")],
            isVerified: false, isFollowing: false,
            destination: "Marrakech", country: "Morocco 🇲🇦",
            destinationIcon: "sun.haze.fill",
            gradientColors: [Color(hex: "#8B5E3C"), Color(hex: "#C44900")],
            text: "The souks of Marrakech are a labyrinth of colour, spice, and sound. I bargained for a handwoven rug and left with three. No regrets — each one tells a story. 🧡",
            tags: ["Marrakech", "Morocco", "Culture", "Shopping"],
            likes: 54, commentCount: 9,
            postedAt: Date().addingTimeInterval(-3600 * 18),
            timeAgo: "18h ago"
        ),
        CommunityPost(
            id: UUID(), userName: "James Mitchell", userHandle: "@james.ontheroad",
            userInitials: "JM",
            avatarGradient: [Color(hex: "#006591"), Color(hex: "#1A6B8A")],
            isVerified: true, isFollowing: true,
            destination: "Queenstown", country: "New Zealand 🇳🇿",
            destinationIcon: "mountain.2.fill",
            gradientColors: [Color(hex: "#006591"), Color(hex: "#006242")],
            text: "Bungee jumped off the Kawarau Bridge today. My hands are still shaking as I type this. 134 metres of pure freefall. Would I do it again? Absolutely. 🪂",
            tags: ["Queenstown", "NewZealand", "Adventure", "BungeeJump"],
            likes: 167, commentCount: 31,
            postedAt: Date().addingTimeInterval(-3600 * 24),
            timeAgo: "1d ago"
        ),
        CommunityPost(
            id: UUID(), userName: "Yuki Tanaka", userHandle: "@yuki.travels",
            userInitials: "YT",
            avatarGradient: [Color(hex: "#9B2335"), Color(hex: "#6B4FA0")],
            isVerified: false, isFollowing: false,
            destination: "Cape Town", country: "South Africa 🇿🇦",
            destinationIcon: "water.waves",
            gradientColors: [Color(hex: "#006242"), Color(hex: "#004AC6")],
            text: "Table Mountain at golden hour is a masterpiece of nature. The cable car ride up gives you a 360° panorama that will leave you speechless. Africa, you have my heart. 🦁",
            tags: ["CapeTown", "SouthAfrica", "TableMountain", "GoldenHour"],
            likes: 93, commentCount: 14,
            postedAt: Date().addingTimeInterval(-3600 * 36),
            timeAgo: "1d ago"
        ),
    ]
}
