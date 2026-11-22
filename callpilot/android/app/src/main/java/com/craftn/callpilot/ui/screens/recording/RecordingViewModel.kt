package com.craftn.callpilot.ui.screens.recording

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.model.CallRecord
import com.craftn.callpilot.domain.model.CallSource
import com.craftn.callpilot.domain.model.CallType
import com.craftn.callpilot.domain.model.ConversationSummary
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.usecase.ProcessCallRecordingUseCase
import com.craftn.callpilot.service.recording.AudioRecorder
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File
import java.util.*
import kotlin.math.abs
import javax.inject.Inject

enum class RecordingState {
    IDLE, RECORDING, PROCESSING, FINISHED
}

data class RecordingUiState(
    val state: RecordingState = RecordingState.IDLE,
    val durationSeconds: Int = 0,
    val amplitudes: List<Float> = emptyList(),
    val processingMessage: String = "",
    val generatedSummary: ConversationSummary? = null,
    val error: String? = null,
    val callId: String? = null
)

@HiltViewModel
class RecordingViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val callRepository: CallRepository,
    private val processCallRecordingUseCase: ProcessCallRecordingUseCase
) : ViewModel() {

    private val audioRecorder = AudioRecorder(context)
    private val _uiState = MutableStateFlow(RecordingUiState())
    val uiState: StateFlow<RecordingUiState> = _uiState.asStateFlow()

    private var currentFile: File? = null
    private var currentContactName: String = "Client"
    private var currentPhoneNumber: String = ""
    private var currentCallType: CallType = CallType.OUTGOING

    init {
        viewModelScope.launch {
            audioRecorder.amplitudes.collect { list ->
                if (_uiState.value.state == RecordingState.RECORDING) {
                    _uiState.value = _uiState.value.copy(amplitudes = list)
                }
            }
        }
        viewModelScope.launch {
            audioRecorder.recordingDurationSeconds.collect { secs ->
                if (_uiState.value.state == RecordingState.RECORDING) {
                    _uiState.value = _uiState.value.copy(durationSeconds = secs)
                }
            }
        }
    }

    fun startRecording(contactName: String, phone: String, callTypeName: String = "OUTGOING") {
        currentContactName = contactName.ifBlank { "Client" }
        currentPhoneNumber = phone
        currentCallType = try { CallType.valueOf(callTypeName) } catch (_: Exception) { CallType.OUTGOING }
        val cacheDir = context.cacheDir
        val audioFile = File(cacheDir, "recording_${System.currentTimeMillis()}.m4a")
        currentFile = audioFile

        audioRecorder.startRecording(audioFile)
        _uiState.value = RecordingUiState(state = RecordingState.RECORDING)
    }

    fun stopRecording() {
        val file = audioRecorder.stopRecording()
        val duration = _uiState.value.durationSeconds

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                state = RecordingState.PROCESSING,
                processingMessage = "Transcribing conversation audio..."
            )

            // Save preliminary call record
            val digits = currentPhoneNumber.filter(Char::isDigit)
            val nearbyCall = if (digits.isBlank()) null else callRepository.getAllCalls().first()
                .filter { call ->
                    call.callType == currentCallType &&
                        call.phoneNumber.filter(Char::isDigit) == digits &&
                        abs(call.timestamp.time - System.currentTimeMillis()) <= 10 * 60 * 1000
                }
                .minByOrNull { abs(it.timestamp.time - System.currentTimeMillis()) }
            val callId = nearbyCall?.id ?: UUID.randomUUID().toString()
            val savedCall = (nearbyCall ?: CallRecord(
                id = callId,
                contactName = currentContactName,
                phoneNumber = currentPhoneNumber,
                callType = currentCallType,
                source = CallSource.MANUAL_RECORDED,
                durationSeconds = duration
            )).copy(
                contactName = currentContactName,
                phoneNumber = currentPhoneNumber,
                source = CallSource.MANUAL_RECORDED,
                durationSeconds = duration,
                hasRecording = true,
                recordingPath = file?.absolutePath
            )
            if (nearbyCall == null) callRepository.insertCall(savedCall) else callRepository.updateCall(savedCall)

            if (file != null && file.exists()) {
                val result = processCallRecordingUseCase(callId, file, currentContactName)
                result.onSuccess { summary ->
                    _uiState.value = _uiState.value.copy(
                        state = RecordingState.FINISHED,
                        generatedSummary = summary,
                        callId = callId
                    )
                }.onFailure { err ->
                    _uiState.value = _uiState.value.copy(
                        state = RecordingState.FINISHED,
                        callId = callId,
                        error = err.message
                    )
                }
            } else {
                _uiState.value = _uiState.value.copy(
                    state = RecordingState.FINISHED,
                    callId = callId
                )
            }
        }
    }
}
