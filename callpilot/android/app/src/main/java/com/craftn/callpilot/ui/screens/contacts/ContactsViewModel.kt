package com.craftn.callpilot.ui.screens.contacts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.craftn.callpilot.domain.model.Contact
import com.craftn.callpilot.domain.repository.ContactRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class ContactsUiState(
    val contacts: List<Contact> = emptyList(),
    val searchQuery: String = "",
    val showFavoritesOnly: Boolean = false,
    val isLoading: Boolean = false
)

@HiltViewModel
class ContactsViewModel @Inject constructor(
    private val contactRepository: ContactRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ContactsUiState())
    val uiState: StateFlow<ContactsUiState> = _uiState.asStateFlow()

    init {
        loadContacts()
    }

    private fun loadContacts() {
        viewModelScope.launch {
            contactRepository.getAllContacts().collect { list ->
                _uiState.value = _uiState.value.copy(contacts = list)
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        viewModelScope.launch {
            if (query.isBlank()) {
                loadContacts()
            } else {
                contactRepository.searchContacts(query).collect { list ->
                    _uiState.value = _uiState.value.copy(contacts = list)
                }
            }
        }
    }

    fun toggleFavoritesFilter() {
        val newFav = !_uiState.value.showFavoritesOnly
        _uiState.value = _uiState.value.copy(showFavoritesOnly = newFav)
        viewModelScope.launch {
            if (newFav) {
                contactRepository.getFavoriteContacts().collect { list ->
                    _uiState.value = _uiState.value.copy(contacts = list)
                }
            } else {
                loadContacts()
            }
        }
    }

    fun toggleContactFavorite(contact: Contact) {
        viewModelScope.launch {
            contactRepository.toggleFavorite(contact.id, !contact.isFavorite)
        }
    }

    fun saveContact(
        id: String,
        name: String,
        phone: String,
        email: String?,
        company: String?,
        jobTitle: String?,
        tags: List<String>
    ) {
        viewModelScope.launch {
            val contact = Contact(
                id = id,
                name = name,
                phoneNumber = phone,
                email = email,
                company = company,
                jobTitle = jobTitle,
                tags = tags,
                updatedAt = Date()
            )
            if (id.isBlank()) {
                contactRepository.insertContact(contact)
            } else {
                contactRepository.updateContact(contact)
            }
        }
    }
}
