// ThemePreview.swift
// Traveloop – Design System Preview
// Renders a live visual catalogue of all theme tokens and glass styles.
// Delete this file before shipping to production (or keep it #if DEBUG gated).

#if DEBUG
import SwiftUI

// MARK: - Preview Entry Point

struct ThemePreview: View {
    var body: some View {
        NavigationStack {
            ZStack {
                // Canonical app background
                Theme.Gradient.backgroundCanvas
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Spacing.xl) {

                        colourSection
                        typographySection
                        glassStyleSection
                        shadowSection
                        preBuiltCardSection

                    }
                    .padding(Theme.Spacing.md)
                }
            }
            .navigationTitle("Traveloop Design System")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Colour Swatches

    private var colourSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            sectionHeader("Colour Palette")

            LazyVGrid(
                columns: [GridItem(.flexible()), GridItem(.flexible())],
                spacing: Theme.Spacing.sm
            ) {
                colorSwatch("Background", Theme.Color.background)
                colorSwatch("Primary",    Theme.Color.primary)
                colorSwatch("Secondary",  Theme.Color.secondary)
                colorSwatch("Tertiary",   Theme.Color.tertiary)
            }
        }
    }

    private func colorSwatch(_ name: String, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .fill(color)
                .frame(height: 60)
                .shadow(color: color.opacity(0.4), radius: 8, y: 4)

            Text(name)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Color.textSecondary)
        }
    }

    // MARK: - Typography Scale

    private var typographySection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            sectionHeader("Typography")

            GlassCard(style: .light, shadow: Theme.Shadow.soft) {
                VStack(alignment: .leading, spacing: 10) {
                    typeRow("Display Large",  Theme.Typography.displayLarge,  "Plus Jakarta Sans Bold 40")
                    typeRow("Display Medium", Theme.Typography.displayMedium, "Plus Jakarta Sans Bold 32")
                    typeRow("Headline",       Theme.Typography.headline,      "Plus Jakarta Sans SemiBold 24")
                    typeRow("Subheadline",    Theme.Typography.subheadline,   "Plus Jakarta Sans Medium 16")
                    Divider().opacity(0.3)
                    typeRow("Body Large",     Theme.Typography.bodyLarge,     "Inter Regular 16")
                    typeRow("Body",           Theme.Typography.body,          "Inter Regular 14")
                    typeRow("Button Label",   Theme.Typography.buttonLabel,   "Inter SemiBold 15")
                    typeRow("Caption",        Theme.Typography.caption,       "Inter Regular 11")
                }
            }
        }
    }

    private func typeRow(_ label: String, _ font: Font, _ spec: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(font)
                .foregroundStyle(Theme.Color.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Spacer()

            Text(spec)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Color.textTertiary)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        }
    }

    // MARK: - Glass Style Catalogue

    private var glassStyleSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            sectionHeader("Glass Styles")

            ZStack {
                // Coloured backdrop to make glass visible
                LinearGradient(
                    colors: [Theme.Color.primary, Theme.Color.secondary, Theme.Color.tertiary],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xxl, style: .continuous))

                VStack(spacing: Theme.Spacing.sm) {
                    glassStyleRow(.light,   "Light   – 12 pt blur, 7% fill")
                    glassStyleRow(.regular, "Regular – 20 pt blur, 12% fill  ✦ Default")
                    glassStyleRow(.heavy,   "Heavy   – 28 pt blur, 18% fill")
                    glassStyleRow(.tinted(color: Theme.Color.primary), "Tinted  – 20 pt blur, branded fill")
                }
                .padding(Theme.Spacing.md)
            }
        }
    }

    private func glassStyleRow(_ style: GlassStyle, _ label: String) -> some View {
        Text(label)
            .font(Theme.Typography.body)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassCard(
                style: style,
                cornerRadius: Theme.Radius.lg,
                padding: EdgeInsets(
                    top: Theme.Spacing.sm,
                    leading: Theme.Spacing.md,
                    bottom: Theme.Spacing.sm,
                    trailing: Theme.Spacing.md
                ),
                shadow: nil
            )
    }

    // MARK: - Shadow Scale

    private var shadowSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            sectionHeader("Shadow Scale")

            HStack(spacing: Theme.Spacing.md) {
                shadowCard("Soft",   Theme.Shadow.soft)
                shadowCard("Medium", Theme.Shadow.medium)
                shadowCard("Strong", Theme.Shadow.strong)
            }
        }
    }

    private func shadowCard(_ label: String, _ shadow: Theme.Shadow.Style) -> some View {
        Text(label)
            .font(Theme.Typography.subheadline)
            .foregroundStyle(Theme.Color.textPrimary)
            .frame(maxWidth: .infinity)
            .padding(Theme.Spacing.md)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
            .shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }

    // MARK: - Pre-built GlassCard Demo

    private var preBuiltCardSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            sectionHeader("GlassCard Component")

            ZStack {
                Theme.Gradient.primaryHero
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xxl, style: .continuous))

                GlassCard {
                    HStack(spacing: Theme.Spacing.md) {
                        ZStack {
                            Circle()
                                .fill(Theme.Color.primary.opacity(0.25))
                                .frame(width: 52, height: 52)

                            Image(systemName: "airplane.departure")
                                .font(.system(size: 22, weight: .semibold))
                                .foregroundStyle(.white)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Santorini, Greece")
                                .font(Theme.Typography.headline)
                                .foregroundStyle(.white)

                            Text("7 nights · 2 travellers · from $1,249")
                                .font(Theme.Typography.body)
                                .foregroundStyle(.white.opacity(0.75))
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
                .padding(Theme.Spacing.md)
            }
        }
    }

    // MARK: - Helpers

    private func sectionHeader(_ title: String) -> some View {
        Text(title.uppercased())
            .font(Theme.Typography.label)
            .foregroundStyle(Theme.Color.textTertiary)
            .kerning(1.2)
            .padding(.top, Theme.Spacing.xs)
    }
}

// MARK: - Xcode Preview

#Preview {
    ThemePreview()
}
#endif
