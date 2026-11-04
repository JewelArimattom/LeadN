package com.craftn.callpilot.service.recording

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.craftn.callpilot.MainActivity
import com.craftn.callpilot.service.notification.NotificationHelper
import java.io.File

class RecordingService : Service() {

    private val binder = RecordingBinder()
    private lateinit var audioRecorder: AudioRecorder
    private var isServiceRunning = false

    inner class RecordingBinder : Binder() {
        fun getService(): RecordingService = this@RecordingService
    }

    override fun onCreate() {
        super.onCreate()
        audioRecorder = AudioRecorder(this)
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_RECORDING -> {
                val filePath = intent.getStringExtra(EXTRA_FILE_PATH)
                if (filePath != null) {
                    startForegroundWithNotification()
                    audioRecorder.startRecording(File(filePath))
                    isServiceRunning = true
                }
            }
            ACTION_STOP_RECORDING -> {
                stopRecording()
            }
        }
        return START_NOT_STICKY
    }

    fun startRecording(file: File) {
        startForegroundWithNotification()
        audioRecorder.startRecording(file)
        isServiceRunning = true
    }

    fun stopRecording(): File? {
        val file = audioRecorder.stopRecording()
        isServiceRunning = false
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return file
    }

    fun getRecorder(): AudioRecorder = audioRecorder

    private fun startForegroundWithNotification() {
        val notificationIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, NotificationHelper.CHANNEL_RECORDING)
            .setContentTitle("CallPilot Recording Active")
            .setContentText("Recording conversation audio securely...")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_RECORDING = "com.craftn.callpilot.ACTION_START_RECORDING"
        const val ACTION_STOP_RECORDING = "com.craftn.callpilot.ACTION_STOP_RECORDING"
        const val EXTRA_FILE_PATH = "extra_file_path"
    }
}
