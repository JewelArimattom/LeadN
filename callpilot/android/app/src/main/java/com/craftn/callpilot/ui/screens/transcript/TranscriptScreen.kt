package com.craftn.callpilot.ui.screens.transcript

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.craftn.callpilot.domain.model.Transcript
import com.craftn.callpilot.domain.model.TranscriptSegment
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.ui.components.ModernSearchBar
import com.craftn.callpilot.ui.theme.PrimaryOrange
import com.craftn.callpilot.ui.theme.SecondaryTeal

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TranscriptScreen(
    callId: String,
    callRepository: CallRepository,
    onNavigateBack: () -> Unit
) {
    var transcript by remember { mutableStateOf<Transcript?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(callId) {
        transcript = callRepository.getTranscript(callId)
        isLoading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Call Transcript") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (transcript == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No transcript available for this call.")
            }
        } else {
            val t = transcript!!
            val filteredSegments = remember(t.segments, searchQuery) {
                if (searchQuery.isBlank()) t.segments
                else t.segments.filter { it.text.contains(searchQuery, ignoreCase = true) }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp)
            ) {
                ModernSearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    placeholder = "Search in transcript...",
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredSegments) { segment ->
                        TranscriptBubble(segment = segment)
                    }
                }
            }
        }
    }
}

@Composable
fun TranscriptBubble(segment: TranscriptSegment) {
    val isUser = segment.speaker.equals("user", ignoreCase = true) || segment.speaker.equals("me", ignoreCase = true)
    val alignment = if (isUser) Alignment.End else Alignment.Start
    val bgColor = if (isUser) PrimaryOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 4.dp)
        ) {
            Text(
                text = segment.speaker,
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = if (isUser) PrimaryOrange else SecondaryTeal
            )
            Spacer(modifier = Modifier.width(6.dp))
            val startSec = segment.startTime.toInt()
            Text(
                text = String.format("%02d:%02d", startSec / 60, startSec % 60),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Box(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 14.dp,
                        topEnd = 14.dp,
                        bottomStart = if (isUser) 14.dp else 2.dp,
                        bottomEnd = if (isUser) 2.dp else 14.dp
                    )
                )
                .background(bgColor)
                .padding(14.dp)
        ) {
            Text(
                text = segment.text,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
                lineHeight = 20.sp
            )
        }
    }
}
