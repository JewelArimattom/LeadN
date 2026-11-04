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
import kotlinx.coroutines.launch
import java.io.File
import java.util.*
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

    fun startRecording(contactName: String, phone: String) {
        currentContactName = contactName.ifBlank { "Client" }
        currentPhoneNumber = phone
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
            val callId = UUID.randomUUID().toString()
            val newCall = CallRecord(
                id = callId,
                contactName = currentContactName,
                phoneNumber = currentPhoneNumber.ifBlank { "+1 555-0199" },
                callType = CallType.OUTGOING,
                source = CallSource.MANUAL_RECORDED,
                durationSeconds = duration,
                hasRecording = true,
                recordingPath = file?.absolutePath
            )
            callRepository.insertCall(newCall)

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
