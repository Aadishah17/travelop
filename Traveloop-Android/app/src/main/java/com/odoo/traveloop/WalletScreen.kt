package com.odoo.traveloop
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.Hotel
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
@Composable
fun WalletScreen(
    onNavigateHome: () -> Unit,
    onNavigateToExplore: () -> Unit,
    onNavigateToCreateTrip: () -> Unit,
    onNavigateToProfile: () -> Unit = {}
) {
    val navy = Color(0xFF0F172A)
    val deepBlue = Color(0xFF2563EB)
    val emerald = Color(0xFF10B981)
    val mint = Color(0xFF6EE7B7)
    val gray500 = Color(0xFF64748B)
    val gray400 = Color(0xFF94A3B8)
    val gray200 = Color(0xFFE2E8F0)
    val pageBg = Color(0xFFF8FAFC)
    val cardBg = Color(0xFFFFFFFF)
    val sora = FontFamily.SansSerif
    val jakarta = FontFamily.SansSerif
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val barData = listOf(0.35f, 0.28f, 0.6f, 0.42f, 0.75f, 0.9f, 0.55f)
    val days = listOf("M", "T", "W", "T", "F", "S", "S")
    Scaffold(
        containerColor = pageBg,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            Box(
                Modifier.fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp), clip = false)
                    .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
                    .background(cardBg).padding(horizontal = 8.dp, vertical = 8.dp)
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround, verticalAlignment = Alignment.CenterVertically) {
                    BottomNavItem("HOME", Icons.Default.Home, false, deepBlue, gray400) { onNavigateHome() }
                    BottomNavItem("EXPLORE", Icons.Outlined.Explore, false, deepBlue, gray400) { onNavigateToExplore() }
                    Box(Modifier.size(52.dp).shadow(6.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f)).clip(CircleShape).background(deepBlue).clickable { onNavigateToCreateTrip() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    BottomNavItem("WALLET", Icons.Outlined.AccountBalanceWallet, true, deepBlue, gray400) { }
                    BottomNavItem("PROFILE", Icons.Default.Person, false, deepBlue, gray400) { onNavigateToProfile() }
                }
            }
        }
    ) { innerPadding ->
        Box(Modifier.fillMaxSize().padding(innerPadding)) {
            Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                Spacer(Modifier.height(16.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(40.dp).clip(CircleShape).background(gray200).border(2.dp, deepBlue.copy(alpha = 0.3f), CircleShape), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Person, null, tint = gray500, modifier = Modifier.size(22.dp))
                    }
                    Spacer(Modifier.weight(1f))
                    Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    Spacer(Modifier.weight(1f))
                    Spacer(Modifier.size(40.dp))
                }
                Spacer(Modifier.height(24.dp))
                Column(Modifier.padding(horizontal = 20.dp)) {
                    Text("Budget Analytics", style = TextStyle(fontFamily = sora, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = navy, letterSpacing = (-0.02).sp))
                    Spacer(Modifier.height(4.dp))
                    Text("Japan Explorer 2025 • Oct 12–24", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500))
                }
                Spacer(Modifier.height(20.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                        .shadow(12.dp, RoundedCornerShape(20.dp), spotColor = deepBlue.copy(alpha = 0.25f))
                        .clip(RoundedCornerShape(20.dp))
                        .background(Brush.horizontalGradient(listOf(Color(0xFF1D4ED8), Color(0xFF3B82F6))))
                        .padding(20.dp)
                ) {
                    Column {
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Text("TOTAL SPENT", style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.7f), letterSpacing = 0.08.sp))
                            Spacer(Modifier.weight(1f))
                            Box(Modifier.clip(RoundedCornerShape(12.dp)).background(emerald.copy(alpha = 0.9f)).padding(horizontal = 10.dp, vertical = 4.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.AutoMirrored.Outlined.TrendingUp, null, tint = Color.White, modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("Under budget", style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White))
                                }
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        Text("$3,240.50", style = TextStyle(fontFamily = sora, fontSize = 40.sp, fontWeight = FontWeight.Bold, color = Color.White))
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth()) {
                            Text("Daily Average: ¥21,750", style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.75f)))
                            Spacer(Modifier.weight(1f))
                            Text("Budget: $5,000", style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.75f)))
                        }
                    }
                }
                Spacer(Modifier.height(16.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                        .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(44.dp).clip(CircleShape).background(Color(0xFFD1FAE5)), contentAlignment = Alignment.Center) {
                            Icon(Icons.AutoMirrored.Outlined.TrendingUp, null, tint = emerald, modifier = Modifier.size(22.dp))
                        }
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text("On Track", style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = navy))
                            Text("You're 22% under your weekly food budget in Kyoto. Great restraint at Nishiki Market!", style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Normal, color = gray500, lineHeight = 18.sp))
                        }
                    }
                }
                Spacer(Modifier.height(16.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    StatMiniCard(Modifier.weight(1f), "FLIGHTS", "$1,280", Icons.Outlined.Flight, Color(0xFFEFF6FF), deepBlue, navy, sora, cardBg, gray500)
                    StatMiniCard(Modifier.weight(1f), "STAYS", "$1,050", Icons.Outlined.Hotel, Color(0xFFFEF3C7), Color(0xFFD97706), navy, sora, cardBg, gray500)
                }
                Spacer(Modifier.height(28.dp))
                Text("Category Breakdown", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy), modifier = Modifier.padding(horizontal = 20.dp))
                Spacer(Modifier.height(16.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(180.dp)
                        .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                        .clip(RoundedCornerShape(16.dp)).background(cardBg),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(Modifier.size(120.dp)) {
                        val stroke = Stroke(width = 18.dp.toPx(), cap = StrokeCap.Round)
                        drawArc(color = Color(0xFF2563EB), startAngle = -90f, sweepAngle = 160f, useCenter = false, style = stroke)
                        drawArc(color = Color(0xFF10B981), startAngle = 70f, sweepAngle = 110f, useCenter = false, style = stroke)
                        drawArc(color = Color(0xFFF59E0B), startAngle = 180f, sweepAngle = 90f, useCenter = false, style = stroke)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Top", style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Normal, color = gray500))
                        Text("Flights", style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    }
                }
                Spacer(Modifier.height(16.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(200.dp)
                        .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                        .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(20.dp)
                ) {
                    Column(Modifier.fillMaxSize()) {
                        Box(Modifier.weight(1f).fillMaxWidth()) {
                            Canvas(Modifier.fillMaxSize()) {
                                val barWidth = size.width / (barData.size * 2f)
                                val spacing = size.width / barData.size
                                barData.forEachIndexed { i, value ->
                                    val barHeight = value * size.height * 0.85f
                                    val x = spacing * i + (spacing - barWidth) / 2
                                    val gradient = Brush.verticalGradient(
                                        listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)),
                                        startY = size.height - barHeight, endY = size.height
                                    )
                                    drawRoundRect(
                                        brush = gradient,
                                        topLeft = Offset(x, size.height - barHeight),
                                        size = Size(barWidth, barHeight),
                                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(6.dp.toPx())
                                    )
                                }
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                            days.forEach { Text(it, style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = gray400)) }
                        }
                    }
                }
                Spacer(Modifier.height(28.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Recent Expenses", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy))
                    Spacer(Modifier.weight(1f))
                    Text("View All", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = deepBlue), modifier = Modifier.clickable { scope.launch { snackbarHostState.showSnackbar("Showing all 23 expenses for this trip") } })
                }
                Spacer(Modifier.height(16.dp))
                ExpenseItem(Icons.Outlined.Restaurant, Color(0xFFFEF3C7), Color(0xFFD97706), "Sushi Zanmai Tsukiji", "Food & Drink • Today, 1:30 PM", "-$42.80", navy, gray500, sora, jakarta, cardBg, gray400)
                Spacer(Modifier.height(10.dp))
                ExpenseItem(Icons.Outlined.DirectionsBus, Color(0xFFEFF6FF), deepBlue, "JR Yamanote Line Pass", "Transport • Yesterday, 9:15 AM", "-$14.50", navy, gray500, sora, jakarta, cardBg, gray400)
                Spacer(Modifier.height(10.dp))
                ExpenseItem(Icons.Outlined.Hotel, Color(0xFFF0FDF4), emerald, "Aman Tokyo • Night 3", "Accommodation • Oct 14", "-$385.00", navy, gray500, sora, jakarta, cardBg, gray400)
                Spacer(Modifier.height(100.dp))
            }
            Box(
                Modifier.align(Alignment.BottomEnd).padding(end = 20.dp, bottom = 8.dp).size(56.dp)
                    .shadow(10.dp, CircleShape, spotColor = emerald.copy(alpha = 0.4f))
                    .clip(CircleShape).background(Brush.horizontalGradient(listOf(emerald, mint)))
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { scope.launch { snackbarHostState.showSnackbar("Add new expense") } },
                contentAlignment = Alignment.Center
            ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(28.dp)) }
        }
    }
}
@Composable
fun StatMiniCard(modifier: Modifier, label: String, value: String, icon: ImageVector, iconBg: Color, iconTint: Color, navy: Color, sora: FontFamily, cardBg: Color, gray500: Color) {
    Box(
        modifier.shadow(4.dp, RoundedCornerShape(16.dp), spotColor = Color(0xFF94A3B8).copy(alpha = 0.1f))
            .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(16.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(32.dp).clip(RoundedCornerShape(10.dp)).background(iconBg), contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = iconTint, modifier = Modifier.size(16.dp))
                }
                Spacer(Modifier.width(8.dp))
                Text(label, style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.06.sp))
            }
            Spacer(Modifier.height(10.dp))
            Text(value, style = TextStyle(fontFamily = sora, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = navy))
        }
    }
}
@Composable
fun ExpenseItem(icon: ImageVector, iconBg: Color, iconTint: Color, title: String, subtitle: String, amount: String, navy: Color, gray500: Color, sora: FontFamily, jakarta: FontFamily, cardBg: Color, gray400: Color) {
    Box(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth()
            .shadow(2.dp, RoundedCornerShape(14.dp), spotColor = gray400.copy(alpha = 0.08f))
            .clip(RoundedCornerShape(14.dp)).background(cardBg).padding(14.dp)
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(iconBg), contentAlignment = Alignment.Center) {
                Icon(icon, null, tint = iconTint, modifier = Modifier.size(22.dp))
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = navy))
                Text(subtitle, style = TextStyle(fontFamily = jakarta, fontSize = 12.sp, fontWeight = FontWeight.Normal, color = gray500))
            }
            Text(amount, style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = navy))
        }
    }
}
