package com.odoo.traveloop
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.odoo.traveloop.ui.theme.TraveloopTheme
enum class Screen {
    Onboarding, Dashboard, CreateTrip, Itinerary, Explore, Wallet, Profile, CitySearch
}
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TraveloopTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AppNavigation()
                }
            }
        }
    }
}
@Composable
fun AppNavigation() {
    var currentScreen by remember { mutableStateOf(Screen.Onboarding) }
    when (currentScreen) {
        Screen.Onboarding -> OnboardingScreen(
            onSkipClicked = { currentScreen = Screen.Dashboard },
            onGetStartedClicked = { currentScreen = Screen.Dashboard }
        )
        Screen.Dashboard -> DashboardScreen(
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToItinerary = { currentScreen = Screen.Itinerary },
            onNavigateToExplore = { currentScreen = Screen.CitySearch },
            onNavigateToWallet = { currentScreen = Screen.Wallet },
            onNavigateToProfile = { currentScreen = Screen.Profile }
        )
        Screen.CreateTrip -> CreateTripScreen(onNavigateBack = { currentScreen = Screen.Dashboard })
        Screen.Itinerary -> ItineraryScreen(
            onNavigateBack = { currentScreen = Screen.Dashboard },
            onNavigateToExplore = { currentScreen = Screen.CitySearch },
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToWallet = { currentScreen = Screen.Wallet },
            onNavigateToProfile = { currentScreen = Screen.Profile }
        )
        Screen.Explore -> ExploreScreen(
            onNavigateHome = { currentScreen = Screen.Dashboard },
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToWallet = { currentScreen = Screen.Wallet },
            onNavigateToProfile = { currentScreen = Screen.Profile }
        )
        Screen.Wallet -> WalletScreen(
            onNavigateHome = { currentScreen = Screen.Dashboard },
            onNavigateToExplore = { currentScreen = Screen.CitySearch },
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToProfile = { currentScreen = Screen.Profile }
        )
        Screen.Profile -> ProfileScreen(
            onNavigateHome = { currentScreen = Screen.Dashboard },
            onNavigateToExplore = { currentScreen = Screen.CitySearch },
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToWallet = { currentScreen = Screen.Wallet },
            onLogout = { currentScreen = Screen.Onboarding }
        )
        Screen.CitySearch -> CitySearchScreen(
            onNavigateHome = { currentScreen = Screen.Dashboard },
            onNavigateToExplore = { currentScreen = Screen.Explore },
            onNavigateToCreateTrip = { currentScreen = Screen.CreateTrip },
            onNavigateToWallet = { currentScreen = Screen.Wallet },
            onNavigateToProfile = { currentScreen = Screen.Profile }
        )
    }
}