package com.craftn.callpilot.domain.model

import java.util.Date

data class Contact(
    val id: String,
    val name: String,
    val phoneNumber: String,
    val email: String? = null,
    val company: String? = null,
    val jobTitle: String? = null,
    val tags: List<String> = emptyList(),
    val totalCalls: Int = 0,
    val lastContactedAt: Date? = null,
    val notesCount: Int = 0,
    val isFavorite: Boolean = false,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
)
