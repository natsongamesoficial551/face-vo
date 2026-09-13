package com.facevo.localvideo.ui.feed

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.recyclerview.widget.RecyclerView

class FeedPlaybackCoordinator(
    context: Context,
    private val recyclerView: RecyclerView,
    private val adapter: FeedAdapter,
) {
    private val state = PlaybackStateMachine()
    private val player = ExoPlayer.Builder(context.applicationContext).build()
    private var attachedHolder: FeedAdapter.VideoViewHolder? = null
    private var preparedPosition = PlaybackStateMachine.NO_POSITION
    private var muted = false

    val activePosition: Int
        get() = state.activePosition

    init {
        adapter.onViewRecycled = { holder ->
            if (holder === attachedHolder) detachHolder(pause = true)
        }
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                currentHolder()?.showBuffering(playbackState == Player.STATE_BUFFERING)
                updatePlaybackControl()
            }

            override fun onIsPlayingChanged(isPlaying: Boolean) {
                updatePlaybackControl()
            }

            override fun onRenderedFirstFrame() {
                currentHolder()?.showFirstFrame()
            }

            override fun onPlayerError(error: PlaybackException) {
                currentHolder()?.showError()
            }
        })
    }

    fun activate(position: Int) {
        if (position !in 0 until adapter.itemCount || state.isReleased) return
        val changed = state.activate(position)
        val holder = holderAt(position) ?: return
        if (changed || preparedPosition != position) {
            player.pause()
            detachHolder(pause = false)
            attachedHolder = holder
            holder.binding.playerView.player = player
            holder.showPreparing()
            player.setMediaItem(MediaItem.fromUri(adapter.currentList[position].videoUrl))
            preparedPosition = position
            player.prepare()
        } else if (attachedHolder !== holder) {
            detachHolder(pause = false)
            attachedHolder = holder
            holder.binding.playerView.player = player
        }
        player.playWhenReady = state.shouldPlay
        updatePlaybackControl()
        holder.showMuted(muted)
    }

    fun retry(position: Int) {
        if (position != state.activePosition || state.isReleased) return
        currentHolder()?.showPreparing()
        player.prepare()
        player.playWhenReady = state.shouldPlay
    }

    fun togglePlayback() {
        state.togglePlayback()
        player.playWhenReady = state.shouldPlay
        if (!state.userWantsPlayback) player.pause()
        updatePlaybackControl()
    }

    fun toggleSound() {
        muted = !muted
        player.volume = if (muted) 0f else 1f
        currentHolder()?.showMuted(muted)
    }

    fun start() {
        state.start()
        if (state.activePosition != PlaybackStateMachine.NO_POSITION) {
            activate(state.activePosition)
        }
    }

    fun stop() {
        state.stop()
        player.pause()
        updatePlaybackControl()
    }

    fun clear() {
        if (state.isReleased) return
        state.clear()
        player.stop()
        player.clearMediaItems()
        preparedPosition = PlaybackStateMachine.NO_POSITION
        detachHolder(pause = false)
    }

    fun release() {
        if (state.isReleased) return
        state.release()
        adapter.onViewRecycled = null
        detachHolder(pause = false)
        player.release()
    }

    private fun updatePlaybackControl() {
        currentHolder()?.showPlaybackState(player.isPlaying || player.playWhenReady)
    }

    private fun currentHolder(): FeedAdapter.VideoViewHolder? {
        if (state.isReleased || preparedPosition != state.activePosition) return null
        return attachedHolder
    }

    private fun holderAt(position: Int): FeedAdapter.VideoViewHolder? =
        recyclerView.findViewHolderForAdapterPosition(position) as? FeedAdapter.VideoViewHolder

    private fun detachHolder(pause: Boolean) {
        if (pause) player.pause()
        attachedHolder?.binding?.playerView?.player = null
        attachedHolder?.resetPlaybackUi()
        attachedHolder = null
    }
}
