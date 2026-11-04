package com.craftn.callpilot.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.CallMade
import androidx.compose.material.icons.automirrored.filled.CallMissed
import androidx.compose.material.icons.automirrored.filled.CallReceived
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.craftn.callpilot.domain.model.CallType
import com.craftn.callpilot.domain.model.ReminderPriority
import com.craftn.callpilot.ui.theme.*

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    accentColor: Color = PrimaryOrangeLight
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun PriorityBadge(priority: ReminderPriority) {
    val (bgColor, textColor, label) = when (priority) {
        ReminderPriority.LOW -> Triple(Color(0xFF1E293B), Color(0xFF94A3B8), "Low")
        ReminderPriority.MEDIUM -> Triple(Color(0xFF0369A1).copy(alpha = 0.2f), Color(0xFF38BDF8), "Medium")
        ReminderPriority.HIGH -> Triple(Color(0xFFB45309).copy(alpha = 0.25f), Color(0xFFFBBF24), "High")
        ReminderPriority.URGENT -> Triple(Color(0xFFBE123C).copy(alpha = 0.25f), Color(0xFFFB7185), "Urgent")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor
        )
    }
}

@Composable
fun SentimentBadge(sentiment: String?) {
    val label = sentiment ?: "Neutral"
    val color = when (label.lowercase()) {
        "positive" -> StatusGreen
        "negative" -> StatusRed
        else -> StatusYellow
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = "Sentiment: $label",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = color
        )
    }
}

@Composable
fun ContactAvatar(
    name: String,
    modifier: Modifier = Modifier,
    size: Int = 44
) {
    val initials = name.split(" ")
        .mapNotNull { it.firstOrNull()?.toString() }
        .take(2)
        .joinToString("")
        .ifBlank { "CP" }
        .uppercase()

    val colors = listOf(PrimaryOrange, SecondaryTeal, AccentPurple, AccentCoral, AccentAmber)
    val colorIndex = kotlin.math.abs(name.hashCode()) % colors.size
    val bgColor = colors[colorIndex]

    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(
                Brush.linearGradient(
                    listOf(bgColor, bgColor.copy(alpha = 0.7f))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = initials,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = (size * 0.38f).sp
        )
    }
}

@Composable
fun ModernSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String = "Search...",
    modifier: Modifier = Modifier
) {
    TextField(
        value = query,
        onValueChange = onQueryChange,
        placeholder = { Text(placeholder, color = MaterialTheme.colorScheme.onSurfaceVariant) },
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.onSurfaceVariant)
        },
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Default.Close, contentDescription = "Clear", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        },
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent
        ),
        modifier = modifier.fillMaxWidth()
    )
}

@Composable
fun CallTypeIcon(callType: CallType, modifier: Modifier = Modifier) {
    val (icon, color) = when (callType) {
        CallType.INCOMING -> Pair(Icons.AutoMirrored.Filled.CallReceived, StatusGreen)
        CallType.OUTGOING -> Pair(Icons.AutoMirrored.Filled.CallMade, PrimaryOrangeLight)
        CallType.MISSED -> Pair(Icons.AutoMirrored.Filled.CallMissed, StatusRed)
    }
    Icon(
        imageVector = icon,
        contentDescription = callType.name,
        tint = color,
        modifier = modifier
    )
}

@Composable
fun WaveformVisualizer(
    amplitudes: List<Float>,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(60.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        val displayBars = if (amplitudes.isEmpty()) {
            List(30) { 0.15f }
        } else {
            amplitudes.takeLast(30)
        }

        displayBars.forEach { amp ->
            val heightPercent = amp.coerceIn(0.1f, 1f)
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight(heightPercent)
                    .clip(RoundedCornerShape(2.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(PrimaryOrangeLight, SecondaryTeal)
                        )
                    )
            )
        }
    }
}
