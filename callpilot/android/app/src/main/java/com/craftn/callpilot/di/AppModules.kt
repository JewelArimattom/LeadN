package com.craftn.callpilot.di

import android.content.Context
import androidx.room.Room
import com.craftn.callpilot.BuildConfig
import com.craftn.callpilot.data.local.db.CallPilotDatabase
import com.craftn.callpilot.data.local.db.dao.*
import com.craftn.callpilot.data.local.datastore.UserPreferencesManager
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.interceptors.AuthInterceptor
import com.craftn.callpilot.data.repository.*
import com.craftn.callpilot.domain.repository.*
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): CallPilotDatabase {
        return Room.databaseBuilder(
            context,
            CallPilotDatabase::class.java,
            "callpilot.db"
        )
        .fallbackToDestructiveMigration()
        .build()
    }

    @Provides
    fun provideContactDao(db: CallPilotDatabase): ContactDao = db.contactDao()

    @Provides
    fun provideCallRecordDao(db: CallPilotDatabase): CallRecordDao = db.callRecordDao()

    @Provides
    fun provideReminderDao(db: CallPilotDatabase): ReminderDao = db.reminderDao()

    @Provides
    fun provideNoteDao(db: CallPilotDatabase): NoteDao = db.noteDao()

    @Provides
    fun provideTranscriptDao(db: CallPilotDatabase): TranscriptDao = db.transcriptDao()

    @Provides
    fun provideConversationSummaryDao(db: CallPilotDatabase): ConversationSummaryDao = db.conversationSummaryDao()
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(client: OkHttpClient): CallPilotApiService {
        val baseUrl = try {
            BuildConfig.API_BASE_URL.let { if (it.endsWith("/")) it else "$it/" }
        } catch (_: Exception) {
            "http://10.0.2.2:8000/api/v1/"
        }

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CallPilotApiService::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindContactRepository(impl: ContactRepositoryImpl): ContactRepository

    @Binds
    @Singleton
    abstract fun bindCallRepository(impl: CallRepositoryImpl): CallRepository

    @Binds
    @Singleton
    abstract fun bindReminderRepository(impl: ReminderRepositoryImpl): ReminderRepository

    @Binds
    @Singleton
    abstract fun bindNoteRepository(impl: NoteRepositoryImpl): NoteRepository

    @Binds
    @Singleton
    abstract fun bindAiRepository(impl: AiRepositoryImpl): AiRepository

    @Binds
    @Singleton
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository
}
