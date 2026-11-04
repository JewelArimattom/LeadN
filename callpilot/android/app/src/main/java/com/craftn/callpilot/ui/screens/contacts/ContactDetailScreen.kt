package com.craftn.callpilot.ui.screens.contacts

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.craftn.callpilot.domain.model.CallRecord
import com.craftn.callpilot.domain.model.Contact
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.repository.ContactRepository
import com.craftn.callpilot.ui.components.ContactAvatar
import com.craftn.callpilot.ui.screens.home.CallHomeCard
import com.craftn.callpilot.ui.theme.PrimaryOrange
import com.craftn.callpilot.ui.theme.PrimaryOrangeLight
import com.craftn.callpilot.ui.theme.SecondaryTeal
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactDetailScreen(
    contactId: String,
    contactRepository: ContactRepository,
    callRepository: CallRepository,
    onNavigateBack: () -> Unit,
    onNavigateToCallDetail: (String) -> Unit
) {
    val context = LocalContext.current
    var contact by remember { mutableStateOf<Contact?>(null) }
    var calls by remember { mutableStateOf<List<CallRecord>>(emptyList()) }
    val timeFormat = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())

    LaunchedEffect(contactId) {
        contact = contactRepository.getContactById(contactId)
        callRepository.getCallsForContact(contactId).collect {
            calls = it
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Contact Profile") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { paddingValues ->
        if (contact == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            val c = contact!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Header Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        ContactAvatar(name = c.name, size = 68)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = c.name,
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (!c.company.isNullOrBlank()) {
                            Text(
                                text = listOfNotNull(c.jobTitle, c.company).joinToString(" • "),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Quick Call / SMS Buttons
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            FilledTonalButton(
                                onClick = {
                                    val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${c.phoneNumber}"))
                                    context.startActivity(dialIntent)
                                },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Call")
                            }

                            FilledTonalButton(
                                onClick = {
                                    val smsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sms:${c.phoneNumber}"))
                                    context.startActivity(smsIntent)
                                },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.Message, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("SMS")
                            }
                        }
                    }
                }

                // Contact Information Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Details",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        DetailRow(icon = Icons.Default.Phone, label = "Phone", value = c.phoneNumber)
                        if (!c.email.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            DetailRow(icon = Icons.Default.Email, label = "Email", value = c.email)
                        }
                    }
                }

                // Call History with this Contact
                Text(
                    text = "Calls with ${c.name} (${calls.size})",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )

                if (calls.isEmpty()) {
                    Text(
                        text = "No calls recorded with this contact yet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                } else {
                    calls.forEach { call ->
                        CallHomeCard(
                            call = call,
                            timeFormat = timeFormat,
                            onClick = { onNavigateToCallDetail(call.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = PrimaryOrangeLight, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}
