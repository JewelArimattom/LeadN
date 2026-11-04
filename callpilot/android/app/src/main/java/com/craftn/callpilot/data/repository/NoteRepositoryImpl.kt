package com.craftn.callpilot.data.repository

import com.craftn.callpilot.data.local.db.dao.NoteDao
import com.craftn.callpilot.data.local.db.entities.NoteEntity
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.CreateNoteRequest
import com.craftn.callpilot.domain.model.Note
import com.craftn.callpilot.domain.repository.NoteRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.Date
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NoteRepositoryImpl @Inject constructor(
    private val noteDao: NoteDao,
    private val apiService: CallPilotApiService
) : NoteRepository {

    override fun getAllNotes(): Flow<List<Note>> {
        return noteDao.getAllNotes().map { entities -> entities.map { it.toDomain() } }
    }

    override fun getPinnedNotes(): Flow<List<Note>> {
        return noteDao.getPinnedNotes().map { entities -> entities.map { it.toDomain() } }
    }

    override fun getNotesForContact(contactId: String): Flow<List<Note>> {
        return noteDao.getNotesForContact(contactId).map { entities -> entities.map { it.toDomain() } }
    }

    override fun getNotesForCall(callId: String): Flow<List<Note>> {
        return noteDao.getNotesForCall(callId).map { entities -> entities.map { it.toDomain() } }
    }

    override fun searchNotes(query: String): Flow<List<Note>> {
        return noteDao.searchNotes(query).map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun getNoteById(id: String): Note? {
        return noteDao.getNoteById(id)?.toDomain()
    }

    override suspend fun insertNote(note: Note): String {
        val id = if (note.id.isBlank()) UUID.randomUUID().toString() else note.id
        val entity = note.copy(id = id).toEntity()
        noteDao.insertNote(entity)

        try {
            apiService.createNote(
                CreateNoteRequest(
                    contactId = note.contactId,
                    callRecordId = note.callRecordId,
                    title = note.title,
                    content = note.content,
                    tags = note.tags,
                    isPinned = note.isPinned
                )
            )
        } catch (_: Exception) {}

        return id
    }

    override suspend fun updateNote(note: Note) {
        noteDao.updateNote(note.toEntity())
    }

    override suspend fun deleteNote(id: String) {
        noteDao.deleteNote(id)
        try {
            apiService.deleteNote(id)
        } catch (_: Exception) {}
    }

    override suspend fun togglePin(id: String, isPinned: Boolean) {
        noteDao.updatePinned(id, isPinned)
    }

    override suspend fun syncNotes() {
        try {
            val response = apiService.getNotes()
            if (response.isSuccessful && response.body() != null) {
                val remoteNotes = response.body()!!.map { dto ->
                    NoteEntity(
                        id = dto.id,
                        contactId = dto.contactId,
                        callRecordId = dto.callRecordId,
                        title = dto.title,
                        content = dto.content,
                        tags = dto.tags,
                        isPinned = dto.isPinned,
                        isSynced = true
                    )
                }
                noteDao.insertNotes(remoteNotes)
            }
        } catch (_: Exception) {}
    }

    private fun NoteEntity.toDomain() = Note(
        id = id,
        contactId = contactId,
        callRecordId = callRecordId,
        title = title,
        content = content,
        tags = tags,
        isPinned = isPinned,
        createdAt = createdAt,
        updatedAt = updatedAt,
        isSynced = isSynced
    )

    private fun Note.toEntity() = NoteEntity(
        id = id,
        contactId = contactId,
        callRecordId = callRecordId,
        title = title,
        content = content,
        tags = tags,
        isPinned = isPinned,
        createdAt = createdAt,
        updatedAt = updatedAt,
        isSynced = isSynced
    )
}
