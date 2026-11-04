package com.craftn.callpilot.data.repository

import com.craftn.callpilot.data.local.db.dao.ReminderDao
import com.craftn.callpilot.data.local.db.entities.ReminderEntity
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.CreateReminderRequest
import com.craftn.callpilot.domain.model.Reminder
import com.craftn.callpilot.domain.model.ReminderPriority
import com.craftn.callpilot.domain.model.ReminderStatus
import com.craftn.callpilot.domain.repository.ReminderRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReminderRepositoryImpl @Inject constructor(
    private val reminderDao: ReminderDao,
    private val apiService: CallPilotApiService
) : ReminderRepository {

    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override fun getAllReminders(): Flow<List<Reminder>> {
        return reminderDao.getAllReminders().map { entities -> entities.map { it.toDomain() } }
    }

    override fun getPendingReminders(): Flow<List<Reminder>> {
        return reminderDao.getPendingReminders().map { entities -> entities.map { it.toDomain() } }
    }

    override fun getUpcomingReminders(limit: Int): Flow<List<Reminder>> {
        return reminderDao.getUpcomingReminders(limit).map { entities -> entities.map { it.toDomain() } }
    }

    override fun getRemindersForContact(contactId: String): Flow<List<Reminder>> {
        return reminderDao.getRemindersForContact(contactId).map { entities -> entities.map { it.toDomain() } }
    }

    override fun getRemindersForCall(callId: String): Flow<List<Reminder>> {
        return reminderDao.getRemindersForCall(callId).map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun getReminderById(id: String): Reminder? {
        return reminderDao.getReminderById(id)?.toDomain()
    }

    override suspend fun insertReminder(reminder: Reminder): String {
        val id = if (reminder.id.isBlank()) UUID.randomUUID().toString() else reminder.id
        val entity = reminder.copy(id = id).toEntity()
        reminderDao.insertReminder(entity)

        try {
            apiService.createReminder(
                CreateReminderRequest(
                    callRecordId = reminder.callRecordId,
                    contactId = reminder.contactId,
                    title = reminder.title,
                    description = reminder.description,
                    dueDateTime = isoFormat.format(reminder.dueDateTime),
                    priority = reminder.priority.name
                )
            )
        } catch (_: Exception) {}

        return id
    }

    override suspend fun updateReminder(reminder: Reminder) {
        reminderDao.updateReminder(reminder.toEntity())
    }

    override suspend fun markCompleted(id: String) {
        reminderDao.markCompleted(id, Date())
        try {
            apiService.completeReminder(id)
        } catch (_: Exception) {}
    }

    override suspend fun snoozeReminder(id: String, newDueTime: Date) {
        reminderDao.snoozeReminder(id, newDueTime)
    }

    override suspend fun dismissReminder(id: String) {
        reminderDao.dismissReminder(id)
    }

    override suspend fun deleteReminder(id: String) {
        reminderDao.deleteReminder(id)
        try {
            apiService.deleteReminder(id)
        } catch (_: Exception) {}
    }

    override suspend fun getActiveRemindersList(): List<Reminder> {
        return reminderDao.getActiveReminders().map { it.toDomain() }
    }

    override suspend fun syncReminders() {
        try {
            val response = apiService.getReminders()
            if (response.isSuccessful && response.body() != null) {
                val remoteReminders = response.body()!!.map { dto ->
                    val dueDate = try { isoFormat.parse(dto.dueDateTime) ?: Date() } catch (_: Exception) { Date() }
                    ReminderEntity(
                        id = dto.id,
                        callRecordId = dto.callRecordId,
                        contactId = dto.contactId,
                        contactName = dto.contactName,
                        contactPhone = dto.contactPhone,
                        title = dto.title,
                        description = dto.description,
                        dueDateTime = dueDate,
                        priority = dto.priority,
                        status = dto.status,
                        isAutoCreated = dto.isAutoCreated,
                        snoozeCount = dto.snoozeCount,
                        isSynced = true
                    )
                }
                reminderDao.insertReminders(remoteReminders)
            }
        } catch (_: Exception) {}
    }

    private fun ReminderEntity.toDomain() = Reminder(
        id = id,
        callRecordId = callRecordId,
        contactId = contactId,
        contactName = contactName,
        contactPhone = contactPhone,
        title = title,
        description = description,
        dueDateTime = dueDateTime,
        priority = try { ReminderPriority.valueOf(priority) } catch (_: Exception) { ReminderPriority.MEDIUM },
        status = try { ReminderStatus.valueOf(status) } catch (_: Exception) { ReminderStatus.PENDING },
        isAutoCreated = isAutoCreated,
        snoozeCount = snoozeCount,
        completedAt = completedAt,
        createdAt = createdAt,
        isSynced = isSynced
    )

    private fun Reminder.toEntity() = ReminderEntity(
        id = id,
        callRecordId = callRecordId,
        contactId = contactId,
        contactName = contactName,
        contactPhone = contactPhone,
        title = title,
        description = description,
        dueDateTime = dueDateTime,
        priority = priority.name,
        status = status.name,
        isAutoCreated = isAutoCreated,
        snoozeCount = snoozeCount,
        completedAt = completedAt,
        createdAt = createdAt,
        isSynced = isSynced
    )
}
