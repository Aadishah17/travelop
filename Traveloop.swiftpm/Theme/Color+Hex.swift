// Color+Hex.swift
// Traveloop – Design System Utilities
// Extends SwiftUI Color with a convenient hex-string initializer.

import SwiftUI

public extension Color {

    /// Creates a `Color` from a hex string.
    ///
    /// Supports the following formats (with or without leading `#`):
    /// - 6-character RGB:   `"#RRGGBB"` or `"RRGGBB"`
    /// - 8-character ARGB:  `"#AARRGGBB"` or `"AARRGGBB"`
    ///
    /// - Parameter hex: Hex colour string.
    init(hex: String) {
        var sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if sanitized.hasPrefix("#") { sanitized.removeFirst() }

        var value: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&value)

        let r, g, b, a: Double

        switch sanitized.count {
        case 6:  // RGB
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >>  8) & 0xFF) / 255
            b = Double( value        & 0xFF) / 255
            a = 1.0

        case 8:  // ARGB
            a = Double((value >> 24) & 0xFF) / 255
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >>  8) & 0xFF) / 255
            b = Double( value        & 0xFF) / 255

        default:
            r = 0; g = 0; b = 0; a = 1
        }

        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}
