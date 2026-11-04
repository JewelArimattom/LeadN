package com.craftn.callpilot.data.remote.dto

import com.google.gson.annotations.SerializedName

// Auth
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val fullName: String,
    val company: String? = null
)

data class AuthResponse(
    val token: TokenDto,
    val user: UserDto
)

data class TokenDto(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String,
    @SerializedName("token_type") val tokenType: String = "bearer",
    @SerializedName("expires_in") val expiresIn: Long = 86400
)

data class UserDto(
    val id: String,
    val email: String,
    @SerializedName("full_name") val fullName: String,
    val company: String? = null,
    val phone: String? = null
)

// Contacts
data class ContactDto(
    val id: String,
    val name: String,
    @SerializedName("phone_number") val phoneNumber: String,
    val email: String? = null,
    val company: String? = null,
    @SerializedName("job_title") val jobTitle: String? = null,
    val tags: List<String> = emptyList(),
    @SerializedName("total_calls") val totalCalls: Int = 0,
    @SerializedName("is_favorite") val isFavorite: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null
)

data class CreateContactRequest(
    val name: String,
    @SerializedName("phone_number") val phoneNumber: String,
    val email: String? = null,
    val company: String? = null,
    @SerializedName("job_title") val jobTitle: String? = null,
    val tags: List<String> = emptyList()
)

// Calls
data class CallRecordDto(
    val id: String,
    @SerializedName("contact_id") val contactId: String? = null,
    @SerializedName("contact_name") val contactName: String,
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("call_type") val callType: String,
    val source: String,
    @SerializedName("duration_seconds") val durationSeconds: Int,
    val timestamp: String,
    @SerializedName("recording_path") val recordingPath: String? = null,
    @SerializedName("has_recording") val hasRecording: Boolean = false,
    @SerializedName("processing_status") val processingStatus: String = "COMPLETED",
    val summary: String? = null,
    @SerializedName("key_points") val keyPoints: List<String> = emptyList(),
    @SerializedName("action_items") val actionItems: List<String> = emptyList(),
    val sentiment: String? = null,
    @SerializedName("client_interest_level") val clientInterestLevel: String? = null,
    val tags: List<String> = emptyList()
)

data class CreateCallRequest(
    @SerializedName("contact_id") val contactId: String? = null,
    @SerializedName("contact_name") val contactName: String,
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("call_type") val callType: String,
    val source: String = "MANUAL_LOGGED",
    @SerializedName("duration_seconds") val durationSeconds: Int = 0,
    val notes: String? = null
)

// Reminders
data class ReminderDto(
    val id: String,
    @SerializedName("call_record_id") val callRecordId: String? = null,
    @SerializedName("contact_id") val contactId: String? = null,
    @SerializedName("contact_name") val contactName: String? = null,
    @SerializedName("contact_phone") val contactPhone: String? = null,
    val title: String,
    val description: String? = null,
    @SerializedName("due_date_time") val dueDateTime: String,
    val priority: String = "MEDIUM",
    val status: String = "PENDING",
    @SerializedName("is_auto_created") val isAutoCreated: Boolean = false,
    @SerializedName("snooze_count") val snoozeCount: Int = 0
)

data class CreateReminderRequest(
    @SerializedName("call_record_id") val callRecordId: String? = null,
    @SerializedName("contact_id") val contactId: String? = null,
    val title: String,
    val description: String? = null,
    @SerializedName("due_date_time") val dueDateTime: String,
    val priority: String = "MEDIUM"
)

// Notes
data class NoteDto(
    val id: String,
    @SerializedName("contact_id") val contactId: String? = null,
    @SerializedName("call_record_id") val callRecordId: String? = null,
    val title: String,
    val content: String,
    val tags: List<String> = emptyList(),
    @SerializedName("is_pinned") val isPinned: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null
)

data class CreateNoteRequest(
    @SerializedName("contact_id") val contactId: String? = null,
    @SerializedName("call_record_id") val callRecordId: String? = null,
    val title: String,
    val content: String,
    val tags: List<String> = emptyList(),
    @SerializedName("is_pinned") val isPinned: Boolean = false
)

// AI & Transcription
data class TranscriptSegmentDto(
    val id: String,
    val speaker: String,
    val text: String,
    @SerializedName("start_time") val startTime: Float,
    @SerializedName("end_time") val endTime: Float,
    val confidence: Float = 0.95f
)

data class TranscriptResponseDto(
    @SerializedName("call_id") val callId: String,
    @SerializedName("full_text") val fullText: String,
    val language: String = "en",
    @SerializedName("confidence_score") val confidenceScore: Float = 0.95f,
    val segments: List<TranscriptSegmentDto> = emptyList()
)

data class ActionItemDto(
    val id: String,
    val task: String,
    val assignee: String? = null,
    val deadline: String? = null,
    @SerializedName("is_completed") val isCompleted: Boolean = false,
    val priority: String = "MEDIUM"
)

data class RecapResponseDto(
    @SerializedName("call_id") val callId: String,
    @SerializedName("quick_recap") val quickRecap: String,
    @SerializedName("key_points") val keyPoints: List<String> = emptyList(),
    @SerializedName("client_commitments") val clientCommitments: List<String> = emptyList(),
    @SerializedName("user_commitments") val userCommitments: List<String> = emptyList(),
    @SerializedName("suggested_follow_up_date") val suggestedFollowUpDate: String? = null,
    @SerializedName("sentiment_score") val sentimentScore: Float = 0.0f,
    @SerializedName("sentiment_label") val sentimentLabel: String = "Neutral",
    @SerializedName("client_interest_level") val clientInterestLevel: String = "Moderate",
    @SerializedName("generated_follow_up_message") val generatedFollowUpMessage: String? = null,
    @SerializedName("action_items") val actionItems: List<ActionItemDto> = emptyList()
)

data class AssistantChatRequest(
    val message: String,
    @SerializedName("conversation_context") val conversationContext: String? = null
)

data class AssistantChatResponse(
    val reply: String,
    @SerializedName("suggested_actions") val suggestedActions: List<String> = emptyList()
)

data class FollowUpRequest(
    @SerializedName("call_id") val callId: String,
    val tone: String = "professional"
)

data class FollowUpResponse(
    val message: String
)

data class AnalyticsResponseDto(
    @SerializedName("total_calls") val totalCalls: Int = 0,
    @SerializedName("total_duration_minutes") val totalDurationMinutes: Int = 0,
    @SerializedName("calls_this_week") val callsThisWeek: Int = 0,
    @SerializedName("reminders_pending") val remindersPending: Int = 0,
    @SerializedName("completed_reminders") val completedReminders: Int = 0,
    @SerializedName("high_interest_leads") val highInterestLeads: Int = 0,
    @SerializedName("sentiment_breakdown") val sentimentBreakdown: Map<String, Int> = emptyMap(),
    @SerializedName("call_frequency_by_day") val callFrequencyByDay: Map<String, Int> = emptyMap()
)
