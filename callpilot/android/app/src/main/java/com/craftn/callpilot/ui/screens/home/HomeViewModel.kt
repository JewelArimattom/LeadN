package com.craftn.callpilot.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.AiRepository
import com.craftn.callpilot.domain.repository.ReminderRepository
import com.craftn.callpilot.domain.usecase.DashboardState
import com.craftn.callpilot.domain.usecase.GetDashboardDataUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getDashboardDataUseCase: GetDashboardDataUseCase,
    private val reminderRepository: ReminderRepository,
    private val aiRepository: AiRepository
) : ViewModel() {

    private val _dashboardState = MutableStateFlow(DashboardState())
    val dashboardState: StateFlow<DashboardState> = _dashboardState.asStateFlow()

    init {
        loadDashboard()
        loadAiInsightsAndAnalytics()
    }

    private fun loadDashboard() {
        viewModelScope.launch {
            getDashboardDataUseCase().collect { data ->
                _dashboardState.value = _dashboardState.value.copy(
                    recentCalls = data.recentCalls,
                    pendingReminders = data.pendingReminders,
                    pinnedNotes = data.pinnedNotes
                )
            }
        }
    }

    private fun loadAiInsightsAndAnalytics() {
        viewModelScope.launch {
            try {
                val insights = aiRepository.getInsights()
                val analytics = aiRepository.getAnalytics()
                _dashboardState.value = _dashboardState.value.copy(
                    insights = insights,
                    analytics = analytics
                )
            } catch (_: Exception) {}
        }
    }

    fun completeReminder(id: String) {
        viewModelScope.launch {
            reminderRepository.markCompleted(id)
        }
    }
}
