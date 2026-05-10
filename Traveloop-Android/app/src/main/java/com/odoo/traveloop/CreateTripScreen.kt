package com.odoo.traveloop
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Hiking
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Nightlife
import androidx.compose.material.icons.outlined.Photo
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Spa
import androidx.compose.material.icons.outlined.VolunteerActivism
import androidx.compose.material3.Icon
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CreateTripScreen(onNavigateBack: () -> Unit) {
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
    var currentStep by remember { mutableIntStateOf(1) }
    var destination by remember { mutableStateOf("") }
    var tripName by remember { mutableStateOf("") }
    var vibe by remember { mutableStateOf("") }
    var startDate by remember { mutableStateOf("Nov 15, 2025") }
    var endDate by remember { mutableStateOf("Nov 27, 2025") }
    var travelers by remember { mutableIntStateOf(2) }
    val selectedInterests = remember { mutableStateListOf<String>() }
    var budget by remember { mutableFloatStateOf(3500f) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val steps = listOf("Details", "Dates", "Style")
    val interests = listOf(
        "Adventure" to Icons.Outlined.Hiking,
        "Food & Drink" to Icons.Outlined.Restaurant,
        "Cultural" to Icons.Outlined.VolunteerActivism,
        "Relaxation" to Icons.Outlined.Spa,
        "Nightlife" to Icons.Outlined.Nightlife,
        "Photography" to Icons.Outlined.Photo,
        "Nature" to Icons.Outlined.Explore,
        "Romantic" to Icons.Outlined.Flight
    )
    Box(Modifier.fillMaxSize().background(pageBg).imePadding()) {
        Column(Modifier.fillMaxSize()) {
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(36.dp).clip(CircleShape).background(Color(0xFFF1F5F9))
                        .clickable { if (currentStep > 1) currentStep-- else onNavigateBack() },
                    contentAlignment = Alignment.Center
                ) { Icon(Icons.Default.Close, null, tint = navy, modifier = Modifier.size(20.dp)) }
                Spacer(Modifier.weight(1f))
                Text("Create Trip", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy))
                Spacer(Modifier.weight(1f))
                Spacer(Modifier.size(36.dp))
            }
            Spacer(Modifier.height(24.dp))
            Row(Modifier.fillMaxWidth().padding(horizontal = 40.dp), verticalAlignment = Alignment.CenterVertically) {
                steps.forEachIndexed { index, label ->
                    val stepNum = index + 1
                    val isActive = stepNum == currentStep
                    val isDone = stepNum < currentStep
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            Modifier.size(32.dp).clip(CircleShape)
                                .then(if (isActive || isDone) Modifier.background(deepBlue) else Modifier.border(2.dp, gray200, CircleShape).background(Color.Transparent)),
                            contentAlignment = Alignment.Center
                        ) { Text("$stepNum", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (isActive || isDone) Color.White else gray400)) }
                        Spacer(Modifier.height(6.dp))
                        Text(label, style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium, color = if (isActive) deepBlue else gray400))
                    }
                    if (index < steps.lastIndex) {
                        Box(Modifier.weight(1f).height(2.dp).padding(bottom = 18.dp).background(if (isDone || (stepNum < currentStep)) deepBlue else gray200))
                    }
                }
            }
            Spacer(Modifier.height(28.dp))
            AnimatedContent(
                targetState = currentStep,
                transitionSpec = {
                    (slideInHorizontally { if (targetState > initialState) it else -it } + fadeIn())
                        .togetherWith(slideOutHorizontally { if (targetState > initialState) -it else it } + fadeOut())
                },
                label = "step"
            ) { step ->
                Column(Modifier.fillMaxWidth().weight(1f).verticalScroll(rememberScrollState())) {
                    when (step) {
                        1 -> StepDetails(destination, { destination = it }, tripName, { tripName = it }, vibe, { vibe = it }, deepBlue, navy, gray500, gray400, gray200, cardBg, sora, jakarta)
                        2 -> StepDates(startDate, { startDate = it }, endDate, { endDate = it }, travelers, { travelers = it }, deepBlue, emerald, navy, gray500, gray400, gray200, cardBg, sora, jakarta)
                        3 -> StepStyle(interests, selectedInterests, budget, { budget = it }, deepBlue, emerald, navy, gray500, gray400, gray200, cardBg, sora, jakarta)
                    }
                    Spacer(Modifier.height(100.dp))
                }
            }
        }
        Box(
            Modifier.align(Alignment.BottomCenter).padding(horizontal = 20.dp, vertical = 24.dp).fillMaxWidth().height(56.dp)
                .shadow(12.dp, CircleShape, spotColor = deepBlue.copy(alpha = 0.3f))
                .clip(CircleShape).background(deepBlue)
                .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true, color = Color.White)) {
                    when (currentStep) {
                        1 -> {
                            if (destination.isEmpty()) { scope.launch { snackbarHostState.showSnackbar("Please enter a destination") } }
                            else currentStep = 2
                        }
                        2 -> currentStep = 3
                        3 -> {
                            val name = tripName.ifEmpty { "$destination Adventure" }
                            scope.launch { snackbarHostState.showSnackbar("\"$name\" created! $travelers travelers • $${budget.toInt()} budget") }
                            onNavigateBack()
                        }
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (currentStep < 3) "Continue" else "Create Trip", style = TextStyle(fontFamily = sora, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White))
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = Color.White, modifier = Modifier.size(20.dp))
            }
        }
        SnackbarHost(snackbarHostState, modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 90.dp))
    }
}
@Composable
fun StepDetails(
    destination: String, onDestChange: (String) -> Unit,
    tripName: String, onNameChange: (String) -> Unit,
    vibe: String, onVibeChange: (String) -> Unit,
    deepBlue: Color, navy: Color, gray500: Color, gray400: Color, gray200: Color, cardBg: Color,
    sora: FontFamily, jakarta: FontFamily
) {
    Column(Modifier.padding(horizontal = 20.dp)) {
        Text("Where to next?", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = deepBlue, letterSpacing = (-0.02).sp))
        Spacer(Modifier.height(8.dp))
        Text("Tell us about your dream destination.", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500, lineHeight = 22.sp))
        Spacer(Modifier.height(24.dp))
        InputCard("Destination", Icons.Outlined.LocationOn, destination, "e.g., Kyoto, Japan", onDestChange, deepBlue, navy, gray400, gray200, cardBg, sora, jakarta)
        Spacer(Modifier.height(14.dp))
        InputCard("Trip Name", Icons.Outlined.Flight, tripName, "e.g., Golden Week Escape", onNameChange, deepBlue, navy, gray400, gray200, cardBg, sora, jakarta)
        Spacer(Modifier.height(14.dp))
        InputCard("Vibe & Description", Icons.Outlined.Description, vibe, "Temple visits, street food, zen gardens...", onVibeChange, deepBlue, navy, gray400, gray200, cardBg, sora, jakarta)
    }
}
@Composable
fun StepDates(
    startDate: String, onStartChange: (String) -> Unit,
    endDate: String, onEndChange: (String) -> Unit,
    travelers: Int, onTravelersChange: (Int) -> Unit,
    deepBlue: Color, emerald: Color, navy: Color, gray500: Color, gray400: Color, gray200: Color, cardBg: Color,
    sora: FontFamily, jakarta: FontFamily
) {
    Column(Modifier.padding(horizontal = 20.dp)) {
        Text("When are you going?", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = deepBlue, letterSpacing = (-0.02).sp))
        Spacer(Modifier.height(8.dp))
        Text("Pick your travel dates and group size.", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500, lineHeight = 22.sp))
        Spacer(Modifier.height(24.dp))
        InputCard("Start Date", Icons.Outlined.CalendarMonth, startDate, "Select start date", onStartChange, deepBlue, navy, gray400, gray200, cardBg, sora, jakarta)
        Spacer(Modifier.height(14.dp))
        InputCard("End Date", Icons.Outlined.CalendarMonth, endDate, "Select end date", onEndChange, emerald, navy, gray400, gray200, cardBg, sora, jakarta)
        Spacer(Modifier.height(14.dp))
        Box(
            Modifier.fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                .clip(RoundedCornerShape(16.dp))
                .drawBehind { drawRect(deepBlue, topLeft = Offset.Zero, size = androidx.compose.ui.geometry.Size(4.dp.toPx(), size.height)) }
                .background(cardBg).padding(20.dp)
        ) {
            Column {
                Text("Travelers", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                Spacer(Modifier.height(12.dp))
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Groups, null, tint = gray400, modifier = Modifier.size(22.dp))
                    Spacer(Modifier.width(12.dp))
                    Text("$travelers ${if (travelers == 1) "traveler" else "travelers"}", style = TextStyle(fontFamily = jakarta, fontSize = 16.sp, fontWeight = FontWeight.Normal, color = navy))
                    Spacer(Modifier.weight(1f))
                    Box(
                        Modifier.size(36.dp).clip(CircleShape).background(if (travelers > 1) Color(0xFFEFF6FF) else gray200)
                            .clickable { if (travelers > 1) onTravelersChange(travelers - 1) },
                        contentAlignment = Alignment.Center
                    ) { Icon(Icons.Default.Remove, null, tint = if (travelers > 1) deepBlue else gray400, modifier = Modifier.size(18.dp)) }
                    Spacer(Modifier.width(12.dp))
                    Text("$travelers", style = TextStyle(fontFamily = sora, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = navy, textAlign = TextAlign.Center), modifier = Modifier.width(32.dp))
                    Spacer(Modifier.width(12.dp))
                    Box(
                        Modifier.size(36.dp).clip(CircleShape).background(if (travelers < 20) Color(0xFFEFF6FF) else gray200)
                            .clickable { if (travelers < 20) onTravelersChange(travelers + 1) },
                        contentAlignment = Alignment.Center
                    ) { Icon(Icons.Default.Add, null, tint = if (travelers < 20) deepBlue else gray400, modifier = Modifier.size(18.dp)) }
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color(0xFFEFF6FF)).padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("📅", fontSize = 24.sp)
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("Trip Duration", style = TextStyle(fontFamily = sora, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    Text("12 days • $travelers travelers", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
                }
            }
        }
    }
}
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun StepStyle(
    interests: List<Pair<String, ImageVector>>,
    selectedInterests: MutableList<String>,
    budget: Float, onBudgetChange: (Float) -> Unit,
    deepBlue: Color, emerald: Color, navy: Color, gray500: Color, gray400: Color, gray200: Color, cardBg: Color,
    sora: FontFamily, jakarta: FontFamily
) {
    Column(Modifier.padding(horizontal = 20.dp)) {
        Text("Your travel style", style = TextStyle(fontFamily = sora, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = deepBlue, letterSpacing = (-0.02).sp))
        Spacer(Modifier.height(8.dp))
        Text("Select your interests and set a budget.", style = TextStyle(fontFamily = jakarta, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = gray500, lineHeight = 22.sp))
        Spacer(Modifier.height(24.dp))
        Text("Interests", style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = navy))
        Spacer(Modifier.height(12.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            interests.forEach { (name, icon) ->
                val isSelected = name in selectedInterests
                Row(
                    Modifier.clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) deepBlue else Color.Transparent)
                        .border(1.5.dp, if (isSelected) deepBlue else gray200, RoundedCornerShape(20.dp))
                        .clickable(interactionSource = remember { MutableInteractionSource() }, indication = ripple(bounded = true)) { if (isSelected) selectedInterests.remove(name) else selectedInterests.add(name) }
                        .padding(horizontal = 14.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(icon, null, tint = if (isSelected) Color.White else gray500, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(name, style = TextStyle(fontFamily = sora, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = if (isSelected) Color.White else navy))
                }
            }
        }
        Spacer(Modifier.height(28.dp))
        Text("Budget", style = TextStyle(fontFamily = sora, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = navy))
        Spacer(Modifier.height(4.dp))
        Text("Set your maximum trip budget", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
        Spacer(Modifier.height(16.dp))
        Box(
            Modifier.fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
                .clip(RoundedCornerShape(16.dp)).background(cardBg).padding(20.dp)
        ) {
            Column {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("$${budget.toInt()}", style = TextStyle(fontFamily = sora, fontSize = 32.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    Box(Modifier.clip(RoundedCornerShape(10.dp)).background(Color(0xFFEFF6FF)).padding(horizontal = 10.dp, vertical = 4.dp)) {
                        Text("USD", style = TextStyle(fontFamily = sora, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = deepBlue))
                    }
                }
                Spacer(Modifier.height(12.dp))
                Slider(
                    value = budget, onValueChange = onBudgetChange,
                    valueRange = 500f..15000f, steps = 28,
                    colors = SliderDefaults.colors(thumbColor = deepBlue, activeTrackColor = deepBlue, inactiveTrackColor = Color(0xFFE0E7FF))
                )
                Spacer(Modifier.height(4.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("$500", style = TextStyle(fontFamily = jakarta, fontSize = 12.sp, color = gray400))
                    Text("$15,000", style = TextStyle(fontFamily = jakarta, fontSize = 12.sp, color = gray400))
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        if (selectedInterests.isNotEmpty()) {
            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color(0xFFF0FDF4)).padding(16.dp)) {
                Column {
                    Text("Trip Summary", style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = emerald))
                    Spacer(Modifier.height(8.dp))
                    Text("${selectedInterests.size} interests selected • $${budget.toInt()} budget", style = TextStyle(fontFamily = jakarta, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = gray500))
                    Spacer(Modifier.height(4.dp))
                    Text(selectedInterests.joinToString(", "), style = TextStyle(fontFamily = jakarta, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = emerald))
                }
            }
        }
    }
}
@Composable
fun InputCard(
    label: String, icon: ImageVector, value: String, placeholder: String,
    onValueChange: (String) -> Unit, accentColor: Color, navy: Color,
    gray400: Color, gray200: Color, cardBg: Color, sora: FontFamily, jakarta: FontFamily
) {
    Box(
        Modifier.fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = gray400.copy(alpha = 0.1f))
            .clip(RoundedCornerShape(16.dp))
            .drawBehind { drawRect(accentColor, topLeft = Offset.Zero, size = androidx.compose.ui.geometry.Size(4.dp.toPx(), size.height)) }
            .background(cardBg).padding(20.dp)
    ) {
        Column {
            Text(label, style = TextStyle(fontFamily = sora, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = accentColor))
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = gray400, modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(12.dp))
                Box(Modifier.weight(1f)) {
                    if (value.isEmpty()) Text(placeholder, style = TextStyle(fontFamily = jakarta, fontSize = 16.sp, fontWeight = FontWeight.Normal, color = gray400))
                    BasicTextField(
                        value = value, onValueChange = onValueChange,
                        textStyle = TextStyle(fontFamily = jakarta, fontSize = 16.sp, fontWeight = FontWeight.Normal, color = navy),
                        singleLine = true, cursorBrush = SolidColor(accentColor), modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Box(Modifier.fillMaxWidth().height(1.dp).background(gray200))
        }
    }
}
