package com.craftn.callpilot.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = AuthUiState(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            val result = authRepository.login(email.trim(), pass)
            result.onSuccess {
                _uiState.value = AuthUiState(isSuccess = true)
            }.onFailure { e ->
                _uiState.value = AuthUiState(error = e.message ?: "Authentication failed")
            }
        }
    }

    fun register(name: String, email: String, pass: String, company: String?) {
        if (name.isBlank() || email.isBlank() || pass.isBlank()) {
            _uiState.value = AuthUiState(error = "Please fill in all required fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            val result = authRepository.register(name.trim(), email.trim(), pass, company?.trim())
            result.onSuccess {
                _uiState.value = AuthUiState(isSuccess = true)
            }.onFailure { e ->
                _uiState.value = AuthUiState(error = e.message ?: "Registration failed")
            }
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState()
    }
}
