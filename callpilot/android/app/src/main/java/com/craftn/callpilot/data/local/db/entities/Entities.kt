package com.craftn.callpilot.data.local.db.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "contacts")
data class ContactEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val phoneNumber: String,
    val email: String? = null,
    val company: String? = null,
    val jobTitle: String? = null,
    val tags: List<String> = emptyList(),
    val totalCalls: Int = 0,
    val lastContactedAt: Date? = null,
    val notesCount: Int = 0,
    val isFavorite: Boolean = false,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val isSynced: Boolean = false
)

@Entity(tableName = "call_records")
data class CallRecordEntity(
    @PrimaryKey
    val id: String,
    val contactId: String? = null,
    val contactName: String,
    val phoneNumber: String,
    val callType: String, // INCOMING, OUTGOING, MISSED
    val source: String,   // AUTO_RECORDED, MANUAL_RECORDED, MANUAL_LOGGED
    val durationSeconds: Int = 0,
    val timestamp: Date = Date(),
    val recordingPath: String? = null,
    val hasRecording: Boolean = false,
    val processingStatus: String = "COMPLETED",
    val summary: String? = null,
    val keyPoints: List<String> = emptyList(),
    val actionItems: List<String> = emptyList(),
    val sentiment: String? = null,
    val clientInterestLevel: String? = null,
    val tags: List<String> = emptyList(),
    val isSynced: Boolean = false
)

@Entity(tableName = "reminders")
data class ReminderEntity(
    @PrimaryKey
    val id: String,
    val callRecordId: String? = null,
    val contactId: String? = null,
    val contactName: String? = null,
    val contactPhone: String? = null,
    val title: String,
    val description: String? = null,
    val dueDateTime: Date,
    val priority: String = "MEDIUM", // LOW, MEDIUM, HIGH, URGENT
    val status: String = "PENDING",   // PENDING, COMPLETED, DISMISSED, SNOOZED
    val isAutoCreated: Boolean = false,
    val snoozeCount: Int = 0,
    val completedAt: Date? = null,
    val createdAt: Date = Date(),
    val isSynced: Boolean = false
)

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey
    val id: String,
    val contactId: String? = null,
    val callRecordId: String? = null,
    val title: String,
    val content: String,
    val tags: List<String> = emptyList(),
    val isPinned: Boolean = false,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val isSynced: Boolean = false
)

@Entity(tableName = "transcripts")
data class TranscriptEntity(
    @PrimaryKey
    val id: String,
    val callRecordId: String,
    val fullText: String,
    val language: String = "en",
    val confidenceScore: Float = 0.95f,
    val segmentsJson: String = "[]",
    val createdAt: Date = Date()
)

@Entity(tableName = "conversation_summaries")
data class ConversationSummaryEntity(
    @PrimaryKey
    val id: String,
    val callRecordId: String,
    val quickRecap: String,
    val keyPoints: List<String> = emptyList(),
    val clientCommitments: List<String> = emptyList(),
    val userCommitments: List<String> = emptyList(),
    val suggestedFollowUpDate: Date? = null,
    val sentimentScore: Float = 0.0f,
    val sentimentLabel: String = "Neutral",
    val clientInterestLevel: String = "Moderate",
    val generatedFollowUpMessage: String? = null,
    val actionItemsJson: String = "[]"
)
