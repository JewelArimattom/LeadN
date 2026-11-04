package com.craftn.callpilot.service.recording

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.IOException

class AudioRecorder(private val context: Context) {
    private var recorder: MediaRecorder? = null
    private var currentOutputFile: File? = null
    private var isRecording = false
    private var scope: CoroutineScope? = null

    private val _amplitudes = MutableStateFlow<List<Float>>(emptyList())
    val amplitudes: StateFlow<List<Float>> = _amplitudes.asStateFlow()

    private val _recordingDurationSeconds = MutableStateFlow(0)
    val recordingDurationSeconds: StateFlow<Int> = _recordingDurationSeconds.asStateFlow()

    fun startRecording(outputFile: File) {
        currentOutputFile = outputFile

        recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            @Suppress("DEPRECATION")
            MediaRecorder()
        }.apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioEncodingBitRate(128000)
            setAudioSamplingRate(44100)
            setOutputFile(outputFile.absolutePath)

            try {
                prepare()
                start()
                isRecording = true
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }

        // Amplitude tracking for waveform & duration counter
        scope = CoroutineScope(Dispatchers.Default)
        scope?.launch {
            var duration = 0
            while (isRecording) {
                delay(100)
                try {
                    val maxAmp = recorder?.maxAmplitude ?: 0
                    val normalized = (maxAmp / 32767f).coerceIn(0.05f, 1f)
                    val currentList = _amplitudes.value.toMutableList()
                    if (currentList.size > 50) {
                        currentList.removeAt(0)
                    }
                    currentList.add(normalized)
                    _amplitudes.value = currentList
                } catch (_: Exception) {}
            }
        }

        scope?.launch {
            var seconds = 0
            while (isRecording) {
                delay(1000)
                seconds++
                _recordingDurationSeconds.value = seconds
            }
        }
    }

    fun stopRecording(): File? {
        if (!isRecording) return null
        isRecording = false
        scope?.cancel()
        try {
            recorder?.apply {
                stop()
                reset()
                release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        recorder = null
        return currentOutputFile
    }

    fun isRecording() = isRecording
}

class AudioPlayer {
    private var player: MediaPlayer? = null
    private var scope: CoroutineScope? = null

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _progress = MutableStateFlow(0f)
    val progress: StateFlow<Float> = _progress.asStateFlow()

    fun playAudio(file: File, onComplete: () -> Unit = {}) {
        stopAudio()
        player = MediaPlayer().apply {
            setDataSource(file.absolutePath)
            prepare()
            start()
            _isPlaying.value = true

            setOnCompletionListener {
                _isPlaying.value = false
                _progress.value = 0f
                scope?.cancel()
                onComplete()
            }
        }

        scope = CoroutineScope(Dispatchers.Default)
        scope?.launch {
            while (_isPlaying.value) {
                val current = player?.currentPosition ?: 0
                val total = player?.duration ?: 1
                _progress.value = (current.toFloat() / total.toFloat()).coerceIn(0f, 1f)
                delay(100)
            }
        }
    }

    fun pauseAudio() {
        player?.pause()
        _isPlaying.value = false
    }

    fun resumeAudio() {
        player?.start()
        _isPlaying.value = true
    }

    fun stopAudio() {
        scope?.cancel()
        player?.apply {
            stop()
            release()
        }
        player = null
        _isPlaying.value = false
        _progress.value = 0f
    }
}
