package com.craftn.callpilot.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.craftn.callpilot.data.local.db.converters.Converters
import com.craftn.callpilot.data.local.db.dao.*
import com.craftn.callpilot.data.local.db.entities.*

@Database(
    entities = [
        ContactEntity::class,
        CallRecordEntity::class,
        ReminderEntity::class,
        NoteEntity::class,
        TranscriptEntity::class,
        ConversationSummaryEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class CallPilotDatabase : RoomDatabase() {
    abstract fun contactDao(): ContactDao
    abstract fun callRecordDao(): CallRecordDao
    abstract fun reminderDao(): ReminderDao
    abstract fun noteDao(): NoteDao
    abstract fun transcriptDao(): TranscriptDao
    abstract fun conversationSummaryDao(): ConversationSummaryDao
}
