// MainTabView.swift
// Traveloop – Navigation Skeleton
// Root tab bar with 5 tabs: Home, Search, Plan, Community, Profile.
// Home tab uses ViewModel-driven NavigationStack path for seamless transitions.

import SwiftUI

// MARK: - Tab Definition

enum AppTab: Int, CaseIterable, Identifiable {
    case home = 0
    case search
    case plan
    case community
    case profile

    var id: Int { rawValue }

    var title: String {
        switch self {
        case .home:      return "Home"
        case .search:    return "Search"
        case .plan:      return "Plan"
        case .community: return "Community"
        case .profile:   return "Profile"
        }
    }

    var icon: String {
        switch self {
        case .home:      return "house"
        case .search:    return "magnifyingglass"
        case .plan:      return "map"
        case .community: return "person.2"
        case .profile:   return "person.crop.circle"
        }
    }

    var selectedIcon: String {
        switch self {
        case .home:      return "house.fill"
        case .search:    return "magnifyingglass"
        case .plan:      return "map.fill"
        case .community: return "person.2.fill"
        case .profile:   return "person.crop.circle.fill"
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {

    @EnvironmentObject private var tripVM: TripViewModel
    @State private var selectedTab: AppTab = .home
    @State private var tabBarVisible: Bool = true

    init() {
        // Hide the native UITabBar — we use a custom glass tab bar
        UITabBar.appearance().isHidden = true
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Tab content
            TabView(selection: $selectedTab) {
                ForEach(AppTab.allCases) { tab in
                    tabContent(for: tab)
                        .tag(tab)
                }
            }

            // Custom tab bar
            if tabBarVisible {
                customTabBar
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }

    // MARK: - Tab Content Router

    @ViewBuilder
    private func tabContent(for tab: AppTab) -> some View {
        switch tab {
        case .home:
            // Home uses ViewModel-managed path for type-safe navigation
            NavigationStack(path: $tripVM.homePath) {
                HomeScreen()
                    .navigationDestination(for: AppDestination.self) { destination in
                        destinationView(for: destination)
                    }
            }

        case .search:
            NavigationStack { SearchTabPlaceholder() }
        case .plan:
            NavigationStack { PlanTabPlaceholder() }
        case .community:
            NavigationStack { CommunityFeedScreen() }
        case .profile:
            NavigationStack { ProfileTabPlaceholder() }
        }
    }

    // MARK: - Destination Router

    @ViewBuilder
    private func destinationView(for destination: AppDestination) -> some View {
        switch destination {
        case .itinerary(let trip):
            ItineraryBuilderScreen(trip: trip)
        case .budgetInsights(let trip):
            BudgetInsightsScreen(trip: trip)
        case .packingChecklist(let trip):
            PackingChecklistScreen(trip: trip)
        case .expenseInvoice(let trip):
            ExpenseInvoiceScreen(trip: trip)
        case .activityDetail:
            EmptyView() // Future: ActivityDetailScreen
        }
    }

    // MARK: - Custom Tab Bar

    private var customTabBar: some View {
        HStack(spacing: 0) {
            ForEach(AppTab.allCases) { tab in
                tabBarButton(tab)
            }
        }
        .padding(.horizontal, Theme.Spacing.xs)
        .padding(.top, Theme.Spacing.sm)
        .padding(.bottom, Theme.Spacing.lg)
        .glassBackground(style: .heavy, cornerRadius: 0)
        .overlay(alignment: .top) {
            // Top edge highlight
            Rectangle()
                .fill(Color.white.opacity(0.15))
                .frame(height: 0.5)
        }
    }

    private func tabBarButton(_ tab: AppTab) -> some View {
        Button {
            if selectedTab == tab {
                // Double-tap to pop to root (Home only for now)
                if tab == .home {
                    withAnimation(Theme.Animation.fastSpring) {
                        tripVM.popToRoot()
                    }
                }
            } else {
                withAnimation(Theme.Animation.fastSpring) {
                    selectedTab = tab
                }
            }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    // Selected indicator
                    if selectedTab == tab {
                        Capsule()
                            .fill(Theme.Color.primary.opacity(0.12))
                            .frame(width: 48, height: 28)
                    }

                    if #available(iOS 17.0, *) {
                        Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                            .font(.system(size: selectedTab == tab ? 19 : 18, weight: selectedTab == tab ? .semibold : .regular))
                            .foregroundStyle(selectedTab == tab ? Theme.Color.primary : Theme.Color.textTertiary)
                            .symbolEffect(.bounce, value: selectedTab == tab)
                    } else {
                        Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                            .font(.system(size: selectedTab == tab ? 19 : 18, weight: selectedTab == tab ? .semibold : .regular))
                            .foregroundStyle(selectedTab == tab ? Theme.Color.primary : Theme.Color.textTertiary)
                            .scaleEffect(selectedTab == tab ? 1.1 : 1.0)
                    }
                }
                .frame(height: 28)

                Text(tab.title)
                    .font(Theme.Typography.tabLabel)
                    .foregroundStyle(selectedTab == tab ? Theme.Color.primary : Theme.Color.textTertiary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PressScaleButtonStyle())
    }
}
