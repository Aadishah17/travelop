// InteractionModifiers.swift
// Traveloop – Micro-Interaction Design System
// Reusable modifiers for press-scale, card-lift, and spring feedback.
// Centralised here for consistency across every interactive element.

import SwiftUI

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Press Scale Button Style
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// A button style that applies a subtle 0.98 scale + slight opacity
/// reduction on press, giving tactile feedback without disrupting layout.
///
/// Usage:
/// ```swift
/// Button("Tap me") { }
///     .buttonStyle(PressScaleButtonStyle())
/// ```
struct PressScaleButtonStyle: ButtonStyle {

    var scaleAmount: CGFloat = 0.98
    var opacityAmount: Double = 0.85

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scaleAmount : 1.0)
            .opacity(configuration.isPressed ? opacityAmount : 1.0)
            .animation(Theme.Animation.fastSpring, value: configuration.isPressed)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Card Lift Modifier
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Adds a press-and-hold "lift" effect: the card scales down slightly,
/// shifts upward, and deepens its shadow to simulate physical elevation.
///
/// Usage:
/// ```swift
/// TripCardView(trip: trip)
///     .cardLift()
/// ```
struct CardLiftModifier: ViewModifier {

    var liftOffset: CGFloat
    var scaleAmount: CGFloat
    var shadowRadius: CGFloat

    @State private var isPressed = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scaleAmount : 1.0)
            .offset(y: isPressed ? liftOffset : 0)
            .shadow(
                color: Theme.Color.shadowColor.opacity(isPressed ? 0.25 : 0.12),
                radius: isPressed ? shadowRadius : 12,
                y: isPressed ? 8 : 4
            )
            .animation(Theme.Animation.fastSpring, value: isPressed)
            .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
                isPressed = pressing
            }, perform: {})
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Stagger Animation Modifier
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Adds a staggered entrance animation to child views, useful for lists.
/// Each item fades in and slides up with an incremental delay.
struct StaggeredEntrance: ViewModifier {

    let index: Int
    let appeared: Bool
    var baseDelay: Double = 0.04

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 18)
            .animation(
                Theme.Animation.spring.delay(Double(index) * baseDelay),
                value: appeared
            )
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - View Extensions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

extension View {

    /// Applies the card lift micro-interaction on long press.
    /// - Parameters:
    ///   - liftOffset: Y offset when pressed (negative = lift up). Default: -3.
    ///   - scale: Scale factor when pressed. Default: 0.98.
    ///   - shadowRadius: Shadow radius when lifted. Default: 20.
    func cardLift(
        offset: CGFloat = -3,
        scale: CGFloat = 0.98,
        shadowRadius: CGFloat = 20
    ) -> some View {
        self.modifier(
            CardLiftModifier(
                liftOffset: offset,
                scaleAmount: scale,
                shadowRadius: shadowRadius
            )
        )
    }

    /// Applies staggered entrance animation based on index.
    func staggerIn(index: Int, appeared: Bool, delay: Double = 0.04) -> some View {
        self.modifier(StaggeredEntrance(index: index, appeared: appeared, baseDelay: delay))
    }
}
