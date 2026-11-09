package com.craftn.callpilot.data.remote.api

import com.craftn.callpilot.data.remote.dto.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface CallPilotApiService {

    // Auth
    @POST("shared/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("shared/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("shared/auth/me")
    suspend fun getProfile(): Response<UserDto>

    // Contacts
    @GET("shared/leads")
    suspend fun getContacts(): Response<List<ContactDto>>

    @GET("shared/leads/{id}")
    suspend fun getContact(@Path("id") id: String): Response<ContactDto>

    @POST("shared/leads")
    suspend fun createContact(@Body request: CreateContactRequest): Response<ContactDto>

    @PUT("shared/leads/{id}")
    suspend fun updateContact(@Path("id") id: String, @Body request: CreateContactRequest): Response<ContactDto>

    @DELETE("shared/leads/{id}")
    suspend fun deleteContact(@Path("id") id: String): Response<Unit>

    // Calls
    @GET("shared/calls")
    suspend fun getCalls(): Response<List<CallRecordDto>>

    @GET("shared/calls/{id}")
    suspend fun getCall(@Path("id") id: String): Response<CallRecordDto>

    @POST("shared/calls")
    suspend fun createCall(@Body request: CreateCallRequest): Response<CallRecordDto>

    @PATCH("shared/calls/{id}")
    suspend fun updateCall(@Path("id") id: String, @Body request: CreateCallRequest): Response<CallRecordDto>

    @Multipart
    @POST("calls/{id}/recording")
    suspend fun uploadRecording(
        @Path("id") id: String,
        @Part audio: MultipartBody.Part
    ): Response<Map<String, String>>

    // AI & Transcription
    @Multipart
    @POST("shared/ai/transcribe")
    suspend fun transcribeAudio(
        @Part audio: MultipartBody.Part,
        @Part("language") language: RequestBody? = null,
        @Part("call_id") callId: RequestBody? = null
    ): Response<TranscriptResponseDto>

    @POST("shared/ai/recap")
    suspend fun generateRecap(
        @Body request: Map<String, String>
    ): Response<RecapResponseDto>

    @POST("shared/ai/follow-up")
    suspend fun generateFollowUp(
        @Body request: FollowUpRequest
    ): Response<FollowUpResponse>

    @POST("shared/ai/assistant")
    suspend fun askAssistant(
        @Body request: AssistantChatRequest
    ): Response<AssistantChatResponse>

    // Reminders
    @GET("shared/reminders")
    suspend fun getReminders(): Response<List<ReminderDto>>

    @POST("shared/reminders")
    suspend fun createReminder(@Body request: CreateReminderRequest): Response<ReminderDto>

    @PUT("shared/reminders/{id}/complete")
    suspend fun completeReminder(@Path("id") id: String): Response<ReminderDto>

    @DELETE("shared/reminders/{id}")
    suspend fun deleteReminder(@Path("id") id: String): Response<Unit>

    // Notes
    @GET("shared/notes")
    suspend fun getNotes(): Response<List<NoteDto>>

    @POST("shared/notes")
    suspend fun createNote(@Body request: CreateNoteRequest): Response<NoteDto>

    @DELETE("shared/notes/{id}")
    suspend fun deleteNote(@Path("id") id: String): Response<Unit>

    // Analytics
    @GET("shared/analytics/summary")
    suspend fun getAnalytics(): Response<AnalyticsResponseDto>
}
