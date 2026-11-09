package com.craftn.callpilot.data.repository

import com.craftn.callpilot.data.local.db.dao.ContactDao
import com.craftn.callpilot.data.local.db.entities.ContactEntity
import com.craftn.callpilot.data.remote.api.CallPilotApiService
import com.craftn.callpilot.data.remote.dto.CreateContactRequest
import com.craftn.callpilot.domain.model.Contact
import com.craftn.callpilot.domain.repository.ContactRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.Date
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContactRepositoryImpl @Inject constructor(
    private val contactDao: ContactDao,
    private val apiService: CallPilotApiService
) : ContactRepository {

    override fun getAllContacts(): Flow<List<Contact>> {
        return contactDao.getAllContacts().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override fun getFavoriteContacts(): Flow<List<Contact>> {
        return contactDao.getFavoriteContacts().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override fun searchContacts(query: String): Flow<List<Contact>> {
        return contactDao.searchContacts(query).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun getContactById(id: String): Contact? {
        return contactDao.getContactById(id)?.toDomain()
    }

    override suspend fun getContactByPhone(phone: String): Contact? {
        return contactDao.getContactByPhone(phone)?.toDomain()
    }

    override suspend fun insertContact(contact: Contact): String {
        val id = if (contact.id.isBlank()) UUID.randomUUID().toString() else contact.id
        val entity = contact.copy(id = id).toEntity()
        contactDao.insertContact(entity)

        // Try syncing to backend
        try {
            val response = apiService.createContact(
                CreateContactRequest(
                    name = contact.name,
                    phoneNumber = contact.phoneNumber,
                    email = contact.email,
                    company = contact.company,
                    jobTitle = contact.jobTitle,
                    tags = contact.tags
                )
            )
            if (response.isSuccessful) {
                val remoteId = response.body()?.id
                if (!remoteId.isNullOrBlank() && remoteId != id) {
                    contactDao.deleteContact(id)
                    contactDao.insertContact(entity.copy(id = remoteId, isSynced = true))
                    return remoteId
                }
                contactDao.updateContact(entity.copy(isSynced = true))
            }
        } catch (_: Exception) {
            // Keep local offline copy
        }

        return id
    }

    override suspend fun updateContact(contact: Contact) {
        contactDao.updateContact(contact.toEntity())
        try {
            apiService.updateContact(
                id = contact.id,
                request = CreateContactRequest(
                    name = contact.name,
                    phoneNumber = contact.phoneNumber,
                    email = contact.email,
                    company = contact.company,
                    jobTitle = contact.jobTitle,
                    tags = contact.tags
                )
            )
        } catch (_: Exception) {}
    }

    override suspend fun deleteContact(id: String) {
        contactDao.deleteContact(id)
        try {
            apiService.deleteContact(id)
        } catch (_: Exception) {}
    }

    override suspend fun toggleFavorite(id: String, isFavorite: Boolean) {
        contactDao.updateFavorite(id, isFavorite)
    }

    override suspend fun syncContacts() {
        try {
            val response = apiService.getContacts()
            if (response.isSuccessful && response.body() != null) {
                val remoteContacts = response.body()!!.map { dto ->
                    ContactEntity(
                        id = dto.id,
                        name = dto.name,
                        phoneNumber = dto.phoneNumber,
                        email = dto.email,
                        company = dto.company,
                        jobTitle = dto.jobTitle,
                        tags = dto.tags,
                        totalCalls = dto.totalCalls,
                        isFavorite = dto.isFavorite,
                        isSynced = true
                    )
                }
                contactDao.insertContacts(remoteContacts)
            }
        } catch (_: Exception) {}
    }

    private fun ContactEntity.toDomain() = Contact(
        id = id,
        name = name,
        phoneNumber = phoneNumber,
        email = email,
        company = company,
        jobTitle = jobTitle,
        tags = tags,
        totalCalls = totalCalls,
        lastContactedAt = lastContactedAt,
        notesCount = notesCount,
        isFavorite = isFavorite,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    private fun Contact.toEntity() = ContactEntity(
        id = id,
        name = name,
        phoneNumber = phoneNumber,
        email = email,
        company = company,
        jobTitle = jobTitle,
        tags = tags,
        totalCalls = totalCalls,
        lastContactedAt = lastContactedAt,
        notesCount = notesCount,
        isFavorite = isFavorite,
        createdAt = createdAt,
        updatedAt = updatedAt,
        isSynced = false
    )
}
