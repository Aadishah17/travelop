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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Mic
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
data class CityItem(val name: String, val country: String, val rating: String, val tag: String, val gradientTop: Color, val gradientBottom: Color)
@Composable
fun CitySearchScreen(
    onNavigateHome: () -> Unit,
    onNavigateToExplore: () -> Unit,
    onNavigateToCreateTrip: () -> Unit,
    onNavigateToWallet: () -> Unit,
    onNavigateToProfile: () -> Unit
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
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableIntStateOf(0) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val filters = listOf("All Vibes", "Tropical", "Historic", "Adventure", "Culinary", "Romantic")
    val allCities = listOf(
        CityItem("Kyoto", "Japan", "4.9", "Historic & Cultural", Color(0xFFB45309), Color(0xFF78350F)),
        CityItem("Santorini", "Greece", "4.8", "Romantic", Color(0xFF0369A1), Color(0xFF075985)),
        CityItem("Paris", "France", "4.7", "Romantic", Color(0xFF6D28D9), Color(0xFF4C1D95)),
        CityItem("Bali", "Indonesia", "4.9", "Tropical", Color(0xFF047857), Color(0xFF065F46)),
        CityItem("Marrakech", "Morocco", "4.6", "Adventure", Color(0xFFC2410C), Color(0xFF9A3412)),
        CityItem("Maldives", "Indian Ocean", "5.0", "Tropical", Color(0xFF0891B2), Color(0xFF0E7490)),
        CityItem("Lisbon", "Portugal", "4.7", "Culinary", Color(0xFFCA8A04), Color(0xFFA16207)),
        CityItem("Tokyo", "Japan", "4.8", "Adventure", Color(0xFF7C3AED), Color(0xFF5B21B6))
    )
    val filteredCities = allCities.filter { city ->
        val matchFilter = selectedFilter == 0 || city.tag.contains(filters[selectedFilter], ignoreCase = true)
        val matchSearch = searchQuery.isEmpty() || city.name.contains(searchQuery, ignoreCase = true) || city.country.contains(searchQuery, ignoreCase = true)
        matchFilter && matchSearch
    }
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
                Box(Modifier.size(40.dp).clip(CircleShape).background(gray200).border(2.dp, deepBlue.copy(alpha = 0.3f), CircleShape).clickable { onNavigateToProfile() }, contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, null, tint = gray500, modifier = Modifier.size(22.dp))
                }
                Spacer(Modifier.weight(1f))
                Text("Traveloop", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                Spacer(Modifier.weight(1f))
                Spacer(Modifier.size(40.dp))
            }
            Spacer(Modifier.height(24.dp))
            Text("Where to next?", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = navy, letterSpacing = (-0.02).sp), modifier = Modifier.padding(horizontal = 20.dp))
            Spacer(Modifier.height(6.dp))
            Text("Discover your perfect destination", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500), modifier = Modifier.padding(horizontal = 20.dp))
            Spacer(Modifier.height(16.dp))
            Box(
                Modifier.padding(horizontal = 20.dp).fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(28.dp), spotColor = gray400.copy(alpha = 0.1f))
                    .clip(RoundedCornerShape(28.dp)).background(cardBg)
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Search, null, tint = gray400, modifier = Modifier.size(22.dp))
                    Spacer(Modifier.width(10.dp))
                    Box(Modifier.weight(1f)) {
                        if (searchQuery.isEmpty()) {
                            Text("Search cities, countries, or vibes...", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray400))
                        }
                        BasicTextField(
                            value = searchQuery, onValueChange = { searchQuery = it },
                            textStyle = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = navy),
                            singleLine = true, cursorBrush = SolidColor(deepBlue), modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Spacer(Modifier.width(10.dp))
                    Box(
                        Modifier.size(36.dp).clip(CircleShape).background(Color(0xFFF1F5F9))
                            .clickable { scope.launch { snackbarHostState.showSnackbar("Voice search activated — say a city name") } },
                        contentAlignment = Alignment.Center
                    ) { Icon(Icons.Outlined.Mic, null, tint = deepBlue, modifier = Modifier.size(20.dp)) }
                }
            }
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                filters.forEachIndexed { index, filter ->
                    val isActive = selectedFilter == index
                    val bg by animateColorAsState(if (isActive) deepBlue else Color.Transparent, label = "")
                    val border by animateColorAsState(if (isActive) deepBlue else gray200, label = "")
                    val textColor by animateColorAsState(if (isActive) Color.White else navy, label = "")
                    Box(
                        Modifier.clip(RoundedCornerShape(20.dp)).background(bg)
                            .border(1.5.dp, border, RoundedCornerShape(20.dp))
                            .clickable { selectedFilter = index }
                            .padding(horizontal = 16.dp, vertical = 9.dp)
                    ) { Text(filter, style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = textColor)) }
                }
            }
            Spacer(Modifier.height(24.dp))
            Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("Trending", style = TextStyle(fontFamily = sora, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = navy))
                Spacer(Modifier.weight(1f))
                Text("${filteredCities.size} results", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = deepBlue))
            }
            Spacer(Modifier.height(16.dp))
            if (filteredCities.isEmpty()) {
                Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🔍", fontSize = 40.sp)
                        Spacer(Modifier.height(12.dp))
                        Text("No cities found for \"$searchQuery\"", style = TextStyle(fontFamily = jakarta, fontSize = 16.sp, color = gray500))
                    }
                }
            } else {
                if (filteredCities.isNotEmpty()) {
                    val featured = filteredCities[0]
                    Box(
                        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(250.dp)
                            .shadow(12.dp, RoundedCornerShape(24.dp), spotColor = navy.copy(alpha = 0.2f))
                            .clip(RoundedCornerShape(24.dp))
                            .background(Brush.verticalGradient(listOf(featured.gradientTop.copy(alpha = 0.8f), featured.gradientBottom)))
                            .clickable { scope.launch { snackbarHostState.showSnackbar("Opening ${featured.name} details") } }
                    ) {
                        Box(Modifier.fillMaxSize().padding(20.dp)) {
                            Column(Modifier.align(Alignment.BottomStart)) {
                                Text(featured.name, style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White))
                                Spacer(Modifier.height(2.dp))
                                Text(featured.country, style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.8f)))
                                Spacer(Modifier.height(4.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Outlined.Star, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("${featured.rating} • ${featured.tag}", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.9f)))
                                }
                            }
                            Box(
                                Modifier.align(Alignment.BottomEnd).size(44.dp)
                                    .shadow(6.dp, CircleShape, spotColor = emerald.copy(alpha = 0.4f))
                                    .clip(CircleShape).background(Brush.horizontalGradient(listOf(emerald, mint)))
                                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { scope.launch { snackbarHostState.showSnackbar("${featured.name} added to your trip!") } },
                                contentAlignment = Alignment.Center
                            ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(22.dp)) }
                        }
                    }
                }
                Spacer(Modifier.height(16.dp))
                val gridCities = if (filteredCities.size > 1) filteredCities.drop(1) else emptyList()
                val rows = gridCities.chunked(2)
                rows.forEach { rowCities ->
                    Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        rowCities.forEach { city ->
                            Box(
                                Modifier.weight(1f).aspectRatio(0.85f)
                                    .shadow(8.dp, RoundedCornerShape(20.dp), spotColor = navy.copy(alpha = 0.15f))
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Brush.verticalGradient(listOf(city.gradientTop.copy(alpha = 0.75f), city.gradientBottom)))
                                    .clickable { scope.launch { snackbarHostState.showSnackbar("Opening ${city.name} details") } }
                            ) {
                                Box(Modifier.fillMaxSize().padding(14.dp)) {
                                    Column(Modifier.align(Alignment.BottomStart)) {
                                        Text(city.name, style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White))
                                        Text(city.country, style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White.copy(alpha = 0.8f)))
                                    }
                                    Box(
                                        Modifier.align(Alignment.BottomEnd).size(36.dp)
                                            .clip(CircleShape).background(Color.White.copy(alpha = 0.2f))
                                            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) { scope.launch { snackbarHostState.showSnackbar("${city.name} added to trip!") } },
                                        contentAlignment = Alignment.Center
                                    ) { Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(18.dp)) }
                                }
                            }
                        }
                        if (rowCities.size == 1) Spacer(Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(14.dp))
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}
