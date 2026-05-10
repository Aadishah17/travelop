package com.odoo.traveloop
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.Hotel
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
@Composable
fun ItineraryScreen(
    onNavigateBack: () -> Unit,
    onNavigateToExplore: () -> Unit = {},
    onNavigateToCreateTrip: () -> Unit = {},
    onNavigateToWallet: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {}
) {
    val navy = Color(0xFF0F172A)
    val deepBlue = Color(0xFF2563EB)
    val emerald = Color(0xFF10B981)
    val mint = Color(0xFF6EE7B7)
    val teal = Color(0xFF14B8A6)
    val gray500 = Color(0xFF64748B)
    val gray400 = Color(0xFF94A3B8)
    val gray200 = Color(0xFFE2E8F0)
    val pageBg = Color(0xFFF8FAFC)
    val cardBg = Color(0xFFFFFFFF)
    val sora = FontFamily.SansSerif
    val jakarta = FontFamily.SansSerif
    var selectedTab by remember { mutableIntStateOf(2) }
    var day1Expanded by remember { mutableStateOf(true) }
    var day2Expanded by remember { mutableStateOf(false) }
    var day3Expanded by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
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
                    BottomNavItem("HOME", Icons.Default.Home, false, deepBlue, gray400) { onNavigateBack() }
                    BottomNavItem("EXPLORE", Icons.Outlined.Explore, false, deepBlue, gray400) { onNavigateToExplore() }
                    Box(Modifier.size(52.dp).shadow(6.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f)).clip(CircleShape).background(deepBlue).clickable { onNavigateToCreateTrip() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    BottomNavItem("WALLET", Icons.Outlined.AccountBalanceWallet, false, deepBlue, gray400) { onNavigateToWallet() }
                    BottomNavItem("PROFILE", Icons.Default.Person, false, deepBlue, gray400) { onNavigateToProfile() }
                }
            }
        }
    ) { innerPadding ->
        Box(Modifier.fillMaxSize().padding(innerPadding)) {
            Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                Spacer(Modifier.height(16.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(32.dp).clip(RoundedCornerShape(8.dp)).border(1.5.dp, gray200, RoundedCornerShape(8.dp)).clickable { onNavigateBack() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = navy, modifier = Modifier.size(18.dp))
                    }
                    Spacer(Modifier.width(12.dp))
                    Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    Spacer(Modifier.weight(1f))
                    Icon(Icons.Default.Share, null, tint = navy, modifier = Modifier.size(20.dp).clickable { scope.launch { snackbarHostState.showSnackbar("Itinerary shared to clipboard") } })
                }
                Spacer(Modifier.height(20.dp))
                Column(Modifier.padding(horizontal = 20.dp)) {
                    Box(Modifier.clip(RoundedCornerShape(20.dp)).background(deepBlue).padding(horizontal = 12.dp, vertical = 5.dp)) {
                        Text("JAPAN EXPLORER", style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White, letterSpacing = 0.08.sp))
                    }
                    Spacer(Modifier.height(12.dp))
                    Text("Tokyo to Kyoto", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = navy, letterSpacing = (-0.02).sp))
                    Spacer(Modifier.height(4.dp))
                    Text("Oct 12 – Oct 24, 2025 • 12 Days", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
                }
                Spacer(Modifier.height(20.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                        .shadow(8.dp, RoundedCornerShape(20.dp), spotColor = deepBlue.copy(alpha = 0.08f))
                        .clip(RoundedCornerShape(20.dp))
                        .background(Brush.verticalGradient(listOf(Color(0xFFF0F4FF), Color(0xFFE8FFF8))))
                        .clickable { onNavigateToWallet() }.padding(20.dp)
                ) {
                    Column {
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Text("Budget Overview", style = TextStyle(fontFamily = sora, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = navy))
                            Spacer(Modifier.weight(1f))
                            Icon(Icons.Outlined.MoreHoriz, null, tint = gray400, modifier = Modifier.size(22.dp))
                        }
                        Spacer(Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text("$4,250", style = TextStyle(fontFamily = sora, fontSize = 36.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                            Spacer(Modifier.width(4.dp))
                            Text("/$5,000", style = TextStyle(fontFamily = jakarta, fontSize = 16.sp, fontWeight = FontWeight.Normal, color = gray400), modifier = Modifier.padding(bottom = 6.dp))
                        }
                        Spacer(Modifier.height(12.dp))
                        LinearProgressIndicator(
                            progress = { 0.85f },
                            Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                            color = deepBlue, trackColor = gray200.copy(alpha = 0.5f), strokeCap = StrokeCap.Round, drawStopIndicator = {}
                        )
                        Spacer(Modifier.height(14.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            LegendDot("FLIGHTS", deepBlue, sora)
                            LegendDot("STAYS", teal, sora)
                            LegendDot("ACTIVITIES", emerald, sora)
                        }
                    }
                }
                Spacer(Modifier.height(28.dp))
                Text("Itinerary", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy), modifier = Modifier.padding(horizontal = 20.dp))
                Spacer(Modifier.height(16.dp))
                DaySection(
                    dayNum = 1, date = "Oct 12", title = "Arrival in Tokyo", isExpanded = day1Expanded,
                    isActive = true, deepBlue = deepBlue, navy = navy, gray500 = gray500, gray400 = gray400, gray200 = gray200, cardBg = cardBg,
                    sora = sora, jakarta = jakarta, emerald = emerald, onToggle = { day1Expanded = !day1Expanded }
                ) {
                    ActivityCard(
                        icon = Icons.Outlined.Flight, iconBg = Color(0xFFEFF6FF), iconTint = deepBlue,
                        title = "JAL 005 Arrival", subtitle = "Narita International Airport (NRT)",
                        badge = "CONFIRMED", badgeColor = emerald,
                        detail1Label = "ARRIVAL", detail1Value = "14:30", detail2Label = "TERMINAL", detail2Value = "T2",
                        navy = navy, gray500 = gray500, sora = sora, jakarta = jakarta, cardBg = cardBg, gray200 = gray200
                    )
                    Spacer(Modifier.height(12.dp))
                    ActivityCard(
                        icon = Icons.Outlined.Hotel, iconBg = Color(0xFFFEF3C7), iconTint = Color(0xFFD97706),
                        title = "Aman Tokyo Check-in", subtitle = "Otemachi Tower, Chiyoda City",
                        badge = "BOOKED", badgeColor = deepBlue,
                        detail1Label = "CHECK-IN", detail1Value = "16:00", detail2Label = null, detail2Value = null,
                        mapLink = true, navy = navy, gray500 = gray500, sora = sora, jakarta = jakarta, cardBg = cardBg, gray200 = gray200
                    )
                }
                DaySection(
                    dayNum = 2, date = "Oct 13", title = "Shibuya & Shinjuku", isExpanded = day2Expanded,
                    isActive = false, deepBlue = deepBlue, navy = navy, gray500 = gray500, gray400 = gray400, gray200 = gray200, cardBg = cardBg,
                    sora = sora, jakarta = jakarta, emerald = emerald, onToggle = { day2Expanded = !day2Expanded }
                ) {
                    ActivityCard(
                        icon = Icons.Outlined.Map, iconBg = Color(0xFFF0FDF4), iconTint = emerald,
                        title = "Shibuya Crossing Walking Tour", subtitle = "Meet at Hachiko Statue, guided group",
                        badge = "BOOKED", badgeColor = deepBlue,
                        detail1Label = "START", detail1Value = "09:00", detail2Label = "DURATION", detail2Value = "3h",
                        navy = navy, gray500 = gray500, sora = sora, jakarta = jakarta, cardBg = cardBg, gray200 = gray200
                    )
                }
                DaySection(
                    dayNum = 3, date = "Oct 14", title = "Transit to Kyoto", isExpanded = day3Expanded,
                    isActive = false, deepBlue = deepBlue, navy = navy, gray500 = gray500, gray400 = gray400, gray200 = gray200, cardBg = cardBg,
                    sora = sora, jakarta = jakarta, emerald = emerald, onToggle = { day3Expanded = !day3Expanded }
                ) {
                    ActivityCard(
                        icon = Icons.Outlined.Flight, iconBg = Color(0xFFEFF6FF), iconTint = deepBlue,
                        title = "Shinkansen Nozomi 225", subtitle = "Reserved Car 7, Seat 3A • Non-stop",
                        badge = "CONFIRMED", badgeColor = emerald,
                        detail1Label = "DEPART", detail1Value = "08:30", detail2Label = "ARRIVE", detail2Value = "10:45",
                        navy = navy, gray500 = gray500, sora = sora, jakarta = jakarta, cardBg = cardBg, gray200 = gray200
                    )
                }
                Spacer(Modifier.height(100.dp))
            }
            Box(
                Modifier.align(Alignment.BottomEnd).padding(end = 20.dp, bottom = 8.dp).size(56.dp)
                    .shadow(10.dp, CircleShape, spotColor = emerald.copy(alpha = 0.4f))
                    .clip(CircleShape).background(Brush.horizontalGradient(listOf(emerald, mint)))
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { scope.launch { snackbarHostState.showSnackbar("Add activity to Day 1") } },
                contentAlignment = Alignment.Center
            ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(28.dp)) }
        }
    }
}
@Composable
fun LegendDot(label: String, color: Color, sora: FontFamily) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(6.dp))
        Text(label, style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF64748B), letterSpacing = 0.04.sp))
    }
}
@Composable
fun DaySection(
    dayNum: Int, date: String, title: String, isExpanded: Boolean, isActive: Boolean,
    deepBlue: Color, navy: Color, gray500: Color, gray400: Color, gray200: Color, cardBg: Color,
    sora: FontFamily, jakarta: FontFamily, emerald: Color, onToggle: () -> Unit, content: @Composable () -> Unit
) {
    val lineColor = if (isActive) deepBlue.copy(alpha = 0.2f) else gray200
    Row(Modifier.padding(start = 20.dp, end = 20.dp).fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(28.dp)) {
            Box(
                Modifier.size(16.dp).clip(CircleShape)
                    .then(if (isActive) Modifier.background(deepBlue) else Modifier.border(2.dp, gray400, CircleShape).background(Color.Transparent)),
                contentAlignment = Alignment.Center
            ) { if (isActive) Box(Modifier.size(6.dp).clip(CircleShape).background(Color.White)) }
            if (isExpanded) Box(Modifier.width(2.dp).height(16.dp).background(lineColor))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(cardBg)
                    .clickable { onToggle() }.padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(Modifier.weight(1f)) {
                    Text("Day $dayNum • $date", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (isActive) deepBlue else gray500))
                    Text(title, style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = navy))
                }
                Icon(if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown, null, tint = gray400, modifier = Modifier.size(22.dp))
            }
        }
    }
    AnimatedVisibility(visible = isExpanded, enter = expandVertically(), exit = shrinkVertically()) {
        Row(Modifier.padding(start = 20.dp, end = 20.dp)) {
            Box(Modifier.width(28.dp), contentAlignment = Alignment.TopCenter) {
                Box(Modifier.fillMaxSize().width(2.dp).drawBehind {
                    drawLine(if (isActive) deepBlue.copy(alpha = 0.2f) else gray200, Offset(size.width / 2, 0f), Offset(size.width / 2, size.height), strokeWidth = 2.dp.toPx())
                })
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f).padding(top = 8.dp, bottom = 16.dp)) { content() }
        }
    }
    if (!isExpanded) Spacer(Modifier.height(12.dp))
}
@Composable
fun ActivityCard(
    icon: ImageVector, iconBg: Color, iconTint: Color,
    title: String, subtitle: String,
    badge: String, badgeColor: Color,
    detail1Label: String, detail1Value: String,
    detail2Label: String?, detail2Value: String?,
    mapLink: Boolean = false,
    navy: Color, gray500: Color, sora: FontFamily, jakarta: FontFamily, cardBg: Color, gray200: Color
) {
    Box(
        Modifier.fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = Color(0xFF94A3B8).copy(alpha = 0.1f))
            .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(16.dp)
    ) {
        Column {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                Box(Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(iconBg), contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = iconTint, modifier = Modifier.size(22.dp))
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(title, style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = navy))
                    Text(subtitle, style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Normal, color = gray500))
                }
                Box(Modifier.clip(RoundedCornerShape(8.dp)).border(1.dp, badgeColor.copy(alpha = 0.3f), RoundedCornerShape(8.dp)).background(badgeColor.copy(alpha = 0.1f)).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text(badge, style = TextStyle(fontFamily = sora, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = badgeColor, letterSpacing = 0.06.sp))
                }
            }
            Spacer(Modifier.height(14.dp))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
                Column {
                    Text(detail1Label, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.06.sp))
                    Text(detail1Value, style = TextStyle(fontFamily = sora, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = navy))
                }
                if (detail2Label != null && detail2Value != null) {
                    Spacer(Modifier.width(32.dp))
                    Column {
                        Text(detail2Label, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.06.sp))
                        Text(detail2Value, style = TextStyle(fontFamily = sora, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = navy))
                    }
                }
                if (mapLink) {
                    Spacer(Modifier.weight(1f))
                    Row(Modifier.clickable { }, verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Map, null, tint = Color(0xFF2563EB), modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Map", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF2563EB)))
                    }
                }
            }
        }
    }
}
