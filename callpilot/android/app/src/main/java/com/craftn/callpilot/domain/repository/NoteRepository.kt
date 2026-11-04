package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.Note
import kotlinx.coroutines.flow.Flow

interface NoteRepository {
    fun getAllNotes(): Flow<List<Note>>
    fun getPinnedNotes(): Flow<List<Note>>
    fun getNotesForContact(contactId: String): Flow<List<Note>>
    fun getNotesForCall(callId: String): Flow<List<Note>>
    fun searchNotes(query: String): Flow<List<Note>>
    suspend fun getNoteById(id: String): Note?
    suspend fun insertNote(note: Note): String
    suspend fun updateNote(note: Note)
    suspend fun deleteNote(id: String)
    suspend fun togglePin(id: String, isPinned: Boolean)
    suspend fun syncNotes()
}
