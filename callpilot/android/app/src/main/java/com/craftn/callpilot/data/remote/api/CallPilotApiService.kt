package com.craftn.callpilot.data.remote.api

import com.craftn.callpilot.data.remote.dto.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface CallPilotApiService {

    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getProfile(): Response<UserDto>

    // Contacts
    @GET("contacts")
    suspend fun getContacts(): Response<List<ContactDto>>

    @GET("contacts/{id}")
    suspend fun getContact(@Path("id") id: String): Response<ContactDto>

    @POST("contacts")
    suspend fun createContact(@Body request: CreateContactRequest): Response<ContactDto>

    @PUT("contacts/{id}")
    suspend fun updateContact(@Path("id") id: String, @Body request: CreateContactRequest): Response<ContactDto>

    @DELETE("contacts/{id}")
    suspend fun deleteContact(@Path("id") id: String): Response<Unit>

    // Calls
    @GET("calls")
    suspend fun getCalls(): Response<List<CallRecordDto>>

    @GET("calls/{id}")
    suspend fun getCall(@Path("id") id: String): Response<CallRecordDto>

    @POST("calls")
    suspend fun createCall(@Body request: CreateCallRequest): Response<CallRecordDto>

    @Multipart
    @POST("calls/{id}/recording")
    suspend fun uploadRecording(
        @Path("id") id: String,
        @Part audio: MultipartBody.Part
    ): Response<Map<String, String>>

    // AI & Transcription
    @Multipart
    @POST("ai/transcribe")
    suspend fun transcribeAudio(
        @Part audio: MultipartBody.Part,
        @Part("language") language: RequestBody? = null
    ): Response<TranscriptResponseDto>

    @POST("ai/recap")
    suspend fun generateRecap(
        @Body request: Map<String, String>
    ): Response<RecapResponseDto>

    @POST("ai/follow-up")
    suspend fun generateFollowUp(
        @Body request: FollowUpRequest
    ): Response<FollowUpResponse>

    @POST("ai/assistant")
    suspend fun askAssistant(
        @Body request: AssistantChatRequest
    ): Response<AssistantChatResponse>

    // Reminders
    @GET("reminders")
    suspend fun getReminders(): Response<List<ReminderDto>>

    @POST("reminders")
    suspend fun createReminder(@Body request: CreateReminderRequest): Response<ReminderDto>

    @PUT("reminders/{id}/complete")
    suspend fun completeReminder(@Path("id") id: String): Response<ReminderDto>

    @DELETE("reminders/{id}")
    suspend fun deleteReminder(@Path("id") id: String): Response<Unit>

    // Notes
    @GET("notes")
    suspend fun getNotes(): Response<List<NoteDto>>

    @POST("notes")
    suspend fun createNote(@Body request: CreateNoteRequest): Response<NoteDto>

    @DELETE("notes/{id}")
    suspend fun deleteNote(@Path("id") id: String): Response<Unit>

    // Analytics
    @GET("analytics/summary")
    suspend fun getAnalytics(): Response<AnalyticsResponseDto>
}
