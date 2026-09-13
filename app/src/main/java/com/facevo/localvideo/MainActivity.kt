package com.facevo.localvideo

import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.PagerSnapHelper
import androidx.recyclerview.widget.RecyclerView
import com.facevo.localvideo.data.CatalogDataFactory
import com.facevo.localvideo.databinding.ActivityMainBinding
import com.facevo.localvideo.ui.CatalogUiState
import com.facevo.localvideo.ui.CatalogViewModel
import com.facevo.localvideo.ui.CatalogViewModelFactory
import com.facevo.localvideo.ui.feed.FeedAdapter
import com.facevo.localvideo.ui.feed.FeedPlaybackCoordinator
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: FeedAdapter
    private lateinit var playbackCoordinator: FeedPlaybackCoordinator
    private val snapHelper = PagerSnapHelper()
    private val viewModel: CatalogViewModel by viewModels {
        CatalogViewModelFactory(CatalogDataFactory.create(applicationContext))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = FeedAdapter(
            onRetry = { position -> playbackCoordinator.retry(position) },
            onTogglePlayback = { playbackCoordinator.togglePlayback() },
            onToggleSound = { playbackCoordinator.toggleSound() },
        )
        playbackCoordinator = FeedPlaybackCoordinator(this, binding.feed, adapter)
        binding.feed.layoutManager = LinearLayoutManager(this, RecyclerView.VERTICAL, false)
        binding.feed.adapter = adapter
        binding.feed.itemAnimator = null
        snapHelper.attachToRecyclerView(binding.feed)
        binding.feed.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                if (newState == RecyclerView.SCROLL_STATE_IDLE) activateSnappedItem()
            }
        })

        binding.previousButton.setOnClickListener { moveBy(-1) }
        binding.nextButton.setOnClickListener { moveBy(1) }
        binding.stateRetryButton.setOnClickListener { viewModel.retry() }
        applyInsets()
        observeCatalog()
    }

    private fun observeCatalog() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun render(state: CatalogUiState) {
        binding.loading.visibility = if (state is CatalogUiState.Loading) View.VISIBLE else View.GONE
        binding.feed.visibility = if (state is CatalogUiState.Content) View.VISIBLE else View.GONE
        binding.navigationControls.visibility = if (state is CatalogUiState.Content) View.VISIBLE else View.GONE
        binding.statePanel.visibility = if (state is CatalogUiState.Empty || state is CatalogUiState.Error) {
            View.VISIBLE
        } else {
            View.GONE
        }
        when (state) {
            is CatalogUiState.Content -> {
                if (adapter.currentList != state.videos) {
                    playbackCoordinator.clear()
                    adapter.submitList(state.videos) {
                        binding.feed.post(::activateSnappedItem)
                    }
                } else {
                    binding.feed.post(::activateSnappedItem)
                }
            }
            CatalogUiState.Empty -> {
                adapter.submitList(emptyList())
                playbackCoordinator.clear()
                binding.stateMessage.setText(R.string.empty_catalog)
                binding.stateRetryButton.visibility = View.VISIBLE
            }
            is CatalogUiState.Error -> {
                adapter.submitList(emptyList())
                playbackCoordinator.clear()
                binding.stateMessage.text = state.message
                binding.stateRetryButton.visibility = if (state.canRetry) View.VISIBLE else View.GONE
            }
            CatalogUiState.Loading -> playbackCoordinator.clear()
        }
        updateNavigation()
    }

    private fun activateSnappedItem() {
        val layoutManager = binding.feed.layoutManager ?: return
        val snapped = snapHelper.findSnapView(layoutManager) ?: return
        val position = binding.feed.getChildAdapterPosition(snapped)
        if (position != RecyclerView.NO_POSITION) {
            playbackCoordinator.activate(position)
            updateNavigation(position)
        }
    }

    private fun moveBy(delta: Int) {
        if (adapter.itemCount == 0) return
        val current = playbackCoordinator.activePosition.coerceAtLeast(0)
        val target = (current + delta).coerceIn(0, adapter.itemCount - 1)
        if (target != current) binding.feed.smoothScrollToPosition(target)
    }

    private fun updateNavigation(position: Int = playbackCoordinator.activePosition) {
        binding.previousButton.isEnabled = position > 0
        binding.nextButton.isEnabled = position >= 0 && position < adapter.itemCount - 1
    }

    private fun applyInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            binding.navigationControls.updatePadding(
                left = systemBars.left + resources.getDimensionPixelSize(R.dimen.screen_padding),
                right = systemBars.right + resources.getDimensionPixelSize(R.dimen.screen_padding),
                bottom = systemBars.bottom + resources.getDimensionPixelSize(R.dimen.screen_padding),
            )
            binding.feed.updatePadding(
                left = systemBars.left,
                top = systemBars.top,
                right = systemBars.right,
                bottom = systemBars.bottom,
            )
            binding.statePanel.updatePadding(left = systemBars.left, right = systemBars.right)
            insets
        }
    }

    override fun onStart() {
        super.onStart()
        if (::playbackCoordinator.isInitialized) playbackCoordinator.start()
    }

    override fun onStop() {
        if (::playbackCoordinator.isInitialized) playbackCoordinator.stop()
        super.onStop()
    }

    override fun onDestroy() {
        if (::playbackCoordinator.isInitialized) playbackCoordinator.release()
        super.onDestroy()
    }
}
