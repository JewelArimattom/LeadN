package com.craftn.callpilot.ui.screens.calls

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.craftn.callpilot.domain.model.CallType
import com.craftn.callpilot.ui.components.*
import com.craftn.callpilot.ui.screens.home.CallHomeCard
import com.craftn.callpilot.ui.theme.PrimaryOrange
import com.craftn.callpilot.ui.theme.SecondaryTeal
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CallsScreen(
    viewModel: CallsViewModel,
    onNavigateToCallDetail: (String) -> Unit,
    onNavigateToLogCall: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val timeFormat = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())

    val filteredCalls = remember(state.calls, state.selectedFilter) {
        when (state.selectedFilter) {
            "Incoming" -> state.calls.filter { it.callType == CallType.INCOMING }
            "Outgoing" -> state.calls.filter { it.callType == CallType.OUTGOING }
            "Recorded" -> state.calls.filter { it.hasRecording }
            else -> state.calls
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Call History",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                actions = {
                    IconButton(onClick = onNavigateToLogCall) {
                        Icon(Icons.Default.Add, contentDescription = "Log Call")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Search Bar
            ModernSearchBar(
                query = state.searchQuery,
                onQueryChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = "Search by client name, number or notes...",
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // Filter Chips Row
            val filters = listOf("All", "Incoming", "Outgoing", "Recorded")
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                items(filters) { filter ->
                    val isSelected = state.selectedFilter == filter
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.onFilterSelected(filter) },
                        label = { Text(filter) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryOrange,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Calls List
            if (filteredCalls.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No calls found",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredCalls) { call ->
                        CallHomeCard(
                            call = call,
                            timeFormat = timeFormat,
                            onClick = { onNavigateToCallDetail(call.id) }
                        )
                    }
                }
            }
        }
    }
}
