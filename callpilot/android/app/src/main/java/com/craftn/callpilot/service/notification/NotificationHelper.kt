package com.craftn.callpilot.service.notification

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.craftn.callpilot.MainActivity
import com.craftn.callpilot.R
import com.craftn.callpilot.domain.model.Reminder

object NotificationHelper {
    const val CHANNEL_RECORDING = "recording_channel"
    const val CHANNEL_REMINDERS = "reminders_channel"
    const val CHANNEL_AI_INSIGHTS = "ai_insights_channel"
    const val CHANNEL_CALL_CONSENT = "call_consent_channel"

    const val ACTION_COMPLETE = "com.craftn.callpilot.ACTION_COMPLETE"
    const val ACTION_SNOOZE = "com.craftn.callpilot.ACTION_SNOOZE"
    const val EXTRA_REMINDER_ID = "extra_reminder_id"
    const val EXTRA_REMINDER_TITLE = "extra_reminder_title"
    const val EXTRA_REMINDER_DESC = "extra_reminder_desc"
    const val ACTION_DISMISS_CALL_CONSENT = "com.craftn.callpilot.ACTION_DISMISS_CALL_CONSENT"
    const val EXTRA_CALL_NUMBER = "extra_call_number"
    const val EXTRA_OPEN_RECORDER = "extra_open_recorder"

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val recordingChannel = NotificationChannel(
                CHANNEL_RECORDING,
                context.getString(R.string.channel_recording),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.channel_recording_desc)
                setShowBadge(false)
            }

            val remindersChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                context.getString(R.string.channel_reminders),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_reminders_desc)
                enableVibration(true)
                setShowBadge(true)
            }

            val aiChannel = NotificationChannel(
                CHANNEL_AI_INSIGHTS,
                "AI Insights",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "AI recommendations and call recaps"
            }

            val callConsentChannel = NotificationChannel(
                CHANNEL_CALL_CONSENT,
                "Incoming call recording consent",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Asks before recording and analyzing an incoming call"
                enableVibration(false)
                setShowBadge(false)
            }

            notificationManager.createNotificationChannels(listOf(recordingChannel, remindersChannel, aiChannel, callConsentChannel))
        }
    }

    fun showIncomingCallConsent(context: Context, phoneNumber: String) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return
        val number = phoneNumber.ifBlank { "Unknown caller" }
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(EXTRA_OPEN_RECORDER, true)
            putExtra(EXTRA_CALL_NUMBER, phoneNumber)
        }
        val openPendingIntent = PendingIntent.getActivity(
            context, "record_$phoneNumber".hashCode(), openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val dismissIntent = Intent(context, CallConsentDismissReceiver::class.java).apply {
            action = ACTION_DISMISS_CALL_CONSENT
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context, "dismiss_$phoneNumber".hashCode(), dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, CHANNEL_CALL_CONSENT)
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentTitle("Record and recap this call?")
            .setContentText("$number · CallPilot uses the microphone; speakerphone may help capture both sides.")
            .setStyle(NotificationCompat.BigTextStyle().bigText(
                "Would you like to record this call and create an AI transcript and recap? " +
                    "Recording starts only after you open CallPilot and tap Start Recording."
            ))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(openPendingIntent)
            .addAction(android.R.drawable.ic_btn_speak_now, "Yes, open recorder", openPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "No, thanks", dismissPendingIntent)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(INCOMING_CALL_NOTIFICATION_ID, notification)
    }

    fun cancelIncomingCallConsent(context: Context) {
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .cancel(INCOMING_CALL_NOTIFICATION_ID)
    }

    fun showReminderNotification(context: Context, reminderId: String, title: String, description: String?) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Tap intent to open app
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "reminders")
        }
        val openPendingIntent = PendingIntent.getActivity(
            context,
            reminderId.hashCode(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Complete action intent
        val completeIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_COMPLETE
            putExtra(EXTRA_REMINDER_ID, reminderId)
        }
        val completePendingIntent = PendingIntent.getBroadcast(
            context,
            (reminderId + "_complete").hashCode(),
            completeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Snooze action intent
        val snoozeIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_SNOOZE
            putExtra(EXTRA_REMINDER_ID, reminderId)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            (reminderId + "_snooze").hashCode(),
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("CallPilot Reminder: $title")
            .setContentText(description ?: "You have a scheduled follow-up call/task.")
            .setStyle(NotificationCompat.BigTextStyle().bigText(description ?: "You have a scheduled follow-up."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(openPendingIntent)
            .addAction(android.R.drawable.checkbox_on_background, "Complete", completePendingIntent)
            .addAction(android.R.drawable.ic_popup_sync, "Snooze 15m", snoozePendingIntent)
            .build()

        notificationManager.notify(reminderId.hashCode(), notification)
    }

    fun scheduleAlarm(context: Context, reminder: Reminder) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, ReminderAlarmReceiver::class.java).apply {
            putExtra(EXTRA_REMINDER_ID, reminder.id)
            putExtra(EXTRA_REMINDER_TITLE, reminder.title)
            putExtra(EXTRA_REMINDER_DESC, reminder.description)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            reminder.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                reminder.dueDateTime.time,
                pendingIntent
            )
        } else {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                reminder.dueDateTime.time,
                pendingIntent
            )
        }
    }

    fun cancelAlarm(context: Context, reminderId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, ReminderAlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            reminderId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
        }
    }

    const val INCOMING_CALL_NOTIFICATION_ID = 2001
}
