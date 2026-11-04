package com.craftn.callpilot.domain.model

import java.util.Date

data class Note(
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

data class TranscriptSegment(
    val id: String,
    val speaker: String,
    val text: String,
    val startTime: Float,
    val endTime: Float,
    val confidence: Float = 0.95f
)

data class Transcript(
    val id: String,
    val callRecordId: String,
    val fullText: String,
    val language: String = "en",
    val confidenceScore: Float = 0.92f,
    val segments: List<TranscriptSegment> = emptyList(),
    val createdAt: Date = Date()
)

data class ActionItem(
    val id: String,
    val task: String,
    val assignee: String? = null,
    val deadline: Date? = null,
    val isCompleted: Boolean = false,
    val priority: ReminderPriority = ReminderPriority.MEDIUM
)

data class ConversationSummary(
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
    val actionItems: List<ActionItem> = emptyList()
)

data class AIInsight(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val actionUrl: String? = null,
    val priority: String = "NORMAL",
    val createdAt: Date = Date()
)

data class AnalyticsSummary(
    val totalCalls: Int = 0,
    val totalDurationMinutes: Int = 0,
    val callsThisWeek: Int = 0,
    val remindersPending: Int = 0,
    val completedReminders: Int = 0,
    val highInterestLeads: Int = 0,
    val sentimentBreakdown: Map<String, Int> = emptyMap(),
    val callFrequencyByDay: Map<String, Int> = emptyMap()
)
