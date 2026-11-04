package com.craftn.callpilot.ui.screens.calls

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.CallRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class CallsUiState(
    val calls: List<CallRecord> = emptyList(),
    val searchQuery: String = "",
    val selectedFilter: String = "All", // All, Incoming, Outgoing, Recorded
    val isLoading: Boolean = false
)

@HiltViewModel
class CallsViewModel @Inject constructor(
    private val callRepository: CallRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CallsUiState())
    val uiState: StateFlow<CallsUiState> = _uiState.asStateFlow()

    init {
        loadCalls()
    }

    private fun loadCalls() {
        viewModelScope.launch {
            callRepository.getAllCalls().collect { list ->
                _uiState.value = _uiState.value.copy(calls = list)
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        viewModelScope.launch {
            if (query.isBlank()) {
                loadCalls()
            } else {
                callRepository.searchCalls(query).collect { list ->
                    _uiState.value = _uiState.value.copy(calls = list)
                }
            }
        }
    }

    fun onFilterSelected(filter: String) {
        _uiState.value = _uiState.value.copy(selectedFilter = filter)
    }

    fun logManualCall(
        contactName: String,
        phone: String,
        callType: CallType,
        durationMinutes: Int,
        notes: String
    ) {
        viewModelScope.launch {
            val record = CallRecord(
                id = "",
                contactName = contactName,
                phoneNumber = phone,
                callType = callType,
                source = CallSource.MANUAL_LOGGED,
                durationSeconds = durationMinutes * 60,
                timestamp = Date(),
                summary = notes
            )
            callRepository.insertCall(record)
        }
    }
}
