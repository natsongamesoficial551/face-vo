package com.facevo.localvideo.ui.feed

internal class PlaybackStateMachine {
    var activePosition: Int = NO_POSITION
        private set
    var isStarted: Boolean = false
        private set
    var userWantsPlayback: Boolean = true
        private set
    var isReleased: Boolean = false
        private set

    val shouldPlay: Boolean
        get() = !isReleased && isStarted && activePosition != NO_POSITION && userWantsPlayback

    fun activate(position: Int): Boolean {
        if (isReleased || position < 0) return false
        val changed = activePosition != position
        activePosition = position
        if (changed) userWantsPlayback = true
        return changed
    }

    fun clear() {
        if (!isReleased) activePosition = NO_POSITION
    }

    fun start() {
        if (!isReleased) isStarted = true
    }

    fun stop() {
        isStarted = false
    }

    fun togglePlayback() {
        if (!isReleased && activePosition != NO_POSITION) {
            userWantsPlayback = !userWantsPlayback
        }
    }

    fun release() {
        isStarted = false
        activePosition = NO_POSITION
        isReleased = true
    }

    companion object {
        const val NO_POSITION = -1
        const val MAXIMUM_PLAYERS = 1
    }
}
