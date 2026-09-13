package com.facevo.localvideo.ui.feed

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.facevo.localvideo.R
import com.facevo.localvideo.databinding.ItemVideoBinding
import com.facevo.localvideo.domain.CatalogVideo

class FeedAdapter(
    private val onRetry: (Int) -> Unit,
    private val onTogglePlayback: () -> Unit,
    private val onToggleSound: () -> Unit,
) : ListAdapter<CatalogVideo, FeedAdapter.VideoViewHolder>(VideoDiff) {
    var onViewRecycled: ((VideoViewHolder) -> Unit)? = null

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VideoViewHolder {
        val binding = ItemVideoBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VideoViewHolder(binding, onRetry, onTogglePlayback, onToggleSound)
    }

    override fun onBindViewHolder(holder: VideoViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    override fun onViewRecycled(holder: VideoViewHolder) {
        onViewRecycled?.invoke(holder)
        holder.recycle()
        super.onViewRecycled(holder)
    }

    class VideoViewHolder(
        val binding: ItemVideoBinding,
        onRetry: (Int) -> Unit,
        onTogglePlayback: () -> Unit,
        onToggleSound: () -> Unit,
    ) : RecyclerView.ViewHolder(binding.root) {
        init {
            binding.retryButton.setOnClickListener {
                bindingAdapterPosition.takeIf { it != RecyclerView.NO_POSITION }?.let(onRetry)
            }
            binding.playPauseButton.setOnClickListener { onTogglePlayback() }
            binding.soundButton.setOnClickListener { onToggleSound() }
        }

        fun bind(video: CatalogVideo) {
            binding.title.text = video.title
            binding.description.text = binding.root.context.getString(
                R.string.video_by_author,
                video.description,
                video.author,
            )
            binding.thumbnail.contentDescription = binding.root.context.getString(
                R.string.video_thumbnail,
                video.title,
            )
            Glide.with(binding.thumbnail)
                .load(video.thumbnailUrl)
                .placeholder(R.drawable.video_placeholder)
                .error(R.drawable.video_placeholder)
                .centerCrop()
                .into(binding.thumbnail)
            resetPlaybackUi()
        }

        fun showPreparing() {
            binding.thumbnail.visibility = View.VISIBLE
            binding.buffering.visibility = View.VISIBLE
            binding.errorPanel.visibility = View.GONE
        }

        fun showBuffering(show: Boolean) {
            if (show && binding.buffering.visibility != View.VISIBLE) {
                binding.buffering.announceForAccessibility(
                    binding.root.context.getString(R.string.buffering_video),
                )
            }
            binding.buffering.visibility = if (show) View.VISIBLE else View.GONE
        }

        fun showFirstFrame() {
            binding.thumbnail.visibility = View.GONE
            binding.buffering.visibility = View.GONE
            binding.errorPanel.visibility = View.GONE
        }

        fun showError() {
            binding.thumbnail.visibility = View.VISIBLE
            binding.buffering.visibility = View.GONE
            binding.errorPanel.visibility = View.VISIBLE
            binding.errorPanel.announceForAccessibility(binding.root.context.getString(R.string.playback_error))
        }

        fun showPlaybackState(isPlaying: Boolean) {
            binding.playPauseButton.setText(if (isPlaying) R.string.pause_video else R.string.play_video)
            binding.playPauseButton.contentDescription = binding.playPauseButton.text
        }

        fun showMuted(muted: Boolean) {
            binding.soundButton.setText(if (muted) R.string.unmute_video else R.string.mute_video)
            binding.soundButton.contentDescription = binding.soundButton.text
        }

        fun resetPlaybackUi() {
            binding.playerView.player = null
            binding.thumbnail.visibility = View.VISIBLE
            binding.buffering.visibility = View.GONE
            binding.errorPanel.visibility = View.GONE
            showPlaybackState(false)
        }

        fun recycle() {
            resetPlaybackUi()
            Glide.with(binding.thumbnail).clear(binding.thumbnail)
        }
    }

    private object VideoDiff : DiffUtil.ItemCallback<CatalogVideo>() {
        override fun areItemsTheSame(oldItem: CatalogVideo, newItem: CatalogVideo) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: CatalogVideo, newItem: CatalogVideo) = oldItem == newItem
    }
}
