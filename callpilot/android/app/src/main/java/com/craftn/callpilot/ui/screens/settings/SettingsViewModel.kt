package com.craftn.callpilot.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.data.local.datastore.UserPreferencesManager
import com.craftn.callpilot.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val autoRecord: Boolean = false,
    val autoTranscribe: Boolean = true,
    val smartReminders: Boolean = true,
    val userEmail: String = "demo@craftn.ai",
    val userName: String = "Demo User"
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val preferencesManager: UserPreferencesManager,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            preferencesManager.currentUser.collect { user ->
                if (user != null) {
                    _uiState.value = _uiState.value.copy(userEmail = user.email, userName = user.fullName)
                }
            }
        }
    }

    fun toggleAutoRecord(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(autoRecord = enabled)
        viewModelScope.launch {
            preferencesManager.setAutoRecord(enabled)
        }
    }

    fun toggleAutoTranscribe(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(autoTranscribe = enabled)
    }

    fun toggleSmartReminders(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(smartReminders = enabled)
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onLoggedOut()
        }
    }
}
