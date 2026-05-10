// ContentView.swift
// Traveloop – Root View
// Auth gate: shows LoginScreen or MainTabView based on @AppStorage login state.
// Injects the shared TripViewModel as an environment object.

import SwiftUI

struct ContentView: View {

    // MARK: - State

    @AppStorage("isLoggedIn") private var isLoggedIn: Bool = false
    @State private var showSplash: Bool = true
    @StateObject private var tripVM = TripViewModel()

    // MARK: - Body

    var body: some View {
        ZStack {
            // Canvas background — always present
            Theme.Gradient.backgroundCanvas
                .ignoresSafeArea()

            if showSplash {
                SplashView()
                    .transition(.opacity)
            } else if isLoggedIn {
                MainTabView()
                    .environmentObject(tripVM)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            } else {
                LoginScreen()
                    .transition(.asymmetric(
                        insertion: .move(edge: .leading).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .animation(Theme.Animation.spring, value: isLoggedIn)
        .animation(Theme.Animation.gentle, value: showSplash)
        .onAppear {
            // Brief splash, then transition to the correct screen
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                withAnimation(Theme.Animation.gentle) {
                    showSplash = false
                }
            }
        }
    }
}

// MARK: - Splash View

/// Minimal branded splash shown for ~1.8 s on launch.
private struct SplashView: View {

    @State private var logoScale: CGFloat = 0.6
    @State private var logoOpacity: Double = 0.0
    @State private var taglineOffset: CGFloat = 20

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Logo icon
            ZStack {
                Circle()
                    .fill(Theme.Gradient.primaryHero)
                    .frame(width: 100, height: 100)
                    .shadow(color: Theme.Color.primary.opacity(0.35), radius: 30, y: 10)

                Image(systemName: "globe.europe.africa")
                    .font(.system(size: 44, weight: .medium))
                    .foregroundStyle(.white)
            }
            .scaleEffect(logoScale)
            .opacity(logoOpacity)

            // App name
            VStack(spacing: Theme.Spacing.xxs) {
                Text("Traveloop")
                    .font(Theme.Typography.displayMedium)
                    .foregroundStyle(Theme.Color.textPrimary)

                Text("Journey Beyond Boundaries")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textTertiary)
                    .offset(y: taglineOffset)
                    .opacity(logoOpacity)
            }
        }
        .onAppear {
            withAnimation(Theme.Animation.spring) {
                logoScale = 1.0
                logoOpacity = 1.0
                taglineOffset = 0
            }
        }
    }
}
