package com.craftn.callpilot.service.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.craftn.callpilot.domain.repository.ReminderRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

@AndroidEntryPoint
class ReminderAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra(NotificationHelper.EXTRA_REMINDER_ID) ?: return
        val title = intent.getStringExtra(NotificationHelper.EXTRA_REMINDER_TITLE) ?: "Reminder"
        val desc = intent.getStringExtra(NotificationHelper.EXTRA_REMINDER_DESC)

        NotificationHelper.showReminderNotification(context, reminderId, title, desc)
    }
}

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var reminderRepository: ReminderRepository

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val activeReminders = reminderRepository.getActiveRemindersList()
                    val now = System.currentTimeMillis()
                    for (reminder in activeReminders) {
                        if (reminder.dueDateTime.time > now) {
                            NotificationHelper.scheduleAlarm(context, reminder)
                        }
                    }
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}

@AndroidEntryPoint
class NotificationActionReceiver : BroadcastReceiver() {

    @Inject
    lateinit var reminderRepository: ReminderRepository

    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra(NotificationHelper.EXTRA_REMINDER_ID) ?: return
        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (intent.action) {
                    NotificationHelper.ACTION_COMPLETE -> {
                        reminderRepository.markCompleted(reminderId)
                    }
                    NotificationHelper.ACTION_SNOOZE -> {
                        // Snooze by 15 minutes
                        val newTime = Date(System.currentTimeMillis() + 15 * 60 * 1000)
                        reminderRepository.snoozeReminder(reminderId, newTime)
                        val reminder = reminderRepository.getReminderById(reminderId)
                        if (reminder != null) {
                            NotificationHelper.scheduleAlarm(context, reminder)
                        }
                    }
                }
            } finally {
                pendingResult.finish()
            }
        }
    }
}
