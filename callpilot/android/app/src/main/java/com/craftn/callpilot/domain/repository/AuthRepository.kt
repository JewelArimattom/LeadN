package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.AuthToken
import com.craftn.callpilot.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    fun getCurrentUser(): Flow<User?>
    fun isLoggedIn(): Flow<Boolean>
    suspend fun login(email: String, password: String): Result<User>
    suspend fun register(name: String, email: String, password: String, company: String? = null): Result<User>
    suspend fun logout()
    suspend fun getSavedToken(): String?
    suspend fun saveAuthData(token: AuthToken, user: User)
}
