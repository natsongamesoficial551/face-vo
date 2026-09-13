package com.facevo.localvideo.ui.feed

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PlaybackStateMachineTest {
    @Test
    fun `rapid selection leaves only the last item eligible to play`() {
        val state = PlaybackStateMachine()
        state.start()

        state.activate(0)
        state.activate(1)
        state.activate(4)

        assertEquals(4, state.activePosition)
        assertTrue(state.shouldPlay)
        assertEquals(1, PlaybackStateMachine.MAXIMUM_PLAYERS)
    }

    @Test
    fun `stop pauses eligibility and start resumes selected item`() {
        val state = PlaybackStateMachine()
        state.start()
        state.activate(2)

        state.stop()
        assertFalse(state.shouldPlay)
        assertEquals(2, state.activePosition)

        state.start()
        assertTrue(state.shouldPlay)
    }

    @Test
    fun `manual pause remains paused after lifecycle restart`() {
        val state = PlaybackStateMachine()
        state.start()
        state.activate(1)
        state.togglePlayback()

        state.stop()
        state.start()
        state.activate(1)

        assertFalse(state.shouldPlay)
    }

    @Test
    fun `release is terminal and clears selection`() {
        val state = PlaybackStateMachine()
        state.start()
        state.activate(3)

        state.release()
        state.start()
        state.activate(5)

        assertTrue(state.isReleased)
        assertEquals(PlaybackStateMachine.NO_POSITION, state.activePosition)
        assertFalse(state.shouldPlay)
    }
}
