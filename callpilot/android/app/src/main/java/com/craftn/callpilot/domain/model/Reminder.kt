package com.craftn.callpilot.domain.model

import java.util.Date

enum class ReminderPriority {
    LOW, MEDIUM, HIGH, URGENT
}

enum class ReminderStatus {
    PENDING, COMPLETED, DISMISSED, SNOOZED
}

data class Reminder(
    val id: String,
    val callRecordId: String? = null,
    val contactId: String? = null,
    val contactName: String? = null,
    val contactPhone: String? = null,
    val title: String,
    val description: String? = null,
    val dueDateTime: Date,
    val priority: ReminderPriority = ReminderPriority.MEDIUM,
    val status: ReminderStatus = ReminderStatus.PENDING,
    val isAutoCreated: Boolean = false,
    val snoozeCount: Int = 0,
    val completedAt: Date? = null,
    val createdAt: Date = Date(),
    val isSynced: Boolean = false
)
