package com.odoo.traveloop
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.FlightTakeoff
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.WbSunny
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
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
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
fun DashboardScreen(
    onNavigateToCreateTrip: () -> Unit,
    onNavigateToItinerary: () -> Unit = {},
    onNavigateToExplore: () -> Unit = {},
    onNavigateToWallet: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {}
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val navy = Color(0xFF0F172A)
    val deepBlue = Color(0xFF2563EB)
    val emerald = Color(0xFF10B981)
    val mint = Color(0xFF6EE7B7)
    val skyBlue = Color(0xFF0EA5E9)
    val gray500 = Color(0xFF64748B)
    val gray400 = Color(0xFF94A3B8)
    val gray200 = Color(0xFFE2E8F0)
    val pageBg = Color(0xFFF8FAFC)
    val cardBg = Color(0xFFFFFFFF)
    val sora = FontFamily.SansSerif
    val jakarta = FontFamily.SansSerif
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
                    BottomNavItem("HOME", Icons.Default.Home, true, deepBlue, gray400) { }
                    BottomNavItem("EXPLORE", Icons.Outlined.Explore, false, deepBlue, gray400) { onNavigateToExplore() }
                    Box(
                        Modifier.size(52.dp).shadow(6.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f))
                            .clip(CircleShape).background(deepBlue)
                            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { onNavigateToCreateTrip() },
                        contentAlignment = Alignment.Center
                    ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(26.dp)) }
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
                    Box(Modifier.size(40.dp).clip(CircleShape).background(gray200).border(2.dp, deepBlue.copy(alpha = 0.3f), CircleShape), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Person, null, tint = gray500, modifier = Modifier.size(22.dp))
                    }
                    Spacer(Modifier.weight(1f))
                    Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    Spacer(Modifier.weight(1f))
                    Box(Modifier.size(40.dp).clip(CircleShape).clickable { onNavigateToExplore() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Search, null, tint = navy, modifier = Modifier.size(22.dp))
                    }
                }
                Spacer(Modifier.height(20.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("Good morning, Alex", style = TextStyle(fontFamily = sora, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = navy, letterSpacing = (-0.02).sp))
                        Spacer(Modifier.height(4.dp))
                        Text("Your Kyoto trip begins in 14 days.", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500, lineHeight = 22.sp))
                    }
                    Box(Modifier.size(40.dp).clip(CircleShape).background(Color(0xFFEFF6FF)).clickable { scope.launch { snackbarHostState.showSnackbar("No new notifications") } }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Outlined.Notifications, null, tint = deepBlue, modifier = Modifier.size(22.dp))
                    }
                }
                Spacer(Modifier.height(20.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.15f))
                        .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(16.dp)
                        .clickable { scope.launch { snackbarHostState.showSnackbar("Weather: Mostly sunny with light breeze") } }
                ) {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(Color(0xFFEFF6FF)), contentAlignment = Alignment.Center) {
                            Icon(Icons.Outlined.WbSunny, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(26.dp))
                        }
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text("KYOTO, JAPAN", style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.08.sp))
                            Spacer(Modifier.height(2.dp))
                            Text("22°C", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = navy))
                        }
                        Spacer(Modifier.weight(1f))
                        Column(horizontalAlignment = Alignment.End) {
                            Text("High 26°", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFEF4444)))
                            Spacer(Modifier.height(2.dp))
                            Text("Low 18°", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray400))
                        }
                    }
                }
                Spacer(Modifier.height(28.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Upcoming Trips", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy))
                    Spacer(Modifier.weight(1f))
                    Text("View All", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = deepBlue), modifier = Modifier.clickable { scope.launch { snackbarHostState.showSnackbar("Showing all 4 upcoming trips") } })
                }
                Spacer(Modifier.height(16.dp))
                Row(
                    Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(start = 20.dp, end = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    TripCard("Kyoto Retreat", "OCT 12 – OCT 20", "CONFIRMED", emerald, "JAL 005 • Narita → Kansai", Color(0xFFD97706), Color(0xFF92400E), onNavigateToItinerary)
                    TripCard("Paris Sojourn", "DEC 05 – DEC 12", "PLANNING", skyBlue, "AF 267 • CDG Direct", Color(0xFF6366F1), Color(0xFF4338CA), onNavigateToItinerary)
                    TripCard("Bali Escape", "JAN 18 – JAN 28", "DRAFT", Color(0xFFF59E0B), "SQ 946 • Denpasar", Color(0xFF047857), Color(0xFF065F46), onNavigateToItinerary)
                }
                Spacer(Modifier.height(28.dp))
                Text("Insights", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy), modifier = Modifier.padding(horizontal = 20.dp))
                Spacer(Modifier.height(16.dp))
                Box(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.12f))
                        .clip(RoundedCornerShape(16.dp)).background(cardBg)
                        .clickable { onNavigateToWallet() }.padding(20.dp)
                ) {
                    Column {
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFFEFF6FF)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Outlined.AccountBalanceWallet, null, tint = deepBlue, modifier = Modifier.size(20.dp))
                            }
                            Spacer(Modifier.weight(1f))
                            Text("Q4 BUDGET", style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = gray400, letterSpacing = 0.08.sp))
                        }
                        Spacer(Modifier.height(12.dp))
                        Text("$4,250", style = TextStyle(fontFamily = sora, fontSize = 36.sp, fontWeight = FontWeight.Bold, color = navy))
                        Spacer(Modifier.height(12.dp))
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Text("Spent across 3 trips", style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Normal, color = gray500))
                            Spacer(Modifier.weight(1f))
                            Text("65%", style = TextStyle(fontFamily = sora, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = navy))
                        }
                        Spacer(Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = { 0.65f },
                            Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = deepBlue, trackColor = Color(0xFFE0E7FF), strokeCap = StrokeCap.Round
                        )
                    }
                }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Box(
                        Modifier.weight(1f)
                            .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                            .clip(RoundedCornerShape(16.dp)).background(Color(0xFFF0FDF4))
                            .clickable { scope.launch { snackbarHostState.showSnackbar("24,500 miles earned • Gold tier") } }
                            .padding(16.dp)
                    ) {
                        Column {
                            Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFDCFCE7)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Outlined.FlightTakeoff, null, tint = emerald, modifier = Modifier.size(18.dp))
                            }
                            Spacer(Modifier.height(12.dp))
                            Text("TOTAL MILES", style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.06.sp))
                            Spacer(Modifier.height(4.dp))
                            Text("24,500", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy))
                        }
                    }
                    Box(
                        Modifier.weight(1f)
                            .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                            .clip(RoundedCornerShape(16.dp)).background(Color(0xFFF5F3FF))
                            .clickable { scope.launch { snackbarHostState.showSnackbar("Passport expires Feb 2026 • Visa expiring soon") } }
                            .padding(16.dp)
                    ) {
                        Column {
                            Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFEDE9FE)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Outlined.Description, null, tint = Color(0xFF7C3AED), modifier = Modifier.size(18.dp))
                            }
                            Spacer(Modifier.height(12.dp))
                            Text("DOCUMENTS", style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.06.sp))
                            Spacer(Modifier.height(4.dp))
                            Text("3 Expiring", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy))
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
            Box(
                Modifier.align(Alignment.BottomEnd).padding(end = 20.dp, bottom = 8.dp).size(56.dp)
                    .shadow(10.dp, CircleShape, spotColor = emerald.copy(alpha = 0.4f))
                    .clip(CircleShape).background(Brush.horizontalGradient(listOf(emerald, mint)))
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { onNavigateToCreateTrip() },
                contentAlignment = Alignment.Center
            ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(28.dp)) }
        }
    }
}
@Composable
fun TripCard(destination: String, dates: String, status: String, statusColor: Color, airline: String, bgGradientTop: Color, bgGradientBottom: Color, onClick: () -> Unit = {}) {
    val navy = Color(0xFF0F172A)
    val sora = FontFamily.SansSerif
    Box(
        Modifier.width(220.dp).height(260.dp)
            .shadow(8.dp, RoundedCornerShape(20.dp), spotColor = navy.copy(alpha = 0.15f))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.verticalGradient(listOf(bgGradientTop.copy(alpha = 0.7f), bgGradientBottom)))
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { onClick() }
    ) {
        Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Box(Modifier.clip(RoundedCornerShape(20.dp)).background(statusColor.copy(alpha = 0.9f)).padding(horizontal = 10.dp, vertical = 4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(6.dp).clip(CircleShape).background(Color.White))
                    Spacer(Modifier.width(5.dp))
                    Text(status, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White, letterSpacing = 0.05.sp))
                }
            }
            Column {
                Text(dates, style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White.copy(alpha = 0.8f), letterSpacing = 0.04.sp))
                Spacer(Modifier.height(4.dp))
                Text(destination, style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White))
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Flight, null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(airline, style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.85f)))
                }
            }
        }
    }
}
@Composable
fun BottomNavItem(label: String, icon: ImageVector, isSelected: Boolean, activeColor: Color, inactiveColor: Color, onClick: () -> Unit) {
    val color = if (isSelected) activeColor else inactiveColor
    val sora = FontFamily.SansSerif
    Column(
        Modifier.clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = false, radius = 28.dp)) { onClick() }.padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, label, tint = color, modifier = Modifier.size(22.dp))
        Spacer(Modifier.height(3.dp))
        Text(label, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium, color = color, letterSpacing = 0.04.sp))
    }
}
