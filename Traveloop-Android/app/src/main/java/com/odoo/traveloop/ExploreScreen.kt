package com.odoo.traveloop
import androidx.compose.animation.animateColorAsState
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
import androidx.compose.material.icons.outlined.AccessTime
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Icon
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
data class ExploreActivity(
    val category: String,
    val categoryColor: Color,
    val title: String,
    val rating: String,
    val duration: String,
    val location: String,
    val price: String,
    val gradientTop: Color,
    val gradientBottom: Color
)
@Composable
fun ExploreScreen(
    onNavigateHome: () -> Unit,
    onNavigateToCreateTrip: () -> Unit,
    onNavigateToWallet: () -> Unit = {},
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
    var selectedFilter by remember { mutableIntStateOf(0) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val filters = listOf("All Filters", "Under $100", "Half-Day", "Top Rated", "Cultural")
    val activities = listOf(
        ExploreActivity("ADVENTURE", Color(0xFF10B981), "Hidden Cenote Dive", "4.9", "4 Hours", "Tulum, Mexico", "$120", Color(0xFF065F46), Color(0xFF064E3B)),
        ExploreActivity("CULINARY", Color(0xFFF59E0B), "Oaxacan Street Food Tour", "4.8", "2.5 Hours", "Oaxaca, Mexico", "$45", Color(0xFF92400E), Color(0xFF78350F)),
        ExploreActivity("SIGHTSEEING", Color(0xFF0EA5E9), "Teotihuacan Sunrise Balloon", "5.0", "3 Hours", "Mexico City", "$250", Color(0xFFC2410C), Color(0xFF9A3412)),
        ExploreActivity("WELLNESS", Color(0xFF7C3AED), "Temazcal Ceremony & Spa", "4.7", "5 Hours", "Playa del Carmen", "$180", Color(0xFF5B21B6), Color(0xFF4C1D95))
    )
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
                    BottomNavItem("EXPLORE", Icons.Outlined.Explore, true, deepBlue, gray400) { }
                    Box(Modifier.size(52.dp).shadow(6.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f)).clip(CircleShape).background(deepBlue).clickable { onNavigateToCreateTrip() }, contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    BottomNavItem("WALLET", Icons.Outlined.AccountBalanceWallet, false, deepBlue, gray400) { onNavigateToWallet() }
                    BottomNavItem("PROFILE", Icons.Default.Person, false, deepBlue, gray400) { onNavigateToProfile() }
                }
            }
        }
    ) { innerPadding ->
        Column(Modifier.fillMaxSize().padding(innerPadding).verticalScroll(rememberScrollState())) {
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(40.dp).clip(CircleShape).background(gray200).border(2.dp, deepBlue.copy(alpha = 0.3f), CircleShape), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, null, tint = gray500, modifier = Modifier.size(22.dp))
                }
                Spacer(Modifier.weight(1f))
                Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                Spacer(Modifier.weight(1f))
                Box(Modifier.size(40.dp).clip(CircleShape).clickable { scope.launch { snackbarHostState.showSnackbar("Voice search activated") } }, contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Search, null, tint = navy, modifier = Modifier.size(22.dp))
                }
            }
            Spacer(Modifier.height(20.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color(0xFFF1F5F9))
                    .clickable { scope.launch { snackbarHostState.showSnackbar("Search experiences near you") } }
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Search, null, tint = gray400, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(10.dp))
                    Text("Discover local experiences...", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray400))
                }
            }
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                filters.forEachIndexed { index, filter ->
                    val isActive = selectedFilter == index
                    val bg by animateColorAsState(if (isActive) deepBlue else Color.Transparent, label = "")
                    val border by animateColorAsState(if (isActive) deepBlue else gray200, label = "")
                    val textColor by animateColorAsState(if (isActive) Color.White else navy, label = "")
                    Row(
                        Modifier.clip(RoundedCornerShape(20.dp)).background(bg)
                            .border(1.5.dp, border, RoundedCornerShape(20.dp))
                            .clickable { selectedFilter = index }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (index == 0) {
                            Icon(Icons.Outlined.FilterList, null, tint = textColor, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                        }
                        Text(filter, style = TextStyle(fontFamily = sora, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = textColor))
                    }
                }
            }
            Spacer(Modifier.height(28.dp))
            Text("Trending Near You", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy), modifier = Modifier.padding(horizontal = 20.dp))
            Spacer(Modifier.height(16.dp))
            activities.forEach { activity ->
                ExploreCard(
                    activity = activity, sora = sora, jakarta = jakarta, emerald = emerald, mint = mint,
                    onAddToTrip = { scope.launch { snackbarHostState.showSnackbar("${activity.title} added to Japan Explorer trip!") } }
                )
                Spacer(Modifier.height(16.dp))
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}
@Composable
fun ExploreCard(activity: ExploreActivity, sora: FontFamily, jakarta: FontFamily, emerald: Color, mint: Color, onAddToTrip: () -> Unit) {
    Box(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(240.dp)
            .shadow(10.dp, RoundedCornerShape(20.dp), spotColor = Color(0xFF0F172A).copy(alpha = 0.2f))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.verticalGradient(listOf(activity.gradientTop.copy(alpha = 0.85f), activity.gradientBottom)))
    ) {
        Column(Modifier.fillMaxSize().padding(18.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Column {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                    Column {
                        Text(activity.category, style = TextStyle(fontFamily = sora, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = activity.categoryColor, letterSpacing = 0.1.sp))
                        Spacer(Modifier.height(4.dp))
                        Text(activity.title, style = TextStyle(fontFamily = sora, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White))
                    }
                    Box(Modifier.clip(RoundedCornerShape(12.dp)).background(emerald.copy(alpha = 0.9f)).padding(horizontal = 8.dp, vertical = 4.dp), contentAlignment = Alignment.Center) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.Star, null, tint = Color.White, modifier = Modifier.size(12.dp))
                            Spacer(Modifier.width(3.dp))
                            Text(activity.rating, style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White))
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.AccessTime, null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(activity.duration, style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.85f)))
                    Spacer(Modifier.width(8.dp))
                    Text("•", style = TextStyle(fontSize = 13.sp, color = Color.White.copy(alpha = 0.6f)))
                    Spacer(Modifier.width(8.dp))
                    Icon(Icons.Outlined.LocationOn, null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(activity.location, style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.85f)))
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                Column {
                    Text("STARTING AT", style = TextStyle(fontFamily = sora, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.6f), letterSpacing = 0.06.sp))
                    Text(activity.price, style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White))
                }
                Box(
                    Modifier.clip(RoundedCornerShape(20.dp))
                        .background(Brush.horizontalGradient(listOf(emerald, mint)))
                        .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { onAddToTrip() }
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Add to Trip", style = TextStyle(fontFamily = sora, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White))
                        Spacer(Modifier.width(6.dp))
                        Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
