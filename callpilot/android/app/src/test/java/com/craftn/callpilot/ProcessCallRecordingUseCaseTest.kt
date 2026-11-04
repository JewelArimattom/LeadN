package com.craftn.callpilot

import com.craftn.callpilot.domain.model.*
import com.craftn.callpilot.domain.repository.AiRepository
import com.craftn.callpilot.domain.repository.CallRepository
import com.craftn.callpilot.domain.repository.ReminderRepository
import com.craftn.callpilot.domain.usecase.ProcessCallRecordingUseCase
import io.mockk.*
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.File
import java.util.Date

class ProcessCallRecordingUseCaseTest {

    private lateinit var callRepository: CallRepository
    private lateinit var aiRepository: AiRepository
    private lateinit var reminderRepository: ReminderRepository
    private lateinit var useCase: ProcessCallRecordingUseCase

    @Before
    fun setUp() {
        callRepository = mockk(relaxed = true)
        aiRepository = mockk(relaxed = true)
        reminderRepository = mockk(relaxed = true)
        useCase = ProcessCallRecordingUseCase(callRepository, aiRepository, reminderRepository)
    }

    @Test
    fun `processCallRecordingUseCase transcribes and generates recap successfully`() = runTest {
        val callId = "test_call_1"
        val mockFile = mockk<File>()
        every { mockFile.name } returns "test_audio.m4a"
        every { mockFile.absolutePath } returns "/mock/path/test_audio.m4a"

        val mockTranscript = Transcript(
            id = "t1",
            callRecordId = callId,
            fullText = "Let's review the agreement deliverables next Tuesday.",
            segments = listOf(
                TranscriptSegment("s1", "User", "Hello", 0f, 1f),
                TranscriptSegment("s2", "Client", "Let's review the agreement deliverables next Tuesday.", 1f, 4f)
            )
        )

        val mockSummary = ConversationSummary(
            id = "s1",
            callRecordId = callId,
            quickRecap = "Agreed to review deliverables next Tuesday.",
            keyPoints = listOf("Deliverables review agreed"),
            clientCommitments = listOf("Review timeline"),
            suggestedFollowUpDate = Date(),
            sentimentLabel = "Positive",
            clientInterestLevel = "High",
            actionItems = listOf(
                ActionItem("a1", "Follow up on deliverables", "Me", Date(), false, ReminderPriority.HIGH)
            )
        )

        coEvery { aiRepository.transcribeAudio(any(), any()) } returns mockTranscript
        coEvery { aiRepository.generateRecap(any(), any()) } returns mockSummary
        coEvery { callRepository.getCallById(callId) } returns CallRecord(
            id = callId,
            contactName = "Sarah Jenkins",
            phoneNumber = "+1 555-0199",
            callType = CallType.OUTGOING
        )

        val result = useCase(callId, mockFile, "Sarah Jenkins")

        assertTrue(result.isSuccess)
        val summary = result.getOrNull()
        assertNotNull(summary)
        assertEquals("Agreed to review deliverables next Tuesday.", summary?.quickRecap)

        coVerify { callRepository.saveTranscript(any()) }
        coVerify { callRepository.saveSummary(any()) }
        coVerify { reminderRepository.insertReminder(any()) }
        coVerify { callRepository.updateCall(any()) }
    }
}
