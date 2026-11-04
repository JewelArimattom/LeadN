package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.Reminder
import com.craftn.callpilot.domain.model.ReminderPriority
import com.craftn.callpilot.domain.model.ReminderStatus
import kotlinx.coroutines.flow.Flow
import java.util.Date

interface ReminderRepository {
    fun getAllReminders(): Flow<List<Reminder>>
    fun getPendingReminders(): Flow<List<Reminder>>
    fun getUpcomingReminders(limit: Int = 10): Flow<List<Reminder>>
    fun getRemindersForContact(contactId: String): Flow<List<Reminder>>
    fun getRemindersForCall(callId: String): Flow<List<Reminder>>
    suspend fun getReminderById(id: String): Reminder?
    suspend fun insertReminder(reminder: Reminder): String
    suspend fun updateReminder(reminder: Reminder)
    suspend fun markCompleted(id: String)
    suspend fun snoozeReminder(id: String, newDueTime: Date)
    suspend fun dismissReminder(id: String)
    suspend fun deleteReminder(id: String)
    suspend fun getActiveRemindersList(): List<Reminder>
    suspend fun syncReminders()
}
