// Theme.swift
// Traveloop – Futuristic Glassmorphism Design System
// Defines the canonical color palette, typography, spacing, and shadow tokens.

import SwiftUI

// MARK: - Theme Namespace

/// Central design-system namespace for the Traveloop app.
/// Access tokens via `Theme.Color.primary`, `Theme.Typography.headline`, etc.
public enum Theme {

    // MARK: - Color Palette

    public enum Color {
        /// Canvas background — soft off-white with a cool tint (#F8F9FF)
        public static let background   = SwiftUI.Color(hex: "#F8F9FF")

        /// Primary brand blue — deep, confident (#004AC6)
        public static let primary      = SwiftUI.Color(hex: "#004AC6")

        /// Secondary teal — oceanic, trustworthy (#006591)
        public static let secondary    = SwiftUI.Color(hex: "#006591")

        /// Tertiary green — lush, adventure (#006242)
        public static let tertiary     = SwiftUI.Color(hex: "#006242")

        // Semantic glass surface colours
        /// Frosted glass fill — white at 12% for glass cards on light bg
        public static let glassFill    = SwiftUI.Color.white.opacity(0.12)

        /// Frosted glass fill (dark context) — white at 8%
        public static let glassFillDark = SwiftUI.Color.white.opacity(0.08)

        /// 1-px glass border — white at 20%
        public static let glassBorder  = SwiftUI.Color.white.opacity(0.20)

        /// Subtle shadow for depth layering
        public static let shadowColor  = SwiftUI.Color(hex: "#004AC6").opacity(0.18)

        // Text hierarchy
        public static let textPrimary   = SwiftUI.Color(hex: "#0D1240")
        public static let textSecondary = SwiftUI.Color(hex: "#4B5275")
        public static let textTertiary  = SwiftUI.Color(hex: "#8890AB")
        public static let textOnDark    = SwiftUI.Color.white
    }

    // MARK: - Gradient Palette

    public enum Gradient {
        /// Primary hero gradient — left-to-right across brand blues
        public static let primaryHero = LinearGradient(
            colors: [Theme.Color.primary, Theme.Color.secondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        /// Nature gradient — secondary to tertiary
        public static let nature = LinearGradient(
            colors: [Theme.Color.secondary, Theme.Color.tertiary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        /// Background canvas gradient — very subtle
        public static let backgroundCanvas = LinearGradient(
            colors: [
                SwiftUI.Color(hex: "#F0F4FF"),
                SwiftUI.Color(hex: "#F8F9FF"),
                SwiftUI.Color(hex: "#EFF8F3")
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        /// Glass shimmer overlay — used for top-edge highlight on glass cards
        public static let glassShimmer = LinearGradient(
            colors: [
                SwiftUI.Color.white.opacity(0.40),
                SwiftUI.Color.white.opacity(0.00)
            ],
            startPoint: .top,
            endPoint: .center
        )
    }

    // MARK: - Typography Scale

    public enum Typography {
        // Plus Jakarta Sans — Headlines & Display
        public static let displayLarge  = Font.custom(FontName.jakartaSansBold,    size: 40, relativeTo: .largeTitle)
        public static let displayMedium = Font.custom(FontName.jakartaSansBold,    size: 32, relativeTo: .title)
        public static let headline      = Font.custom(FontName.jakartaSansSemiBold, size: 24, relativeTo: .title2)
        public static let headlineSmall = Font.custom(FontName.jakartaSansSemiBold, size: 20, relativeTo: .title3)
        public static let subheadline   = Font.custom(FontName.jakartaSansMedium,  size: 16, relativeTo: .subheadline)

        // Inter — Body & UI Labels
        public static let bodyLarge     = Font.custom(FontName.interRegular,  size: 16, relativeTo: .body)
        public static let body          = Font.custom(FontName.interRegular,  size: 14, relativeTo: .body)
        public static let bodySmall     = Font.custom(FontName.interRegular,  size: 12, relativeTo: .callout)
        public static let label         = Font.custom(FontName.interMedium,   size: 13, relativeTo: .caption)
        public static let caption       = Font.custom(FontName.interRegular,  size: 11, relativeTo: .caption2)
        public static let buttonLabel   = Font.custom(FontName.interSemiBold, size: 15, relativeTo: .body)
        public static let tabLabel      = Font.custom(FontName.interMedium,   size: 10, relativeTo: .caption2)
    }

    // MARK: - Font Names

    /// PostScript font names as registered in the app bundle.
    /// Falls back gracefully to system fonts if a custom font fails to load.
    public enum FontName {
        // Plus Jakarta Sans
        public static let jakartaSansBold      = "PlusJakartaSans-Bold"
        public static let jakartaSansSemiBold  = "PlusJakartaSans-SemiBold"
        public static let jakartaSansMedium    = "PlusJakartaSans-Medium"
        public static let jakartaSansRegular   = "PlusJakartaSans-Regular"

        // Inter
        public static let interBold            = "Inter-Bold"
        public static let interSemiBold        = "Inter-SemiBold"
        public static let interMedium          = "Inter-Medium"
        public static let interRegular         = "Inter-Regular"
    }

    // MARK: - Spacing Scale (8-pt grid)

    public enum Spacing {
        public static let xxs:  CGFloat = 4
        public static let xs:   CGFloat = 8
        public static let sm:   CGFloat = 12
        public static let md:   CGFloat = 16
        public static let lg:   CGFloat = 24
        public static let xl:   CGFloat = 32
        public static let xxl:  CGFloat = 48
        public static let xxxl: CGFloat = 64
    }

    // MARK: - Corner Radius Tokens

    public enum Radius {
        public static let sm:   CGFloat = 8
        public static let md:   CGFloat = 12
        public static let lg:   CGFloat = 16
        public static let xl:   CGFloat = 20
        public static let xxl:  CGFloat = 28
        public static let pill: CGFloat = 999
    }

    // MARK: - Shadow Tokens

    public enum Shadow {
        public struct Style: Sendable {
            let color: SwiftUI.Color
            let radius: CGFloat
            let x: CGFloat
            let y: CGFloat
        }

        public static let soft = Style(
            color: Color.shadowColor,
            radius: 12,
            x: 0,
            y: 4
        )

        public static let medium = Style(
            color: Color.shadowColor,
            radius: 24,
            x: 0,
            y: 8
        )

        public static let strong = Style(
            color: Color.shadowColor,
            radius: 40,
            x: 0,
            y: 16
        )
    }

    // MARK: - Animation Tokens

    public enum Animation {
        /// Standard spring — most interactive transitions
        public static let spring = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.75)

        /// Fast spring — micro-interactions (button press, toggle)
        public static let fastSpring = SwiftUI.Animation.spring(response: 0.25, dampingFraction: 0.8)

        /// Ease out — screen-level transitions
        public static let easeOut = SwiftUI.Animation.easeOut(duration: 0.3)

        /// Gentle ease in-out — content fades
        public static let gentle = SwiftUI.Animation.easeInOut(duration: 0.4)
    }
}
