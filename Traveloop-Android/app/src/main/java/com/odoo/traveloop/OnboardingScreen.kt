package com.odoo.traveloop
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
@Composable
fun OnboardingScreen(onSkipClicked: () -> Unit = {}, onGetStartedClicked: () -> Unit = {}) {
    val deepBlue = Color(0xFF2563EB)
    val navy = Color(0xFF0F172A)
    val sora = FontFamily.SansSerif
    val jakarta = FontFamily.SansSerif
    var currentPage by remember { mutableIntStateOf(0) }
    val pages = listOf(
        Triple("Plan with AI", "Generate perfect multi-city itineraries in seconds. Our AI analyzes millions of routes to build your effortless journey.", listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8))),
        Triple("Smart Budgeting", "Track every expense across flights, stays, and activities. Real-time insights keep your travel budget on track.", listOf(Color(0xFF10B981), Color(0xFF047857))),
        Triple("Explore Together", "Share itineraries with friends and family. Collaborate in real-time to plan the perfect group adventure.", listOf(Color(0xFF7C3AED), Color(0xFF5B21B6)))
    )
    Column(Modifier.fillMaxSize().background(Color(0xFFF8F9FB)).padding(24.dp)) {
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
            TextButton(onClick = onSkipClicked) {
                Text("Skip", style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A809B)))
            }
        }
        Spacer(Modifier.height(24.dp))
        Box(
            Modifier.fillMaxWidth().weight(1f)
                .shadow(12.dp, RoundedCornerShape(24.dp), spotColor = deepBlue.copy(alpha = 0.15f))
                .clip(RoundedCornerShape(24.dp))
                .background(Brush.verticalGradient(pages[currentPage].third)),
            contentAlignment = Alignment.Center
        ) {
            Column(Modifier.padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("✈️", fontSize = 64.sp)
                Spacer(Modifier.height(16.dp))
                Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.9f)))
            }
        }
        Spacer(Modifier.height(32.dp))
        Text(
            pages[currentPage].first,
            Modifier.fillMaxWidth(), textAlign = TextAlign.Center,
            style = TextStyle(fontFamily = sora, fontSize = 32.sp, fontWeight = FontWeight.Bold, color = deepBlue)
        )
        Spacer(Modifier.height(16.dp))
        Text(
            pages[currentPage].second,
            Modifier.fillMaxWidth(), textAlign = TextAlign.Center,
            style = TextStyle(fontFamily = jakarta, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color(0xFF4A4E5C), lineHeight = 24.sp)
        )
        Spacer(Modifier.height(32.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            repeat(3) { i ->
                val width by animateDpAsState(if (i == currentPage) 24.dp else 8.dp, tween(300), label = "")
                Box(Modifier.size(width, 8.dp).clip(CircleShape).background(if (i == currentPage) deepBlue else Color(0xFFDDE5FF)))
                if (i < 2) Spacer(Modifier.width(8.dp))
            }
        }
        Spacer(Modifier.height(40.dp))
        Button(
            onClick = { if (currentPage < 2) currentPage++ else onGetStartedClicked() },
            Modifier.fillMaxWidth().height(56.dp).shadow(8.dp, RoundedCornerShape(50), spotColor = deepBlue.copy(alpha = 0.3f)),
            shape = RoundedCornerShape(50),
            colors = ButtonDefaults.buttonColors(containerColor = deepBlue)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (currentPage < 2) "Next" else "Get Started", style = TextStyle(fontFamily = sora, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White))
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = Color.White)
            }
        }
    }
}
