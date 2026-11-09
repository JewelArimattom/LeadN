package com.craftn.callpilot.data.local.db.dao

import androidx.room.*
import com.craftn.callpilot.data.local.db.entities.*
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface ContactDao {
    @Query("SELECT * FROM contacts ORDER BY name ASC")
    fun getAllContacts(): Flow<List<ContactEntity>>

    @Query("SELECT * FROM contacts WHERE isFavorite = 1 ORDER BY name ASC")
    fun getFavoriteContacts(): Flow<List<ContactEntity>>

    @Query("SELECT * FROM contacts WHERE name LIKE '%' || :query || '%' OR phoneNumber LIKE '%' || :query || '%' OR company LIKE '%' || :query || '%' ORDER BY name ASC")
    fun searchContacts(query: String): Flow<List<ContactEntity>>

    @Query("SELECT * FROM contacts WHERE id = :id")
    suspend fun getContactById(id: String): ContactEntity?

    @Query("SELECT * FROM contacts WHERE phoneNumber = :phone LIMIT 1")
    suspend fun getContactByPhone(phone: String): ContactEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContact(contact: ContactEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContacts(contacts: List<ContactEntity>)

    @Update
    suspend fun updateContact(contact: ContactEntity)

    @Query("UPDATE contacts SET isFavorite = :isFavorite WHERE id = :id")
    suspend fun updateFavorite(id: String, isFavorite: Boolean)

    @Query("DELETE FROM contacts WHERE id = :id")
    suspend fun deleteContact(id: String)
}

@Dao
interface CallRecordDao {
    @Query("SELECT * FROM call_records ORDER BY timestamp DESC")
    fun getAllCalls(): Flow<List<CallRecordEntity>>

    @Query("SELECT * FROM call_records ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentCalls(limit: Int): Flow<List<CallRecordEntity>>

    @Query("SELECT * FROM call_records WHERE contactId = :contactId ORDER BY timestamp DESC")
    fun getCallsForContact(contactId: String): Flow<List<CallRecordEntity>>

    @Query("SELECT * FROM call_records WHERE contactName LIKE '%' || :query || '%' OR phoneNumber LIKE '%' || :query || '%' OR summary LIKE '%' || :query || '%' ORDER BY timestamp DESC")
    fun searchCalls(query: String): Flow<List<CallRecordEntity>>

    @Query("SELECT * FROM call_records WHERE id = :id")
    suspend fun getCallById(id: String): CallRecordEntity?

    @Query("SELECT * FROM call_records WHERE isSynced = 0 ORDER BY timestamp ASC")
    suspend fun getUnsyncedCalls(): List<CallRecordEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCall(call: CallRecordEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCalls(calls: List<CallRecordEntity>)

    @Update
    suspend fun updateCall(call: CallRecordEntity)

    @Query("DELETE FROM call_records WHERE id = :id")
    suspend fun deleteCall(id: String)
}

@Dao
interface ReminderDao {
    @Query("SELECT * FROM reminders ORDER BY dueDateTime ASC")
    fun getAllReminders(): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE status = 'PENDING' OR status = 'SNOOZED' ORDER BY dueDateTime ASC")
    fun getPendingReminders(): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE status = 'PENDING' OR status = 'SNOOZED' ORDER BY dueDateTime ASC LIMIT :limit")
    fun getUpcomingReminders(limit: Int): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE contactId = :contactId ORDER BY dueDateTime ASC")
    fun getRemindersForContact(contactId: String): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE callRecordId = :callId ORDER BY dueDateTime ASC")
    fun getRemindersForCall(callId: String): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE id = :id")
    suspend fun getReminderById(id: String): ReminderEntity?

    @Query("SELECT * FROM reminders WHERE status = 'PENDING' OR status = 'SNOOZED'")
    suspend fun getActiveReminders(): List<ReminderEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: ReminderEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminders(reminders: List<ReminderEntity>)

    @Update
    suspend fun updateReminder(reminder: ReminderEntity)

    @Query("UPDATE reminders SET status = 'COMPLETED', completedAt = :completedAt WHERE id = :id")
    suspend fun markCompleted(id: String, completedAt: Date)

    @Query("UPDATE reminders SET status = 'SNOOZED', dueDateTime = :newDueTime, snoozeCount = snoozeCount + 1 WHERE id = :id")
    suspend fun snoozeReminder(id: String, newDueTime: Date)

    @Query("UPDATE reminders SET status = 'DISMISSED' WHERE id = :id")
    suspend fun dismissReminder(id: String)

    @Query("DELETE FROM reminders WHERE id = :id")
    suspend fun deleteReminder(id: String)
}

@Dao
interface NoteDao {
    @Query("SELECT * FROM notes ORDER BY isPinned DESC, updatedAt DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE isPinned = 1 ORDER BY updatedAt DESC")
    fun getPinnedNotes(): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE contactId = :contactId ORDER BY updatedAt DESC")
    fun getNotesForContact(contactId: String): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE callRecordId = :callId ORDER BY updatedAt DESC")
    fun getNotesForCall(callId: String): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE title LIKE '%' || :query || '%' OR content LIKE '%' || :query || '%' ORDER BY updatedAt DESC")
    fun searchNotes(query: String): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE id = :id")
    suspend fun getNoteById(id: String): NoteEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotes(notes: List<NoteEntity>)

    @Update
    suspend fun updateNote(note: NoteEntity)

    @Query("UPDATE notes SET isPinned = :isPinned WHERE id = :id")
    suspend fun updatePinned(id: String, isPinned: Boolean)

    @Query("DELETE FROM notes WHERE id = :id")
    suspend fun deleteNote(id: String)
}

@Dao
interface TranscriptDao {
    @Query("SELECT * FROM transcripts WHERE callRecordId = :callId LIMIT 1")
    suspend fun getTranscriptForCall(callId: String): TranscriptEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTranscript(transcript: TranscriptEntity)
}

@Dao
interface ConversationSummaryDao {
    @Query("SELECT * FROM conversation_summaries WHERE callRecordId = :callId LIMIT 1")
    suspend fun getSummaryForCall(callId: String): ConversationSummaryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSummary(summary: ConversationSummaryEntity)
}
