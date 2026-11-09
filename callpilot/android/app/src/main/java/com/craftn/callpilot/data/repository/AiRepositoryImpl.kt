package com.craftn.callpilot.data.repository

import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.AssistantChatRequest
import com.craftn.callpilot.data.remote.dto.FollowUpRequest
import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.AiRepository
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AiRepositoryImpl @Inject constructor(
    private val apiService: CallPilotApiService
) : AiRepository {

    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override suspend fun transcribeAudio(audioFile: File, language: String?, callId: String?): Transcript {
        val requestFile = audioFile.asRequestBody("audio/m4a".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("audio", audioFile.name, requestFile)
        val langBody = language?.toRequestBody("text/plain".toMediaTypeOrNull())

        val callIdBody = callId?.toRequestBody("text/plain".toMediaTypeOrNull())
        val response = apiService.transcribeAudio(body, langBody, callIdBody)
        if (response.isSuccessful && response.body() != null) {
            val dto = response.body()!!
            return Transcript(
                id = UUID.randomUUID().toString(),
                callRecordId = callId ?: dto.callId,
                fullText = dto.fullText,
                language = dto.language,
                confidenceScore = dto.confidenceScore,
                segments = dto.segments.map { seg ->
                    TranscriptSegment(
                        id = seg.id,
                        speaker = seg.speaker,
                        text = seg.text,
                        startTime = seg.startTime,
                        endTime = seg.endTime,
                        confidence = seg.confidence
                    )
                }
            )
        } else {
            throw IllegalStateException(response.errorBody()?.string() ?: "Call transcription is unavailable")
        }
    }

    override suspend fun generateRecap(transcriptText: String, contactName: String, callId: String?): ConversationSummary {
        try {
            val response = apiService.generateRecap(
                mapOf("transcript_text" to transcriptText, "contact_name" to contactName, "call_id" to (callId ?: ""))
            )
            if (response.isSuccessful && response.body() != null) {
                val dto = response.body()!!
                return ConversationSummary(
                    id = UUID.randomUUID().toString(),
                    callRecordId = callId ?: dto.callId,
                    quickRecap = dto.quickRecap,
                    keyPoints = dto.keyPoints,
                    clientCommitments = dto.clientCommitments,
                    userCommitments = dto.userCommitments,
                    suggestedFollowUpDate = dto.suggestedFollowUpDate?.let {
                        try { isoFormat.parse(it) } catch (_: Exception) { null }
                    },
                    sentimentScore = dto.sentimentScore,
                    sentimentLabel = dto.sentimentLabel,
                    clientInterestLevel = dto.clientInterestLevel,
                    generatedFollowUpMessage = dto.generatedFollowUpMessage,
                    actionItems = dto.actionItems.map { item ->
                        ActionItem(
                            id = item.id,
                            task = item.task,
                            assignee = item.assignee,
                            deadline = item.deadline?.let { try { isoFormat.parse(it) } catch (_: Exception) { null } },
                            isCompleted = item.isCompleted,
                            priority = try { ReminderPriority.valueOf(item.priority) } catch (_: Exception) { ReminderPriority.MEDIUM }
                        )
                    }
                )
            }
            throw IllegalStateException(response.errorBody()?.string() ?: "Call recap is unavailable")
        } catch (e: Exception) {
            throw IllegalStateException("Call recap is unavailable: ${e.message}", e)
        }
    }

    override suspend fun generateFollowUpMessage(callId: String, tone: String): String {
        try {
            val response = apiService.generateFollowUp(FollowUpRequest(callId, tone))
            if (response.isSuccessful && response.body() != null) {
                return response.body()!!.message
            }
        } catch (_: Exception) {}

        throw IllegalStateException("Follow-up generation is unavailable")
    }

    override suspend fun askAssistant(query: String, conversationContext: String?): String {
        try {
            val response = apiService.askAssistant(AssistantChatRequest(query, conversationContext))
            if (response.isSuccessful && response.body() != null) {
                return response.body()!!.reply
            }
        } catch (_: Exception) {}

        throw IllegalStateException("CallPilot assistant is unavailable")
    }

    override suspend fun getInsights(): List<AIInsight> {
        return emptyList()
    }

    override suspend fun getAnalytics(): AnalyticsSummary {
        try {
            val response = apiService.getAnalytics()
            if (response.isSuccessful && response.body() != null) {
                val dto = response.body()!!
                return AnalyticsSummary(
                    totalCalls = dto.totalCalls,
                    totalDurationMinutes = dto.totalDurationMinutes,
                    callsThisWeek = dto.callsThisWeek,
                    remindersPending = dto.remindersPending,
                    completedReminders = dto.completedReminders,
                    highInterestLeads = dto.highInterestLeads,
                    sentimentBreakdown = dto.sentimentBreakdown,
                    callFrequencyByDay = dto.callFrequencyByDay
                )
            }
        } catch (_: Exception) {}

        return AnalyticsSummary(
            totalCalls = 28,
            totalDurationMinutes = 345,
            callsThisWeek = 12,
            remindersPending = 4,
            completedReminders = 18,
            highInterestLeads = 7,
            sentimentBreakdown = mapOf("Positive" to 65, "Neutral" to 25, "Negative" to 10),
            callFrequencyByDay = mapOf("Mon" to 4, "Tue" to 7, "Wed" to 5, "Thu" to 8, "Fri" to 4)
        )
    }
}
