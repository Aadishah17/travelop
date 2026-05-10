// GlassModifier.swift
// Traveloop – Futuristic Glassmorphism Design System
// Provides glass-surface view modifiers, styles, and pre-built GlassCard container.

import SwiftUI

// MARK: - Glass Style Variants

/// Defines the visual intensity of the glass effect.
public enum GlassStyle: Sendable {
    /// Subtle frosted surface — ideal for secondary cards and overlays.
    case light
    /// Standard frosted surface — the primary glass card style.
    case regular
    /// Deeper frost for prominent surfaces, modals, or hero banners.
    case heavy
    /// Coloured glass tinted with the brand primary — for featured elements.
    case tinted(color: Color = Theme.Color.primary)

    var fillOpacity: Double {
        switch self {
        case .light:         return 0.07
        case .regular:       return 0.12
        case .heavy:         return 0.18
        case .tinted:        return 0.15
        }
    }

    var blurRadius: CGFloat {
        switch self {
        case .light:         return 12
        case .regular:       return 20
        case .heavy:         return 28
        case .tinted:        return 20
        }
    }

    var borderOpacity: Double { 0.20 }

    var fillColor: Color {
        switch self {
        case .tinted(let color): return color
        default:                 return .white
        }
    }
}

// MARK: - GlassCardModifier

/// A reusable `ViewModifier` that applies a frosted-glass surface to any SwiftUI view.
///
/// Characteristics (at `.regular` style):
/// - `UIBlurEffect` backdrop blur with 20 pt radius
/// - White fill at 12% opacity
/// - 1 px border in white at 20% opacity
/// - Top-edge shimmer highlight for depth
/// - Configurable corner radius and shadow
///
/// Usage:
/// ```swift
/// Text("Hello")
///     .modifier(GlassCardModifier())
///
/// // or via the convenience extension:
/// Text("Hello")
///     .glassCard()
/// ```
public struct GlassCardModifier: ViewModifier {

    // MARK: Properties

    let style: GlassStyle
    let cornerRadius: CGFloat
    let padding: EdgeInsets
    let shadow: Theme.Shadow.Style?
    let applyShimmer: Bool

    // MARK: Init

    public init(
        style: GlassStyle = .regular,
        cornerRadius: CGFloat = Theme.Radius.xl,
        padding: EdgeInsets = EdgeInsets(
            top: Theme.Spacing.lg,
            leading: Theme.Spacing.lg,
            bottom: Theme.Spacing.lg,
            trailing: Theme.Spacing.lg
        ),
        shadow: Theme.Shadow.Style? = Theme.Shadow.medium,
        applyShimmer: Bool = true
    ) {
        self.style         = style
        self.cornerRadius  = cornerRadius
        self.padding       = padding
        self.shadow        = shadow
        self.applyShimmer  = applyShimmer
    }

    // MARK: Body

    public func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                GlassSurface(
                    style: style,
                    cornerRadius: cornerRadius,
                    applyShimmer: applyShimmer
                )
            )
            .shadow(
                color:  shadow?.color  ?? .clear,
                radius: shadow?.radius ?? 0,
                x:      shadow?.x      ?? 0,
                y:      shadow?.y      ?? 0
            )
    }
}

// MARK: - GlassSurface (Internal Building Block)

/// The layered glass surface background used by `GlassCardModifier`.
/// Separated so it can also be used standalone as a background shape.
public struct GlassSurface: View {

    let style: GlassStyle
    let cornerRadius: CGFloat
    let applyShimmer: Bool

    public init(
        style: GlassStyle = .regular,
        cornerRadius: CGFloat = Theme.Radius.xl,
        applyShimmer: Bool = true
    ) {
        self.style        = style
        self.cornerRadius = cornerRadius
        self.applyShimmer = applyShimmer
    }

    public var body: some View {
        ZStack {
            // Layer 1 — UIKit blur effect (true backdrop blur)
            BlurView(radius: style.blurRadius)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))

            // Layer 2 — Translucent colour fill
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .fill(style.fillColor.opacity(style.fillOpacity))

            // Layer 3 — Top shimmer highlight (depth cue)
            if applyShimmer {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(Theme.Gradient.glassShimmer)
            }

            // Layer 4 — 1-px border at 20% white opacity
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .strokeBorder(
                    Color.white.opacity(style.borderOpacity),
                    lineWidth: 1
                )
        }
    }
}

// MARK: - BlurView (UIViewRepresentable)

/// Wraps `UIVisualEffectView` to deliver a true backdrop blur in SwiftUI.
/// Uses `UIBlurEffect.Style.systemThinMaterial` for a clean, luminous look.
public struct BlurView: UIViewRepresentable {

    let radius: CGFloat

    public init(radius: CGFloat = 20) {
        self.radius = radius
    }

    public func makeUIView(context: Context) -> UIVisualEffectView {
        let view = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterialLight))
        return view
    }

    public func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        // Effect style is constant; no dynamic updates needed.
    }
}

// MARK: - View Extension

public extension View {

    /// Applies the standard Traveloop glass card surface to any view.
    ///
    /// - Parameters:
    ///   - style:        Visual intensity of the frosted surface. Default: `.regular`.
    ///   - cornerRadius: Corner radius. Default: `Theme.Radius.xl` (20 pt).
    ///   - padding:      Internal padding. Default: `Theme.Spacing.lg` (24 pt) on all edges.
    ///   - shadow:       Drop shadow style token. Default: `Theme.Shadow.medium`.
    ///   - applyShimmer: Whether to add the top-edge shimmer highlight. Default: `true`.
    func glassCard(
        style: GlassStyle = .regular,
        cornerRadius: CGFloat = Theme.Radius.xl,
        padding: EdgeInsets = EdgeInsets(
            top: Theme.Spacing.lg,
            leading: Theme.Spacing.lg,
            bottom: Theme.Spacing.lg,
            trailing: Theme.Spacing.lg
        ),
        shadow: Theme.Shadow.Style? = Theme.Shadow.medium,
        applyShimmer: Bool = true
    ) -> some View {
        self.modifier(
            GlassCardModifier(
                style: style,
                cornerRadius: cornerRadius,
                padding: padding,
                shadow: shadow,
                applyShimmer: applyShimmer
            )
        )
    }

    /// Applies a borderless glass background (no padding) — useful for full-bleed surfaces.
    func glassBackground(
        style: GlassStyle = .regular,
        cornerRadius: CGFloat = Theme.Radius.xl
    ) -> some View {
        self.background(
            GlassSurface(style: style, cornerRadius: cornerRadius, applyShimmer: false)
        )
    }
}

// MARK: - Pre-Built GlassCard Container

/// A ready-to-use glass card container view.
///
/// Usage:
/// ```swift
/// GlassCard {
///     Text("Destination")
///         .font(Theme.Typography.headline)
///         .foregroundStyle(Theme.Color.textPrimary)
/// }
///
/// GlassCard(style: .tinted(), cornerRadius: Theme.Radius.xxl) {
///     // Featured content
/// }
/// ```
public struct GlassCard<Content: View>: View {

    // MARK: Properties

    private let style:        GlassStyle
    private let cornerRadius: CGFloat
    private let padding:      EdgeInsets
    private let shadow:       Theme.Shadow.Style?
    private let applyShimmer: Bool
    private let content:      Content

    // MARK: Init

    public init(
        style: GlassStyle = .regular,
        cornerRadius: CGFloat = Theme.Radius.xl,
        padding: EdgeInsets = EdgeInsets(
            top: Theme.Spacing.lg,
            leading: Theme.Spacing.lg,
            bottom: Theme.Spacing.lg,
            trailing: Theme.Spacing.lg
        ),
        shadow: Theme.Shadow.Style? = Theme.Shadow.medium,
        applyShimmer: Bool = true,
        @ViewBuilder content: () -> Content
    ) {
        self.style        = style
        self.cornerRadius = cornerRadius
        self.padding      = padding
        self.shadow       = shadow
        self.applyShimmer = applyShimmer
        self.content      = content()
    }

    // MARK: Body

    public var body: some View {
        content
            .glassCard(
                style:        style,
                cornerRadius: cornerRadius,
                padding:      padding,
                shadow:       shadow,
                applyShimmer: applyShimmer
            )
    }
}
