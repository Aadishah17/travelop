// LoginScreen.swift
// Traveloop – Auth
// Premium glassmorphic login screen with animated entry and social login buttons.

import SwiftUI

struct LoginScreen: View {

    // MARK: - State

    @AppStorage("isLoggedIn") private var isLoggedIn: Bool = false
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var isPasswordVisible: Bool = false
    @State private var isLoading: Bool = false

    // Animation states
    @State private var heroOpacity: Double = 0
    @State private var cardOffset: CGFloat = 60
    @State private var cardOpacity: Double = 0
    @State private var footerOpacity: Double = 0

    // MARK: - Body

    var body: some View {
        ZStack {
            // Background
            backgroundLayer

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Hero section
                    heroSection
                        .opacity(heroOpacity)

                    // Glass login card
                    loginCard
                        .offset(y: cardOffset)
                        .opacity(cardOpacity)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, Theme.Spacing.xl)

                    // Footer
                    footerSection
                        .opacity(footerOpacity)
                        .padding(.top, Theme.Spacing.xl)
                        .padding(.bottom, Theme.Spacing.xxl)
                }
                .padding(.top, Theme.Spacing.xxxl)
            }
        }
        .ignoresSafeArea()
        .onAppear { animateIn() }
    }

    // MARK: - Background

    private var backgroundLayer: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas
                .ignoresSafeArea()

            // Decorative gradient orbs
            Circle()
                .fill(Theme.Color.primary.opacity(0.12))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(x: -100, y: -200)

            Circle()
                .fill(Theme.Color.secondary.opacity(0.10))
                .frame(width: 250, height: 250)
                .blur(radius: 70)
                .offset(x: 120, y: -50)

            Circle()
                .fill(Theme.Color.tertiary.opacity(0.08))
                .frame(width: 200, height: 200)
                .blur(radius: 60)
                .offset(x: -80, y: 300)
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: Theme.Spacing.sm) {
            ZStack {
                Circle()
                    .fill(Theme.Gradient.primaryHero)
                    .frame(width: 80, height: 80)
                    .shadow(color: Theme.Color.primary.opacity(0.3), radius: 20, y: 8)

                Image(systemName: "globe.europe.africa")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(.white)
            }

            Text("Traveloop")
                .font(Theme.Typography.displayMedium)
                .foregroundStyle(Theme.Color.textPrimary)

            Text("Journey Beyond Boundaries")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textTertiary)
        }
    }

    // MARK: - Login Card

    private var loginCard: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Card header
            VStack(spacing: Theme.Spacing.xxs) {
                Text("Welcome Back")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Color.textPrimary)

                Text("Sign in to continue your journey")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textSecondary)
            }

            // Email field
            glassTextField(
                icon: "envelope",
                placeholder: "Email address",
                text: $email
            )

            // Password field
            glassSecureField(
                icon: "lock",
                placeholder: "Password",
                text: $password,
                isVisible: $isPasswordVisible
            )

            // Forgot password
            HStack {
                Spacer()
                Button("Forgot Password?") { }
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.primary)
            }

            // Sign in button
            Button {
                performLogin()
            } label: {
                ZStack {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Sign In")
                            .font(Theme.Typography.buttonLabel)
                            .foregroundStyle(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Theme.Gradient.primaryHero)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
                .shadow(color: Theme.Color.primary.opacity(0.35), radius: 16, y: 6)
            }
            .disabled(isLoading)

            // Divider
            dividerRow

            // Social login buttons
            VStack(spacing: Theme.Spacing.sm) {
                socialButton(icon: "apple.logo", label: "Continue with Apple", bgColor: Theme.Color.textPrimary)
                socialButton(icon: "globe", label: "Continue with Google", bgColor: Color.white, textColor: Theme.Color.textPrimary, bordered: true)
            }
        }
        .glassCard(
            style: .regular,
            cornerRadius: Theme.Radius.xxl,
            padding: EdgeInsets(
                top: Theme.Spacing.xl,
                leading: Theme.Spacing.lg,
                bottom: Theme.Spacing.xl,
                trailing: Theme.Spacing.lg
            ),
            shadow: Theme.Shadow.medium
        )
    }

    // MARK: - Footer

    private var footerSection: some View {
        HStack(spacing: Theme.Spacing.xxs) {
            Text("Don't have an account?")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textSecondary)

            Button("Sign Up") { }
                .font(Theme.Typography.buttonLabel)
                .foregroundStyle(Theme.Color.primary)
        }
    }

    // MARK: - Components

    private func glassTextField(icon: String, placeholder: String, text: Binding<String>) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(Theme.Color.textTertiary)
                .frame(width: 20)

            TextField(placeholder, text: text)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Color.textPrimary)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
        }
        .padding(.horizontal, Theme.Spacing.md)
        .frame(height: 50)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .fill(Theme.Color.background.opacity(0.6))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .strokeBorder(Color.white.opacity(0.3), lineWidth: 1)
        )
    }

    private func glassSecureField(icon: String, placeholder: String, text: Binding<String>, isVisible: Binding<Bool>) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(Theme.Color.textTertiary)
                .frame(width: 20)

            Group {
                if isVisible.wrappedValue {
                    TextField(placeholder, text: text)
                } else {
                    SecureField(placeholder, text: text)
                }
            }
            .font(Theme.Typography.body)
            .foregroundStyle(Theme.Color.textPrimary)

            Button {
                isVisible.wrappedValue.toggle()
            } label: {
                Image(systemName: isVisible.wrappedValue ? "eye.slash" : "eye")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Theme.Color.textTertiary)
            }
        }
        .padding(.horizontal, Theme.Spacing.md)
        .frame(height: 50)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .fill(Theme.Color.background.opacity(0.6))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .strokeBorder(Color.white.opacity(0.3), lineWidth: 1)
        )
    }

    private var dividerRow: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Rectangle()
                .fill(Color.white.opacity(0.2))
                .frame(height: 1)
            Text("or")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Color.textTertiary)
            Rectangle()
                .fill(Color.white.opacity(0.2))
                .frame(height: 1)
        }
    }

    private func socialButton(icon: String, label: String, bgColor: Color, textColor: Color = .white, bordered: Bool = false) -> some View {
        Button { } label: {
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                Text(label)
                    .font(Theme.Typography.buttonLabel)
            }
            .foregroundStyle(textColor)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .fill(bgColor)
            )
            .overlay(
                bordered
                ? RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .strokeBorder(Color.gray.opacity(0.2), lineWidth: 1)
                : nil
            )
        }
    }

    // MARK: - Logic

    private func performLogin() {
        withAnimation(Theme.Animation.fastSpring) {
            isLoading = true
        }
        // Simulate network delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(Theme.Animation.spring) {
                isLoading = false
                isLoggedIn = true
            }
        }
    }

    private func animateIn() {
        withAnimation(Theme.Animation.gentle.delay(0.1)) {
            heroOpacity = 1
        }
        withAnimation(Theme.Animation.spring.delay(0.3)) {
            cardOffset = 0
            cardOpacity = 1
        }
        withAnimation(Theme.Animation.gentle.delay(0.6)) {
            footerOpacity = 1
        }
    }
}
