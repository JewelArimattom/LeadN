package com.craftn.callpilot.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.craftn.callpilot.data.local.datastore.UserPreferencesManager
import com.craftn.callpilot.domain.repository.AiRepository
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.repository.ContactRepository
import com.craftn.callpilot.ui.screens.assistant.AssistantScreen
import com.craftn.callpilot.ui.screens.assistant.AssistantViewModel
import com.craftn.callpilot.ui.screens.auth.AuthViewModel
import com.craftn.callpilot.ui.screens.auth.LoginScreen
import com.craftn.callpilot.ui.screens.auth.RegisterScreen
import com.craftn.callpilot.ui.screens.calls.CallDetailScreen
import com.craftn.callpilot.ui.screens.calls.CallsScreen
import com.craftn.callpilot.ui.screens.calls.CallsViewModel
import com.craftn.callpilot.ui.screens.calls.LogCallScreen
import com.craftn.callpilot.ui.screens.contacts.AddEditContactScreen
import com.craftn.callpilot.ui.screens.contacts.ContactDetailScreen
import com.craftn.callpilot.ui.screens.contacts.ContactsScreen
import com.craftn.callpilot.ui.screens.contacts.ContactsViewModel
import com.craftn.callpilot.ui.screens.home.HomeScreen
import com.craftn.callpilot.ui.screens.home.HomeViewModel
import com.craftn.callpilot.ui.screens.onboarding.OnboardingScreen
import com.craftn.callpilot.ui.screens.recap.RecapScreen
import com.craftn.callpilot.ui.screens.recording.RecordingScreen
import com.craftn.callpilot.ui.screens.recording.RecordingViewModel
import com.craftn.callpilot.ui.screens.reminders.AddEditReminderScreen
import com.craftn.callpilot.ui.screens.reminders.RemindersScreen
import com.craftn.callpilot.ui.screens.reminders.RemindersViewModel
import com.craftn.callpilot.ui.screens.settings.SettingsScreen
import com.craftn.callpilot.ui.screens.settings.SettingsViewModel
import com.craftn.callpilot.ui.screens.splash.SplashScreen
import com.craftn.callpilot.ui.screens.transcript.TranscriptScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    preferencesManager: UserPreferencesManager,
    callRepository: CallRepository,
    contactRepository: ContactRepository,
    aiRepository: AiRepository
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Show bottom bar only on the 5 core main tabs
    val showBottomBar = currentRoute in BottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(navController = navController)
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            // Splash & Onboarding
            composable(Screen.Splash.route) {
                SplashScreen(
                    preferencesManager = preferencesManager,
                    onNavigateToHome = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToLogin = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToOnboarding = {
                        navController.navigate(Screen.Onboarding.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    preferencesManager = preferencesManager,
                    onFinish = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            // Auth
            composable(Screen.Login.route) {
                val authViewModel: AuthViewModel = hiltViewModel()
                LoginScreen(
                    viewModel = authViewModel,
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Register.route) {
                val authViewModel: AuthViewModel = hiltViewModel()
                RegisterScreen(
                    viewModel = authViewModel,
                    onNavigateToLogin = { navController.popBackStack() },
                    onRegisterSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                )
            }

            // Home
            composable(Screen.Home.route) {
                val homeViewModel: HomeViewModel = hiltViewModel()
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToRecording = { navController.navigate(Screen.Recording.route) },
                    onNavigateToLogCall = { navController.navigate(Screen.LogCall.route) },
                    onNavigateToAddReminder = { navController.navigate(Screen.AddReminder.route) },
                    onNavigateToCalls = { navController.navigate(Screen.Calls.route) },
                    onNavigateToCallDetail = { callId -> navController.navigate(Screen.CallDetail.createRoute(callId)) },
                    onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
                )
            }

            // Calls
            composable(Screen.Calls.route) {
                val callsViewModel: CallsViewModel = hiltViewModel()
                CallsScreen(
                    viewModel = callsViewModel,
                    onNavigateToCallDetail = { callId -> navController.navigate(Screen.CallDetail.createRoute(callId)) },
                    onNavigateToLogCall = { navController.navigate(Screen.LogCall.route) }
                )
            }

            composable(
                route = Screen.CallDetail.route,
                arguments = listOf(navArgument("callId") { type = NavType.StringType })
            ) { backStackEntry ->
                val callId = backStackEntry.arguments?.getString("callId") ?: ""
                CallDetailScreen(
                    callId = callId,
                    callRepository = callRepository,
                    aiRepository = aiRepository,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToRecap = { id -> navController.navigate(Screen.Recap.createRoute(id)) },
                    onNavigateToTranscript = { id -> navController.navigate(Screen.Transcript.createRoute(id)) }
                )
            }

            composable(Screen.LogCall.route) {
                val callsViewModel: CallsViewModel = hiltViewModel()
                LogCallScreen(
                    viewModel = callsViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Recording.route) {
                val recordingViewModel: RecordingViewModel = hiltViewModel()
                RecordingScreen(
                    viewModel = recordingViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToRecap = { callId ->
                        navController.navigate(Screen.Recap.createRoute(callId)) {
                            popUpTo(Screen.Recording.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(
                route = Screen.Recap.route,
                arguments = listOf(navArgument("callId") { type = NavType.StringType })
            ) { backStackEntry ->
                val callId = backStackEntry.arguments?.getString("callId") ?: ""
                RecapScreen(
                    callId = callId,
                    callRepository = callRepository,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToTranscript = { id -> navController.navigate(Screen.Transcript.createRoute(id)) }
                )
            }

            composable(
                route = Screen.Transcript.route,
                arguments = listOf(navArgument("callId") { type = NavType.StringType })
            ) { backStackEntry ->
                val callId = backStackEntry.arguments?.getString("callId") ?: ""
                TranscriptScreen(
                    callId = callId,
                    callRepository = callRepository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Reminders
            composable(Screen.Reminders.route) {
                val remindersViewModel: RemindersViewModel = hiltViewModel()
                RemindersScreen(
                    viewModel = remindersViewModel,
                    onNavigateToAddReminder = { navController.navigate(Screen.AddReminder.route) }
                )
            }

            composable(Screen.AddReminder.route) {
                val remindersViewModel: RemindersViewModel = hiltViewModel()
                AddEditReminderScreen(
                    viewModel = remindersViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Contacts
            composable(Screen.Contacts.route) {
                val contactsViewModel: ContactsViewModel = hiltViewModel()
                ContactsScreen(
                    viewModel = contactsViewModel,
                    onNavigateToContactDetail = { id -> navController.navigate(Screen.ContactDetail.createRoute(id)) },
                    onNavigateToAddContact = { navController.navigate(Screen.AddContact.route) }
                )
            }

            composable(
                route = Screen.ContactDetail.route,
                arguments = listOf(navArgument("contactId") { type = NavType.StringType })
            ) { backStackEntry ->
                val contactId = backStackEntry.arguments?.getString("contactId") ?: ""
                ContactDetailScreen(
                    contactId = contactId,
                    contactRepository = contactRepository,
                    callRepository = callRepository,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToCallDetail = { id -> navController.navigate(Screen.CallDetail.createRoute(id)) }
                )
            }

            composable(Screen.AddContact.route) {
                val contactsViewModel: ContactsViewModel = hiltViewModel()
                AddEditContactScreen(
                    viewModel = contactsViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Assistant
            composable(Screen.Assistant.route) {
                val assistantViewModel: AssistantViewModel = hiltViewModel()
                AssistantScreen(viewModel = assistantViewModel)
            }

            // Settings
            composable(Screen.Settings.route) {
                val settingsViewModel: SettingsViewModel = hiltViewModel()
                SettingsScreen(
                    viewModel = settingsViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onLoggedOut = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
