package com.facevo.localvideo.ui

import com.facevo.localvideo.data.CatalogRepository
import com.facevo.localvideo.data.CatalogResult
import com.facevo.localvideo.domain.CatalogVideo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CatalogViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    private val video = CatalogVideo("one", "Title", "", "https://example.com/1.mp4", null, "", "", "")

    @Before
    fun setUp() {
        Dispatchers.setMain(dispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `starts loading then exposes content`() = runTest(dispatcher) {
        val viewModel = CatalogViewModel(Repository(CatalogResult.Success(listOf(video), true)))

        assertEquals(CatalogUiState.Loading, viewModel.state.value)
        advanceUntilIdle()

        assertEquals(CatalogUiState.Content(listOf(video), fromCache = true), viewModel.state.value)
    }

    @Test
    fun `exposes empty for valid catalog without videos`() = runTest(dispatcher) {
        val viewModel = CatalogViewModel(Repository(CatalogResult.Success(emptyList(), false)))

        advanceUntilIdle()

        assertEquals(CatalogUiState.Empty, viewModel.state.value)
    }

    @Test
    fun `exposes simple retryable error`() = runTest(dispatcher) {
        val viewModel = CatalogViewModel(Repository(CatalogResult.Failure))

        advanceUntilIdle()

        val state = viewModel.state.value as CatalogUiState.Error
        assertTrue(state.canRetry)
        assertFalse(state.message.contains("HTTP", ignoreCase = true))
        assertFalse(state.message.contains("null", ignoreCase = true))
    }

    @Test
    fun `retry loads again and exposes content`() = runTest(dispatcher) {
        val repository = SequenceRepository(
            ArrayDeque(
                listOf(
                    CatalogResult.Failure,
                    CatalogResult.Success(listOf(video), false),
                ),
            ),
        )
        val viewModel = CatalogViewModel(repository)
        advanceUntilIdle()

        viewModel.retry()
        assertEquals(CatalogUiState.Loading, viewModel.state.value)
        advanceUntilIdle()

        assertEquals(CatalogUiState.Content(listOf(video), false), viewModel.state.value)
        assertEquals(2, repository.calls)
    }

    private class Repository(private val result: CatalogResult) : CatalogRepository {
        override suspend fun refresh(): CatalogResult = result
    }

    private class SequenceRepository(
        private val results: ArrayDeque<CatalogResult>,
    ) : CatalogRepository {
        var calls = 0

        override suspend fun refresh(): CatalogResult {
            calls++
            return results.removeFirst()
        }
    }
}
