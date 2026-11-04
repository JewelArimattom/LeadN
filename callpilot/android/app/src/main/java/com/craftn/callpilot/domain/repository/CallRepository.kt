package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.CallRecord
import com.craftn.callpilot.domain.model.Transcript
import com.craftn.callpilot.domain.model.ConversationSummary
import kotlinx.coroutines.flow.Flow
import java.io.File

interface CallRepository {
    fun getAllCalls(): Flow<List<CallRecord>>
    fun getRecentCalls(limit: Int = 10): Flow<List<CallRecord>>
    fun getCallsForContact(contactId: String): Flow<List<CallRecord>>
    fun searchCalls(query: String): Flow<List<CallRecord>>
    suspend fun getCallById(id: String): CallRecord?
    suspend fun insertCall(call: CallRecord): String
    suspend fun updateCall(call: CallRecord)
    suspend fun deleteCall(id: String)
    suspend fun uploadRecording(callId: String, audioFile: File): String
    suspend fun getTranscript(callId: String): Transcript?
    suspend fun getSummary(callId: String): ConversationSummary?
    suspend fun saveTranscript(transcript: Transcript)
    suspend fun saveSummary(summary: ConversationSummary)
    suspend fun syncCalls()
}
