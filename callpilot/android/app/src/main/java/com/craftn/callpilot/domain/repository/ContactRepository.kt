package com.craftn.callpilot.domain.repository

import com.craftn.callpilot.domain.model.Contact
import kotlinx.coroutines.flow.Flow

interface ContactRepository {
    fun getAllContacts(): Flow<List<Contact>>
    fun getFavoriteContacts(): Flow<List<Contact>>
    fun searchContacts(query: String): Flow<List<Contact>>
    suspend fun getContactById(id: String): Contact?
    suspend fun getContactByPhone(phone: String): Contact?
    suspend fun insertContact(contact: Contact): String
    suspend fun updateContact(contact: Contact)
    suspend fun deleteContact(id: String)
    suspend fun toggleFavorite(id: String, isFavorite: Boolean)
    suspend fun syncContacts()
}
