// ItineraryBuilderScreen.swift
// Traveloop – Itinerary Builder
// Vertical timeline with glowing emerald dots, day headers, and activity GlassCards.

import SwiftUI

// MARK: - Itinerary Builder Screen

struct ItineraryBuilderScreen: View {

    // MARK: - Properties

    let trip: Trip
    private var itinerary: Itinerary { MockData.parisRomeItinerary }

    // MARK: - State

    @State private var selectedDayIndex: Int = 0
    @State private var appeared = false
    @Environment(\.dismiss) private var dismiss

    // MARK: - Constants

    /// Emerald Green for glowing timeline dots
    private let emerald = Color(hex: "#006242")

    // MARK: - Body

    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()

            VStack(spacing: 0) {
                // Trip summary header
                tripSummaryHeader
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -15)

                // Day selector
                daySelector
                    .opacity(appeared ? 1 : 0)

                // Timeline
                ScrollView(showsIndicators: false) {
                    timelineContent
                        .padding(.horizontal, Theme.Spacing.md)
                        .padding(.top, Theme.Spacing.md)
                        .padding(.bottom, 100)
                }
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 20)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle("Itinerary")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("Add Activity", systemImage: "plus") { }
                    Button("Reorder", systemImage: "arrow.up.arrow.down") { }
                    Button("Share", systemImage: "square.and.arrow.up") { }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(Theme.Color.textSecondary)
                }
            }
        }
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.15)) { appeared = true }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Trip Summary Header
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var tripSummaryHeader: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Progress ring
            progressRing

            // Trip info
            VStack(alignment: .leading, spacing: 4) {
                Text(trip.title)
                    .font(Theme.Typography.headlineSmall)
                    .foregroundStyle(Theme.Color.textPrimary)

                Text(trip.dateRangeFormatted)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textSecondary)

                HStack(spacing: Theme.Spacing.sm) {
                    miniChip(icon: "mappin", text: "\(trip.destinations.count) cities")
                    miniChip(icon: "figure.walk", text: "\(itinerary.totalActivities) activities")
                }
            }

            Spacer()

            // Companion avatars
            companionStack
        }
        .padding(Theme.Spacing.md)
        .glassBackground(style: .light, cornerRadius: 0)
    }

    private var progressRing: some View {
        ZStack {
            Circle()
                .stroke(emerald.opacity(0.15), lineWidth: 5)
                .frame(width: 54, height: 54)

            Circle()
                .trim(from: 0, to: itinerary.progressPercentage)
                .stroke(
                    emerald,
                    style: StrokeStyle(lineWidth: 5, lineCap: .round)
                )
                .frame(width: 54, height: 54)
                .rotationEffect(.degrees(-90))
                .shadow(color: emerald.opacity(0.4), radius: 6, y: 0)

            Text("\(Int(itinerary.progressPercentage * 100))%")
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Color.textPrimary)
        }
    }

    private func miniChip(icon: String, text: String) -> some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 9, weight: .semibold))
            Text(text)
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(Theme.Color.textTertiary)
    }

    private var companionStack: some View {
        HStack(spacing: -8) {
            ForEach(Array(trip.companions.prefix(3).enumerated()), id: \.element.id) { index, companion in
                ZStack {
                    Circle()
                        .fill(avatarGradient(for: index))
                        .frame(width: 30, height: 30)
                    Text(companion.initials)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                }
                .overlay(Circle().stroke(Theme.Color.background, lineWidth: 2))
                .zIndex(Double(3 - index))
            }
        }
    }

    private func avatarGradient(for index: Int) -> LinearGradient {
        let palettes: [[Color]] = [
            [Theme.Color.primary, Theme.Color.secondary],
            [Theme.Color.secondary, Theme.Color.tertiary],
            [Color(hex: "#6B4FA0"), Theme.Color.primary],
        ]
        let colors = palettes[index % palettes.count]
        return LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Day Selector
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private var daySelector: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(Array(itinerary.days.enumerated()), id: \.element.id) { index, day in
                        daySelectorPill(index: index, day: day)
                            .id(index)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.sm)
            }
            .onChange(of: selectedDayIndex) { newValue in
                withAnimation(Theme.Animation.fastSpring) {
                    proxy.scrollTo(newValue, anchor: .center)
                }
            }
        }
    }

    private func daySelectorPill(index: Int, day: ItineraryDay) -> some View {
        let isSelected = selectedDayIndex == index
        let city = index < 5 ? "Paris" : "Rome"

        return Button {
            withAnimation(Theme.Animation.fastSpring) {
                selectedDayIndex = index
            }
        } label: {
            VStack(spacing: 3) {
                Text("DAY \(day.dayNumber)")
                    .font(.system(size: 9, weight: .bold))
                    .kerning(0.8)

                Text(city)
                    .font(Theme.Typography.caption)
            }
            .foregroundStyle(isSelected ? .white : Theme.Color.textSecondary)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.xs)
            .background(
                Capsule()
                    .fill(isSelected ? AnyShapeStyle(LinearGradient(colors: [emerald, Color(hex: "#2D7D46")], startPoint: .leading, endPoint: .trailing)) : AnyShapeStyle(Color.white.opacity(0.0001)))
            )
            .overlay(
                Capsule()
                    .strokeBorder(isSelected ? Color.clear : Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: isSelected ? emerald.opacity(0.3) : .clear, radius: 8, y: 2)
        }
        .buttonStyle(.plain)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Timeline Content
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    @ViewBuilder
    private var timelineContent: some View {
        let day = itinerary.days[selectedDayIndex]

        // Day title header
        VStack(alignment: .leading, spacing: 4) {
            Text(day.title)
                .font(Theme.Typography.headline)
                .foregroundStyle(Theme.Color.textPrimary)

            HStack(spacing: Theme.Spacing.sm) {
                Text(day.dateFormatted)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Color.textSecondary)

                Spacer()

                if day.estimatedDayCost > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "creditcard")
                            .font(.system(size: 11, weight: .medium))
                        Text("Est. €\(NSDecimalNumber(decimal: day.estimatedDayCost).intValue)")
                            .font(Theme.Typography.label)
                    }
                    .foregroundStyle(emerald)
                    .padding(.horizontal, Theme.Spacing.xs)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(emerald.opacity(0.10)))
                }
            }
        }
        .padding(.bottom, Theme.Spacing.md)
        .id(day.id) // Force re-render on day change

        // Activity timeline
        ForEach(Array(day.activities.enumerated()), id: \.element.id) { index, activity in
            TimelineRow(
                activity: activity,
                isFirst: index == 0,
                isLast: index == day.activities.count - 1,
                emerald: emerald
            )
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: - Timeline Row
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// A single row in the vertical timeline: glowing dot + connecting line + GlassCard.
private struct TimelineRow: View {

    let activity: Activity
    let isFirst: Bool
    let isLast: Bool
    let emerald: Color

    @State private var glowPulse = false

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            // Timeline rail
            timelineRail

            // Activity card
            activityCard
        }
        .onAppear {
            withAnimation(
                .easeInOut(duration: 1.6)
                .repeatForever(autoreverses: true)
            ) {
                glowPulse = true
            }
        }
    }

    // MARK: - Timeline Rail

    private var timelineRail: some View {
        VStack(spacing: 0) {
            // Upper connector
            Rectangle()
                .fill(isFirst ? Color.clear : emerald.opacity(0.25))
                .frame(width: 2, height: 16)

            // Glowing dot
            ZStack {
                // Outer glow ring
                Circle()
                    .fill(emerald.opacity(glowPulse ? 0.25 : 0.08))
                    .frame(width: 28, height: 28)

                // Mid glow
                Circle()
                    .fill(emerald.opacity(glowPulse ? 0.45 : 0.15))
                    .frame(width: 18, height: 18)

                // Core dot
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "#00E676"), emerald],
                            center: .center,
                            startRadius: 0,
                            endRadius: 8
                        )
                    )
                    .frame(width: 12, height: 12)
                    .shadow(color: emerald.opacity(0.6), radius: glowPulse ? 8 : 4)

                // Status check mark
                if activity.status == .confirmed || activity.status == .completed {
                    Image(systemName: "checkmark")
                        .font(.system(size: 6, weight: .black))
                        .foregroundStyle(.white)
                }
            }

            // Lower connector
            Rectangle()
                .fill(isLast ? Color.clear : emerald.opacity(0.25))
                .frame(width: 2)
                .frame(maxHeight: .infinity)
        }
        .frame(width: 28)
    }

    // MARK: - Activity Card

    private var activityCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            // Time row
            HStack(spacing: Theme.Spacing.xs) {
                Text(activity.timeFormatted)
                    .font(Theme.Typography.label)
                    .foregroundStyle(emerald)

                Text("·")
                    .foregroundStyle(Theme.Color.textTertiary)

                Text(activity.durationFormatted)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)

                Spacer()

                // Bookmark
                if activity.isFavorite {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(.red.opacity(0.7))
                }
            }

            // Title + category icon
            HStack(spacing: Theme.Spacing.xs) {
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                        .fill(Color(hex: activity.category.colorHex).opacity(0.12))
                        .frame(width: 36, height: 36)

                    Image(systemName: activity.category.icon)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(Color(hex: activity.category.colorHex))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(activity.title)
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(Theme.Color.textPrimary)
                        .lineLimit(2)

                    Text(activity.location.name)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.textSecondary)
                }
            }

            // Description
            if !activity.description.isEmpty {
                Text(activity.description)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Color.textSecondary)
                    .lineLimit(2)
            }

            // Bottom metadata row
            HStack(spacing: Theme.Spacing.sm) {
                // Category badge
                Text(activity.category.rawValue)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Color(hex: activity.category.colorHex))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(
                        Capsule().fill(Color(hex: activity.category.colorHex).opacity(0.08))
                    )

                // Status badge
                HStack(spacing: 3) {
                    Image(systemName: activity.status.icon)
                        .font(.system(size: 9, weight: .semibold))
                    Text(activity.status.rawValue)
                        .font(Theme.Typography.caption)
                }
                .foregroundStyle(
                    activity.status == .confirmed ? emerald : Theme.Color.textTertiary
                )

                Spacer()

                // Cost
                if let cost = activity.formattedCost {
                    Text(cost)
                        .font(Theme.Typography.label)
                        .foregroundStyle(Theme.Color.textPrimary)
                }
            }

            // Notes callout
            if let notes = activity.notes, !notes.isEmpty {
                HStack(spacing: 6) {
                    Image(systemName: "lightbulb.fill")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.orange)
                    Text(notes)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.textSecondary)
                        .lineLimit(1)
                }
                .padding(.horizontal, Theme.Spacing.xs)
                .padding(.vertical, 4)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                        .fill(.orange.opacity(0.06))
                )
            }
        }
        .glassCard(
            style: .regular,
            cornerRadius: Theme.Radius.xl,
            padding: EdgeInsets(
                top: Theme.Spacing.md,
                leading: Theme.Spacing.md,
                bottom: Theme.Spacing.md,
                trailing: Theme.Spacing.md
            ),
            shadow: Theme.Shadow.soft
        )
        .padding(.bottom, Theme.Spacing.xs)
    }
}
