package com.craftn.callpilot.domain.usecase

import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import java.io.File
import java.util.*
import javax.inject.Inject

data class DashboardState(
    val recentCalls: List<CallRecord> = emptyList(),
    val pendingReminders: List<Reminder> = emptyList(),
    val pinnedNotes: List<Note> = emptyList(),
    val insights: List<AIInsight> = emptyList(),
    val analytics: AnalyticsSummary = AnalyticsSummary()
)

class GetDashboardDataUseCase @Inject constructor(
    private val callRepository: CallRepository,
    private val reminderRepository: ReminderRepository,
    private val noteRepository: NoteRepository,
    private val aiRepository: AiRepository
) {
    operator fun invoke(): Flow<DashboardState> {
        return combine(
            callRepository.getRecentCalls(5),
            reminderRepository.getUpcomingReminders(5),
            noteRepository.getPinnedNotes()
        ) { calls, reminders, notes ->
            DashboardState(
                recentCalls = calls,
                pendingReminders = reminders,
                pinnedNotes = notes
            )
        }
    }
}

class ProcessCallRecordingUseCase @Inject constructor(
    private val callRepository: CallRepository,
    private val aiRepository: AiRepository,
    private val reminderRepository: ReminderRepository
) {
    suspend operator fun invoke(callId: String, audioFile: File, contactName: String): Result<ConversationSummary> {
        return try {
            // 1. Upload audio / Transcribe
            val transcript = aiRepository.transcribeAudio(audioFile)
            val updatedTranscript = transcript.copy(callRecordId = callId)
            callRepository.saveTranscript(updatedTranscript)

            // 2. Generate AI Recap
            val summary = aiRepository.generateRecap(updatedTranscript.fullText, contactName)
            val updatedSummary = summary.copy(callRecordId = callId)
            callRepository.saveSummary(updatedSummary)

            // 3. Create reminders from action items automatically
            updatedSummary.actionItems.forEach { action ->
                if (action.deadline != null) {
                    val reminder = Reminder(
                        id = UUID.randomUUID().toString(),
                        callRecordId = callId,
                        title = action.task,
                        description = "Action item extracted by CallPilot AI from conversation with $contactName",
                        dueDateTime = action.deadline,
                        priority = action.priority,
                        isAutoCreated = true
                    )
                    reminderRepository.insertReminder(reminder)
                }
            }

            // 4. Update Call Record with summary and sentiment
            val existingCall = callRepository.getCallById(callId)
            if (existingCall != null) {
                callRepository.updateCall(
                    existingCall.copy(
                        summary = updatedSummary.quickRecap,
                        keyPoints = updatedSummary.keyPoints,
                        actionItems = updatedSummary.actionItems.map { it.task },
                        sentiment = updatedSummary.sentimentLabel,
                        clientInterestLevel = updatedSummary.clientInterestLevel,
                        processingStatus = ProcessingStatus.COMPLETED
                    )
                )
            }

            Result.success(updatedSummary)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
