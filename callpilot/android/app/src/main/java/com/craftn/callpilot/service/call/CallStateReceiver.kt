package com.craftn.callpilot.service.call

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import com.craftn.callpilot.domain.model.CallRecord
import com.craftn.callpilot.domain.model.CallSource
import com.craftn.callpilot.domain.model.CallType
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.repository.ContactRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

/** Logs call metadata after the call ends; audio recording remains a separate consent-based action. */
@AndroidEntryPoint
class CallStateReceiver : BroadcastReceiver() {
    @Inject lateinit var callRepository: CallRepository
    @Inject lateinit var contactRepository: ContactRepository

    override fun onReceive(context: Context, intent: Intent) {
        val prefs = context.getSharedPreferences("callpilot_call_state", Context.MODE_PRIVATE)
        if (!prefs.getBoolean("enabled", false)) return
        if (intent.action == Intent.ACTION_NEW_OUTGOING_CALL) {
            intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER)?.let {
                prefs.edit().putString("number", it).putString("type", "OUTGOING").apply()
            }
            return
        }

        when (intent.getStringExtra(TelephonyManager.EXTRA_STATE)) {
            TelephonyManager.EXTRA_STATE_RINGING -> {
                prefs.edit()
                    .putString("number", intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER).orEmpty())
                    .putString("type", "INCOMING")
                    .putLong("started", 0L)
                    .putLong("call_time", System.currentTimeMillis())
                    .apply()
            }
            TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                if (prefs.getLong("started", 0L) == 0L) {
                    prefs.edit().putLong("started", System.currentTimeMillis())
                        .putLong("call_time", System.currentTimeMillis()).apply()
                }
            }
            TelephonyManager.EXTRA_STATE_IDLE -> {
                val started = prefs.getLong("started", 0L)
                val type = prefs.getString("type", null)
                if (type != null && (started > 0L || type == "INCOMING")) {
                    val number = prefs.getString("number", "").orEmpty()
                    val duration = if (started > 0L) ((System.currentTimeMillis() - started) / 1000L).toInt() else 0
                    val callType = when {
                        type == "INCOMING" && started == 0L -> CallType.MISSED
                        type == "INCOMING" -> CallType.INCOMING
                        else -> CallType.OUTGOING
                    }
                    val callTime = prefs.getLong("call_time", System.currentTimeMillis())
                    prefs.edit().remove("number").remove("type").remove("started").remove("call_time").apply()

                    val pendingResult = goAsync()
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val contact = if (number.isNotBlank()) contactRepository.getContactByPhone(number) else null
                            callRepository.insertCall(
                                CallRecord(
                                    id = "",
                                    contactId = contact?.id,
                                    contactName = contact?.name ?: number.ifBlank { "Unknown caller" },
                                    phoneNumber = number,
                                    callType = callType,
                                    source = CallSource.AUTO_LOGGED,
                                    durationSeconds = duration,
                                    timestamp = Date(callTime)
                                )
                            )
                        } finally {
                            pendingResult.finish()
                        }
                    }
                }
            }
        }
    }
}
