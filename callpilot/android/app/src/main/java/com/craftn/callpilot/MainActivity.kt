package com.craftn.callpilot

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.craftn.callpilot.data.local.datastore.UserPreferencesManager
import com.craftn.callpilot.domain.repository.AiRepository
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.repository.ContactRepository
import com.craftn.callpilot.ui.navigation.NavGraph
import com.craftn.callpilot.ui.theme.CallPilotTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesManager: UserPreferencesManager

    @Inject
    lateinit var callRepository: CallRepository

    @Inject
    lateinit var contactRepository: ContactRepository

    @Inject
    lateinit var aiRepository: AiRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            CallPilotTheme(darkTheme = true) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()
                    NavGraph(
                        navController = navController,
                        preferencesManager = preferencesManager,
                        callRepository = callRepository,
                        contactRepository = contactRepository,
                        aiRepository = aiRepository
                    )
                }
            }
        }
    }
}
