package com.odoo.traveloop
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.outlined.ExitToApp
import androidx.compose.material.icons.automirrored.outlined.HelpOutline
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Bookmark
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
@Composable
fun ProfileScreen(
    onNavigateHome: () -> Unit,
    onNavigateToExplore: () -> Unit,
    onNavigateToCreateTrip: () -> Unit,
    onNavigateToWallet: () -> Unit,
    onLogout: () -> Unit
) {
    val navy = Color(0xFF0F172A)
    val deepBlue = Color(0xFF2563EB)
    val emerald = Color(0xFF10B981)
    val gray500 = Color(0xFF64748B)
    val gray400 = Color(0xFF94A3B8)
    val gray200 = Color(0xFFE2E8F0)
    val pageBg = Color(0xFFF8FAFC)
    val cardBg = Color(0xFFFFFFFF)
    val sora = FontFamily.SansSerif
    val jakarta = FontFamily.SansSerif
    var darkMode by remember { mutableStateOf(false) }
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
                    BottomNavItem("HOME", Icons.Default.Home, false, deepBlue, gray400) { onNavigateHome() }
                    BottomNavItem("EXPLORE", Icons.Outlined.Explore, false, deepBlue, gray400) { onNavigateToExplore() }
                    Box(Modifier.size(52.dp).shadow(6.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f)).clip(CircleShape).background(deepBlue).clickable { onNavigateToCreateTrip() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    BottomNavItem("WALLET", Icons.Outlined.AccountBalanceWallet, false, deepBlue, gray400) { onNavigateToWallet() }
                    BottomNavItem("PROFILE", Icons.Default.Person, true, deepBlue, gray400) { }
                }
            }
        }
    ) { innerPadding ->
        Column(Modifier.fillMaxSize().padding(innerPadding).verticalScroll(rememberScrollState())) {
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                Spacer(Modifier.weight(1f))
                Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(24.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(24.dp), spotColor = deepBlue.copy(alpha = 0.08f))
                    .clip(RoundedCornerShape(24.dp))
                    .background(Brush.verticalGradient(listOf(Color(0xFFF0F4FF), cardBg)))
                    .padding(vertical = 28.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(contentAlignment = Alignment.BottomCenter) {
                        Box(
                            Modifier.size(90.dp).clip(CircleShape).border(3.dp, deepBlue, CircleShape).background(gray200),
                            contentAlignment = Alignment.Center
                        ) { Icon(Icons.Default.Person, null, tint = gray500, modifier = Modifier.size(44.dp)) }
                        Box(Modifier.offset(y = 6.dp).clip(RoundedCornerShape(10.dp)).background(deepBlue).padding(horizontal = 10.dp, vertical = 3.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Outlined.Star, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(12.dp))
                                Spacer(Modifier.width(3.dp))
                                Text("Pro", style = TextStyle(fontFamily = sora, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White))
                            }
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("Alex Rivera", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy))
                    Spacer(Modifier.height(4.dp))
                    Text("alex.rivera@gmail.com", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
                    Spacer(Modifier.height(20.dp))
                    Row(Modifier.fillMaxWidth().padding(horizontal = 24.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                        ProfileStat("12", "TRIPS", deepBlue, sora)
                        ProfileStat("7", "COUNTRIES", emerald, sora)
                        ProfileStat("24.5k", "MILES", Color(0xFF7C3AED), sora)
                    }
                }
            }
            Spacer(Modifier.height(28.dp))
            SectionLabel("ACCOUNT", sora, gray500)
            Spacer(Modifier.height(8.dp))
            ProfileMenuItem(Icons.Outlined.Bookmark, Color(0xFFEFF6FF), deepBlue, "Saved Trips", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("3 saved trips: Kyoto, Bali, Santorini") }
            }
            ProfileMenuItem(Icons.Outlined.Description, Color(0xFFF0FDF4), emerald, "Travel Documents", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("Passport, Japan Rail Pass, Travel Insurance uploaded") }
            }
            ProfileMenuItem(Icons.Outlined.CreditCard, Color(0xFFFEF3C7), Color(0xFFD97706), "Payment Methods", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("Visa ••4892 and PayPal linked") }
            }
            Spacer(Modifier.height(24.dp))
            SectionLabel("PREFERENCES", sora, gray500)
            Spacer(Modifier.height(8.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp)).background(cardBg)
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFFF5F3FF)), contentAlignment = Alignment.Center) {
                        Icon(Icons.Outlined.DarkMode, null, tint = Color(0xFF7C3AED), modifier = Modifier.size(20.dp))
                    }
                    Spacer(Modifier.width(14.dp))
                    Text("Dark Mode", style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = navy))
                    Spacer(Modifier.weight(1f))
                    Switch(
                        checked = darkMode,
                        onCheckedChange = { darkMode = it; scope.launch { snackbarHostState.showSnackbar(if (it) "Dark Mode enabled" else "Dark Mode disabled") } },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White, checkedTrackColor = deepBlue,
                            uncheckedThumbColor = Color.White, uncheckedTrackColor = gray200, uncheckedBorderColor = Color.Transparent
                        )
                    )
                }
            }
            Spacer(Modifier.height(6.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp)).background(cardBg)
                    .clickable { scope.launch { snackbarHostState.showSnackbar("Available: English, Japanese, Spanish, French") } }
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFFEFF6FF)), contentAlignment = Alignment.Center) {
                        Icon(Icons.Outlined.Language, null, tint = deepBlue, modifier = Modifier.size(20.dp))
                    }
                    Spacer(Modifier.width(14.dp))
                    Text("Language", style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = navy))
                    Spacer(Modifier.weight(1f))
                    Text("English", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
                    Spacer(Modifier.width(4.dp))
                    Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = gray400, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(Modifier.height(6.dp))
            ProfileMenuItem(Icons.Outlined.Notifications, Color(0xFFFFECEC), Color(0xFFEF4444), "Notifications", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("Push notifications enabled • Trip reminders on") }
            }
            Spacer(Modifier.height(24.dp))
            SectionLabel("SUPPORT & LEGAL", sora, gray500)
            Spacer(Modifier.height(8.dp))
            ProfileMenuItem(Icons.AutoMirrored.Outlined.HelpOutline, Color(0xFFEFF6FF), deepBlue, "Help Center", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("Help Center: FAQ, Live Chat, Email Support") }
            }
            ProfileMenuItem(Icons.Outlined.Shield, Color(0xFFF0FDF4), emerald, "Privacy Policy", sora, jakarta, navy, gray400) {
                scope.launch { snackbarHostState.showSnackbar("Privacy Policy v2.1 • Last updated Jan 2025") }
            }
            Spacer(Modifier.height(24.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(52.dp)
                    .clip(RoundedCornerShape(26.dp))
                    .border(1.5.dp, Color(0xFFEF4444).copy(alpha = 0.4f), RoundedCornerShape(26.dp))
                    .background(Color(0xFFFEF2F2))
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color(0xFFEF4444))) { onLogout() },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.AutoMirrored.Outlined.ExitToApp, null, tint = Color(0xFFEF4444), modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Log Out", style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEF4444)))
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}
@Composable
fun ProfileStat(value: String, label: String, color: Color, sora: FontFamily) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = TextStyle(fontFamily = sora, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color))
        Text(label, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 0.06.sp))
    }
}
@Composable
fun SectionLabel(text: String, sora: FontFamily, gray500: Color) {
    Text(text, style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = gray500, letterSpacing = 0.1.sp), modifier = Modifier.padding(horizontal = 20.dp))
}
@Composable
fun ProfileMenuItem(icon: ImageVector, iconBg: Color, iconTint: Color, title: String, sora: FontFamily, jakarta: FontFamily, navy: Color, gray400: Color, onClick: () -> Unit) {
    Box(
        Modifier.padding(horizontal = 20.dp, vertical = 3.dp).fillMaxWidth()
            .clip(RoundedCornerShape(14.dp)).background(Color.White)
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true)) { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(iconBg), contentAlignment = Alignment.Center) {
                Icon(icon, null, tint = iconTint, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.width(14.dp))
            Text(title, style = TextStyle(fontFamily = sora, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = navy))
            Spacer(Modifier.weight(1f))
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = gray400, modifier = Modifier.size(20.dp))
        }
    }
}
