package com.craftn.callpilot.data.repository

import com.craftn.callpilot.data.local.db.dao.CallRecordDao
import com.craftn.callpilot.data.local.db.dao.ConversationSummaryDao
import com.craftn.callpilot.data.local.db.dao.TranscriptDao
import com.craftn.callpilot.data.local.db.entities.CallRecordEntity
import com.craftn.callpilot.data.local.db.entities.ConversationSummaryEntity
import com.craftn.callpilot.data.local.db.entities.TranscriptEntity
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.CreateCallRequest
import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.CallRepository
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.util.UUID
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallRepositoryImpl @Inject constructor(
    private val callDao: CallRecordDao,
    private val transcriptDao: TranscriptDao,
    private val summaryDao: ConversationSummaryDao,
    private val apiService: CallPilotApiService
) : CallRepository {

    private val gson = Gson()
    private val timestampFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override fun getAllCalls(): Flow<List<CallRecord>> {
        return callDao.getAllCalls().map { entities -> entities.map { it.toDomain() } }
    }

    override fun getRecentCalls(limit: Int): Flow<List<CallRecord>> {
        return callDao.getRecentCalls(limit).map { entities -> entities.map { it.toDomain() } }
    }

    override fun getCallsForContact(contactId: String): Flow<List<CallRecord>> {
        return callDao.getCallsForContact(contactId).map { entities -> entities.map { it.toDomain() } }
    }

    override fun searchCalls(query: String): Flow<List<CallRecord>> {
        return callDao.searchCalls(query).map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun getCallById(id: String): CallRecord? {
        return callDao.getCallById(id)?.toDomain()
    }

    override suspend fun insertCall(call: CallRecord): String {
        val id = if (call.id.isBlank()) UUID.randomUUID().toString() else call.id
        val entity = call.copy(id = id).toEntity()
        callDao.insertCall(entity)

        try {
            val response = apiService.createCall(
                CreateCallRequest(
                    clientCallId = id,
                    contactId = call.contactId,
                    contactName = call.contactName,
                    phoneNumber = call.phoneNumber,
                    callType = call.callType.name,
                    source = call.source.name,
                    durationSeconds = call.durationSeconds,
                    notes = call.summary,
                    timestamp = timestampFormat.format(call.timestamp)
                )
            )
            if (response.isSuccessful) callDao.updateCall(entity.copy(isSynced = true))
        } catch (_: Exception) {}

        return id
    }

    override suspend fun updateCall(call: CallRecord) {
        val entity = call.toEntity()
        callDao.updateCall(entity)
        try {
            val response = apiService.updateCall(
                call.id,
                CreateCallRequest(
                    clientCallId = call.id,
                    contactId = call.contactId,
                    contactName = call.contactName,
                    phoneNumber = call.phoneNumber,
                    callType = call.callType.name,
                    source = call.source.name,
                    durationSeconds = call.durationSeconds,
                    notes = call.summary,
                    timestamp = timestampFormat.format(call.timestamp)
                )
            )
            if (response.isSuccessful) callDao.updateCall(entity.copy(isSynced = true))
        } catch (_: Exception) {}
    }

    override suspend fun deleteCall(id: String) {
        callDao.deleteCall(id)
    }

    override suspend fun uploadRecording(callId: String, audioFile: File): String {
        val requestFile = audioFile.asRequestBody("audio/m4a".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("audio", audioFile.name, requestFile)
        val response = apiService.uploadRecording(callId, body)
        return response.body()?.get("url") ?: audioFile.absolutePath
    }

    override suspend fun getTranscript(callId: String): Transcript? {
        val entity = transcriptDao.getTranscriptForCall(callId) ?: return null
        val segmentType = object : TypeToken<List<TranscriptSegment>>() {}.type
        val segments: List<TranscriptSegment> = gson.fromJson(entity.segmentsJson, segmentType) ?: emptyList()
        return Transcript(
            id = entity.id,
            callRecordId = entity.callRecordId,
            fullText = entity.fullText,
            language = entity.language,
            confidenceScore = entity.confidenceScore,
            segments = segments,
            createdAt = entity.createdAt
        )
    }

    override suspend fun getSummary(callId: String): ConversationSummary? {
        val entity = summaryDao.getSummaryForCall(callId) ?: return null
        val actionType = object : TypeToken<List<ActionItem>>() {}.type
        val actions: List<ActionItem> = gson.fromJson(entity.actionItemsJson, actionType) ?: emptyList()
        return ConversationSummary(
            id = entity.id,
            callRecordId = entity.callRecordId,
            quickRecap = entity.quickRecap,
            keyPoints = entity.keyPoints,
            clientCommitments = entity.clientCommitments,
            userCommitments = entity.userCommitments,
            suggestedFollowUpDate = entity.suggestedFollowUpDate,
            sentimentScore = entity.sentimentScore,
            sentimentLabel = entity.sentimentLabel,
            clientInterestLevel = entity.clientInterestLevel,
            generatedFollowUpMessage = entity.generatedFollowUpMessage,
            actionItems = actions
        )
    }

    override suspend fun saveTranscript(transcript: Transcript) {
        transcriptDao.insertTranscript(
            TranscriptEntity(
                id = transcript.id,
                callRecordId = transcript.callRecordId,
                fullText = transcript.fullText,
                language = transcript.language,
                confidenceScore = transcript.confidenceScore,
                segmentsJson = gson.toJson(transcript.segments),
                createdAt = transcript.createdAt
            )
        )
    }

    override suspend fun saveSummary(summary: ConversationSummary) {
        summaryDao.insertSummary(
            ConversationSummaryEntity(
                id = summary.id,
                callRecordId = summary.callRecordId,
                quickRecap = summary.quickRecap,
                keyPoints = summary.keyPoints,
                clientCommitments = summary.clientCommitments,
                userCommitments = summary.userCommitments,
                suggestedFollowUpDate = summary.suggestedFollowUpDate,
                sentimentScore = summary.sentimentScore,
                sentimentLabel = summary.sentimentLabel,
                clientInterestLevel = summary.clientInterestLevel,
                generatedFollowUpMessage = summary.generatedFollowUpMessage,
                actionItemsJson = gson.toJson(summary.actionItems)
            )
        )
    }

    override suspend fun syncCalls() {
        try {
            callDao.getUnsyncedCalls().forEach { pending ->
                val response = apiService.createCall(
                    CreateCallRequest(
                        clientCallId = pending.id,
                        contactId = pending.contactId,
                        contactName = pending.contactName,
                        phoneNumber = pending.phoneNumber,
                        callType = pending.callType,
                        source = pending.source,
                        durationSeconds = pending.durationSeconds,
                        notes = pending.summary,
                        timestamp = timestampFormat.format(pending.timestamp)
                    )
                )
                if (response.isSuccessful) callDao.updateCall(pending.copy(isSynced = true))
            }
            val response = apiService.getCalls()
            if (response.isSuccessful && response.body() != null) {
                val remoteCalls = response.body()!!.map { dto ->
                    CallRecordEntity(
                        id = dto.id,
                        contactId = dto.contactId,
                        contactName = dto.contactName,
                        phoneNumber = dto.phoneNumber,
                        callType = dto.callType,
                        source = dto.source,
                        durationSeconds = dto.durationSeconds,
                        timestamp = try { java.util.Date.from(java.time.Instant.parse(dto.timestamp)) } catch (_: Exception) { java.util.Date() },
                        recordingPath = dto.recordingPath,
                        hasRecording = dto.hasRecording,
                        processingStatus = dto.processingStatus,
                        summary = dto.summary,
                        keyPoints = dto.keyPoints,
                        actionItems = dto.actionItems,
                        sentiment = dto.sentiment,
                        clientInterestLevel = dto.clientInterestLevel,
                        tags = dto.tags,
                        isSynced = true
                    )
                }
                callDao.insertCalls(remoteCalls)
            }
        } catch (_: Exception) {}
    }

    private fun CallRecordEntity.toDomain() = CallRecord(
        id = id,
        contactId = contactId,
        contactName = contactName,
        phoneNumber = phoneNumber,
        callType = try { CallType.valueOf(callType) } catch (_: Exception) { CallType.INCOMING },
        source = try { CallSource.valueOf(source) } catch (_: Exception) { CallSource.MANUAL_LOGGED },
        durationSeconds = durationSeconds,
        timestamp = timestamp,
        recordingPath = recordingPath,
        hasRecording = hasRecording,
        processingStatus = try { ProcessingStatus.valueOf(processingStatus) } catch (_: Exception) { ProcessingStatus.COMPLETED },
        summary = summary,
        keyPoints = keyPoints,
        actionItems = actionItems,
        sentiment = sentiment,
        clientInterestLevel = clientInterestLevel,
        tags = tags,
        isSynced = isSynced
    )

    private fun CallRecord.toEntity() = CallRecordEntity(
        id = id,
        contactId = contactId,
        contactName = contactName,
        phoneNumber = phoneNumber,
        callType = callType.name,
        source = source.name,
        durationSeconds = durationSeconds,
        timestamp = timestamp,
        recordingPath = recordingPath,
        hasRecording = hasRecording,
        processingStatus = processingStatus.name,
        summary = summary,
        keyPoints = keyPoints,
        actionItems = actionItems,
        sentiment = sentiment,
        clientInterestLevel = clientInterestLevel,
        tags = tags,
        isSynced = isSynced
    )
}
