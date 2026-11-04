package com.craftn.callpilot.data.local.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "callpilot_prefs")

@Singleton
class UserPreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token")
        val KEY_USER_ID = stringPreferencesKey("user_id")
        val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_USER_COMPANY = stringPreferencesKey("user_company")
        val KEY_AUTO_RECORD = booleanPreferencesKey("auto_record")
        val KEY_AUTO_TRANSCRIBE = booleanPreferencesKey("auto_transcribe")
        val KEY_AI_RECUP_ENABLED = booleanPreferencesKey("ai_recap_enabled")
        val KEY_SMART_REMINDERS = booleanPreferencesKey("smart_reminders")
        val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val KEY_DARK_MODE = booleanPreferencesKey("dark_mode")
    }

    val accessToken: Flow<String?> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { preferences -> preferences[KEY_ACCESS_TOKEN] }

    val isLoggedIn: Flow<Boolean> = accessToken.map { !it.isNullOrBlank() }

    val isOnboardingCompleted: Flow<Boolean> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { preferences -> preferences[KEY_ONBOARDING_COMPLETED] ?: false }

    val autoRecordEnabled: Flow<Boolean> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { preferences -> preferences[KEY_AUTO_RECORD] ?: false }

    suspend fun saveAuthToken(accessToken: String, refreshToken: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_ACCESS_TOKEN] = accessToken
            preferences[KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun saveUserData(id: String, email: String, name: String, company: String?) {
        context.dataStore.edit { preferences ->
            preferences[KEY_USER_ID] = id
            preferences[KEY_USER_EMAIL] = email
            preferences[KEY_USER_NAME] = name
            company?.let { preferences[KEY_USER_COMPANY] = it }
        }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setAutoRecord(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_AUTO_RECORD] = enabled
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit { preferences ->
            preferences.remove(KEY_ACCESS_TOKEN)
            preferences.remove(KEY_REFRESH_TOKEN)
            preferences.remove(KEY_USER_ID)
            preferences.remove(KEY_USER_EMAIL)
            preferences.remove(KEY_USER_NAME)
            preferences.remove(KEY_USER_COMPANY)
        }
    }
}
