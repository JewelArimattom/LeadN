package com.craftn.callpilot.data.repository

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.craftn.callpilot.data.local.datastore.UserPreferencesManager
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.LoginRequest
import com.craftn.callpilot.data.remote.dto.RegisterRequest
import com.craftn.callpilot.domain.model.AuthToken
import com.craftn.callpilot.domain.model.User
import com.craftn.callpilot.domain.repository.AuthRepository
import com.craftn.callpilot.service.sync.SyncWorker
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val apiService: CallPilotApiService,
    private val preferencesManager: UserPreferencesManager,
    @ApplicationContext private val context: Context
) : AuthRepository {

    override fun getCurrentUser(): Flow<User?> {
        return preferencesManager.currentUser
    }

    override fun isLoggedIn(): Flow<Boolean> {
        return preferencesManager.isLoggedIn
    }

    override suspend fun login(email: String, password: String): Result<User> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                val token = AuthToken(
                    accessToken = data.token.accessToken,
                    refreshToken = data.token.refreshToken,
                    tokenType = data.token.tokenType,
                    expiresIn = data.token.expiresIn
                )
                val user = User(
                    id = data.user.id,
                    email = data.user.email,
                    fullName = data.user.fullName,
                    company = data.user.company,
                    phone = data.user.phone
                )
                saveAuthData(token, user)
                Result.success(user)
            } else {
                Result.failure(IllegalStateException(response.errorBody()?.string() ?: "Unable to sign in"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(
        name: String,
        email: String,
        password: String,
        company: String?
    ): Result<User> {
        return try {
            val response = apiService.register(RegisterRequest(email, password, name, company))
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                val token = AuthToken(
                    accessToken = data.token.accessToken,
                    refreshToken = data.token.refreshToken
                )
                val user = User(
                    id = data.user.id,
                    email = data.user.email,
                    fullName = data.user.fullName,
                    company = data.user.company
                )
                saveAuthData(token, user)
                Result.success(user)
            } else {
                Result.failure(IllegalStateException(response.errorBody()?.string() ?: "Unable to create account"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun logout() {
        preferencesManager.clearAuth()
    }

    override suspend fun getSavedToken(): String? {
        return preferencesManager.accessToken.firstOrNull()
    }

    override suspend fun saveAuthData(token: AuthToken, user: User) {
        preferencesManager.saveAuthToken(token.accessToken, token.refreshToken)
        preferencesManager.saveUserData(user.id, user.email, user.fullName, user.company)
        val constraints = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val oneTime = OneTimeWorkRequestBuilder<SyncWorker>().setConstraints(constraints).build()
        val periodic = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints).build()
        WorkManager.getInstance(context).enqueueUniqueWork("callpilot_initial_sync", ExistingWorkPolicy.REPLACE, oneTime)
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "callpilot_periodic_sync", ExistingPeriodicWorkPolicy.KEEP, periodic
        )
    }
}
