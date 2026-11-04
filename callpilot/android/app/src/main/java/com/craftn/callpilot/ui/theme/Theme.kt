package com.craftn.callpilot.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryOrangeLight,
    onPrimary = BackgroundDark,
    primaryContainer = PrimaryOrangeDark,
    onPrimaryContainer = TextPrimaryDark,
    secondary = SecondaryTeal,
    onSecondary = BackgroundDark,
    secondaryContainer = SecondaryTealDark,
    onSecondaryContainer = TextPrimaryDark,
    tertiary = AccentPurple,
    background = BackgroundDark,
    onBackground = TextPrimaryDark,
    surface = SurfaceDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = SurfaceDarkElevated,
    onSurfaceVariant = TextSecondaryDark,
    error = StatusRed
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryOrange,
    onPrimary = SurfaceLight,
    primaryContainer = PrimaryOrangeLight,
    onPrimaryContainer = BackgroundDark,
    secondary = SecondaryTealDark,
    onSecondary = SurfaceLight,
    background = BackgroundLight,
    onBackground = TextPrimaryLight,
    surface = SurfaceLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = BackgroundLight,
    onSurfaceVariant = TextSecondaryLight,
    error = StatusRed
)

@Composable
fun CallPilotTheme(
    darkTheme: Boolean = true, // Default to sleek premium dark theme
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            window?.let {
                it.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(it, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
