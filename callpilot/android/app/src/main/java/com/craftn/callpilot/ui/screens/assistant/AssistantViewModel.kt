package com.craftn.callpilot.ui.screens.assistant

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.repository.AiRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: Date = Date()
)

data class AssistantUiState(
    val messages: List<ChatMessage> = listOf(
        ChatMessage(
            text = "Hello! I am CallPilot AI, your conversational assistant. I analyze your calls, highlight pending client promises, and help you draft follow-up messages. How can I help today?",
            isUser = false
        )
    ),
    val isTyping: Boolean = false
)

@HiltViewModel
class AssistantViewModel @Inject constructor(
    private val aiRepository: AiRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AssistantUiState())
    val uiState: StateFlow<AssistantUiState> = _uiState.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMsg = ChatMessage(text = text.trim(), isUser = true)
        val currentList = _uiState.value.messages.toMutableList().apply { add(userMsg) }
        _uiState.value = _uiState.value.copy(messages = currentList, isTyping = true)

        viewModelScope.launch {
            val replyText = aiRepository.askAssistant(text.trim())
            val aiMsg = ChatMessage(text = replyText, isUser = false)
            val updated = _uiState.value.messages.toMutableList().apply { add(aiMsg) }
            _uiState.value = _uiState.value.copy(messages = updated, isTyping = false)
        }
    }
}
