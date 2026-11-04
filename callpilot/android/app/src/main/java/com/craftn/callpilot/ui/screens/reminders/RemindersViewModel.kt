package com.craftn.callpilot.ui.screens.reminders

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.model.Reminder
import com.craftn.callpilot.domain.model.ReminderPriority
import com.craftn.callpilot.domain.repository.ReminderRepository
import com.craftn.callpilot.service.notification.NotificationHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class RemindersUiState(
    val reminders: List<Reminder> = emptyList(),
    val filter: String = "Pending", // Pending, All, Completed
    val isLoading: Boolean = false
)

@HiltViewModel
class RemindersViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val reminderRepository: ReminderRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RemindersUiState())
    val uiState: StateFlow<RemindersUiState> = _uiState.asStateFlow()

    init {
        loadReminders()
    }

    fun setFilter(filter: String) {
        _uiState.value = _uiState.value.copy(filter = filter)
        loadReminders()
    }

    private fun loadReminders() {
        viewModelScope.launch {
            if (_uiState.value.filter == "Pending") {
                reminderRepository.getPendingReminders().collect { list ->
                    _uiState.value = _uiState.value.copy(reminders = list)
                }
            } else {
                reminderRepository.getAllReminders().collect { list ->
                    val filtered = if (_uiState.value.filter == "Completed") {
                        list.filter { it.status.name == "COMPLETED" }
                    } else list
                    _uiState.value = _uiState.value.copy(reminders = filtered)
                }
            }
        }
    }

    fun completeReminder(id: String) {
        viewModelScope.launch {
            reminderRepository.markCompleted(id)
            NotificationHelper.cancelAlarm(context, id)
        }
    }

    fun snoozeReminder(id: String, minutes: Int = 15) {
        viewModelScope.launch {
            val newDue = Date(System.currentTimeMillis() + minutes * 60 * 1000)
            reminderRepository.snoozeReminder(id, newDue)
            val updated = reminderRepository.getReminderById(id)
            if (updated != null) {
                NotificationHelper.scheduleAlarm(context, updated)
            }
        }
    }

    fun deleteReminder(id: String) {
        viewModelScope.launch {
            reminderRepository.deleteReminder(id)
            NotificationHelper.cancelAlarm(context, id)
        }
    }

    fun saveReminder(
        id: String,
        title: String,
        desc: String?,
        contactName: String?,
        phone: String?,
        dueDateTime: Date,
        priority: ReminderPriority
    ) {
        viewModelScope.launch {
            val reminder = Reminder(
                id = id,
                title = title,
                description = desc,
                contactName = contactName,
                contactPhone = phone,
                dueDateTime = dueDateTime,
                priority = priority
            )
            val savedId = reminderRepository.insertReminder(reminder)
            val fullReminder = reminder.copy(id = savedId)
            NotificationHelper.scheduleAlarm(context, fullReminder)
        }
    }
}
