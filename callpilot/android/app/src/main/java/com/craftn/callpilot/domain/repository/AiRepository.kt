package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.ConversationSummary
import com.craftn.callpilot.domain.model.Transcript
import com.craftn.callpilot.domain.model.AIInsight
import com.craftn.callpilot.domain.model.AnalyticsSummary
import java.io.File

interface AiRepository {
    suspend fun transcribeAudio(audioFile: File, language: String? = null): Transcript
    suspend fun generateRecap(transcriptText: String, contactName: String): ConversationSummary
    suspend fun generateFollowUpMessage(callId: String, tone: String = "professional"): String
    suspend fun askAssistant(query: String, conversationContext: String? = null): String
    suspend fun getInsights(): List<AIInsight>
    suspend fun getAnalytics(): AnalyticsSummary
}
