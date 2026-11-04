package com.craftn.callpilot.domain.model

data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val company: String? = null,
    val phone: String? = null,
    val isActive: Boolean = true
)

data class AuthToken(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "bearer",
    val expiresIn: Long = 86400
)
