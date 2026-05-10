// PackingChecklistScreen.swift
// Traveloop – Packing Checklist
// Interactive checklist with real-time progress tracking and glassmorphic categories.

import SwiftUI

struct PackingChecklistScreen: View {
    
    // MARK: - Properties
    
    let trip: Trip
    
    // MARK: - State
    
    @State private var items: [ChecklistItem] = MockData.packingChecklist.items
    @State private var appeared = false
    @State private var searchText = ""
    
    // MARK: - Computed
    
    private var progress: Double {
        guard !items.isEmpty else { return 0 }
        let completed = items.filter { $0.isCompleted }.count
        return Double(completed) / Double(items.count)
    }
    
    private var categories: [ChecklistCategory] {
        Array(Set(items.map { $0.category })).sorted { $0.rawValue < $1.rawValue }
    }
    
    // MARK: - Body
    
    var body: some View {
        ZStack {
            Theme.Gradient.backgroundCanvas.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // 1. Progress Header
                progressHeader
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                
                // 2. Checklist Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: Theme.Spacing.lg) {
                        ForEach(categories, id: \.self) { category in
                            categorySection(for: category)
                        }
                    }
                    .padding(Theme.Spacing.md)
                    .padding(.top, Theme.Spacing.md)
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationTitle("Packing List")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            withAnimation(Theme.Animation.spring.delay(0.1)) { appeared = true }
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Progress Header
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private var progressHeader: some View {
        VStack(spacing: Theme.Spacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Trip Progress")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Color.textTertiary)
                    Text("\(Int(progress * 100))% Packed")
                        .font(Theme.Typography.headline)
                        .foregroundStyle(Theme.Color.textPrimary)
                }
                Spacer()
                
                // Done button or stats
                Text("\(items.filter { $0.isCompleted }.count)/\(items.count) Items")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Color.primary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Theme.Color.primary.opacity(0.1))
                    .clipShape(Capsule())
            }
            
            // Custom Progress View
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 10)
                    
                    Capsule()
                        .fill(Theme.Gradient.primaryHero)
                        .frame(width: geo.size.width * CGFloat(progress), height: 10)
                        .shadow(color: Theme.Color.primary.opacity(0.4), radius: 6, y: 2)
                }
            }
            .frame(height: 10)
        }
        .padding(Theme.Spacing.md)
        .glassBackground(style: .light, cornerRadius: 0)
        .shadow(color: Color.black.opacity(0.05), radius: 10, y: 5)
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARK: - Category Section
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private func categorySection(for category: ChecklistCategory) -> some View {
        let categoryItems = items.filter { $0.category == category }
        
        return VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                Text(category.rawValue.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.Color.textTertiary)
                
                Spacer()
                
                Text("\(categoryItems.filter { $0.isCompleted }.count)/\(categoryItems.count)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Color.textTertiary)
            }
            .padding(.horizontal, 4)
            
            VStack(spacing: 2) {
                ForEach(categoryItems) { item in
                    checklistRow(for: item)
                }
            }
            .glassCard(style: .regular, padding: EdgeInsets())
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg))
        }
    }
    
    private func checklistRow(for item: ChecklistItem) -> some View {
        let isLast = items.filter { $0.category == item.category }.last?.id == item.id
        
        return Button {
            toggleItem(item)
        } label: {
            VStack(spacing: 0) {
                HStack(spacing: Theme.Spacing.md) {
                    // Custom Checkbox
                    ZStack {
                        Circle()
                            .strokeBorder(item.isCompleted ? Theme.Color.primary : Theme.Color.textTertiary.opacity(0.4), lineWidth: 2)
                            .frame(width: 24, height: 24)
                        
                        if item.isCompleted {
                            Circle()
                                .fill(Theme.Color.primary)
                                .frame(width: 16, height: 16)
                                .transition(.scale.combined(with: .opacity))
                            
                            Image(systemName: "checkmark")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.title)
                            .font(Theme.Typography.bodyLarge)
                            .foregroundStyle(item.isCompleted ? Theme.Color.textTertiary : Theme.Color.textPrimary)
                            .strikethrough(item.isCompleted)
                        
                        if let notes = item.notes {
                            Text(notes)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Color.textTertiary)
                                .lineLimit(1)
                        }
                    }
                    
                    Spacer()
                    
                    if item.priority == .critical {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(.orange)
                    }
                    
                    if item.quantity > 1 {
                        Text("x\(item.quantity)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Color.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.white.opacity(0.05))
                            .clipShape(Capsule())
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.md)
                .contentShape(Rectangle())
                
                if !isLast {
                    Divider()
                        .background(Color.white.opacity(0.05))
                        .padding(.leading, 56)
                }
            }
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Logic
    
    private func toggleItem(_ item: ChecklistItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            withAnimation(Theme.Animation.fastSpring) {
                items[index].isCompleted.toggle()
            }
            
            // Haptic Feedback
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }
    }
}
