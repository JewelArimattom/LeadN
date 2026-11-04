package com.craftn.callpilot.domain.model

import java.util.Date

enum class CallType {
    INCOMING, OUTGOING, MISSED
}

enum class CallSource {
    AUTO_RECORDED, MANUAL_RECORDED, MANUAL_LOGGED
}

enum class ProcessingStatus {
    PENDING, PROCESSING, COMPLETED, FAILED
}

data class CallRecord(
    val id: String,
    val contactId: String? = null,
    val contactName: String,
    val phoneNumber: String,
    val callType: CallType,
    val source: CallSource = CallSource.MANUAL_LOGGED,
    val durationSeconds: Int = 0,
    val timestamp: Date = Date(),
    val recordingPath: String? = null,
    val hasRecording: Boolean = false,
    val processingStatus: ProcessingStatus = ProcessingStatus.COMPLETED,
    val summary: String? = null,
    val keyPoints: List<String> = emptyList(),
    val actionItems: List<String> = emptyList(),
    val sentiment: String? = null,
    val clientInterestLevel: String? = null,
    val tags: List<String> = emptyList(),
    val isSynced: Boolean = false
)
