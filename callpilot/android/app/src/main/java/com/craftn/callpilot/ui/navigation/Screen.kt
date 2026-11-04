package com.craftn.callpilot.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String = "", val icon: ImageVector? = null) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Login : Screen("login")
    object Register : Screen("register")

    // Main Bottom Nav tabs
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Calls : Screen("calls", "Calls", Icons.Default.Phone)
    object Reminders : Screen("reminders", "Reminders", Icons.Default.Alarm)
    object Contacts : Screen("contacts", "Contacts", Icons.Default.People)
    object Assistant : Screen("assistant", "AI Assistant", Icons.AutoMirrored.Filled.Chat)

    // Feature & detail screens
    object CallDetail : Screen("call_detail/{callId}") {
        fun createRoute(callId: String) = "call_detail/$callId"
    }
    object LogCall : Screen("log_call")
    object Recording : Screen("recording")
    object ContactDetail : Screen("contact_detail/{contactId}") {
        fun createRoute(contactId: String) = "contact_detail/$contactId"
    }
    object AddContact : Screen("add_contact")
    object AddReminder : Screen("add_reminder")
    object Notes : Screen("notes", "Notes", Icons.Default.NoteAlt)
    object AddNote : Screen("add_note")
    object Transcript : Screen("transcript/{callId}") {
        fun createRoute(callId: String) = "transcript/$callId"
    }
    object Recap : Screen("recap/{callId}") {
        fun createRoute(callId: String) = "recap/$callId"
    }
    object Analytics : Screen("analytics", "Analytics", Icons.Default.BarChart)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

val BottomNavItems = listOf(
    Screen.Home,
    Screen.Calls,
    Screen.Reminders,
    Screen.Contacts,
    Screen.Assistant
)
