package com.facevo.localvideo.data

import com.facevo.localvideo.data.cache.CatalogCache
import com.facevo.localvideo.data.remote.CatalogNetworkSource
import com.facevo.localvideo.data.remote.CatalogResponseDto
import com.facevo.localvideo.data.remote.CatalogVideoDto
import com.facevo.localvideo.domain.CatalogVideo
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.CancellationException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.fail
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class CatalogRepositoryTest {
    private val video = CatalogVideo(
        id = "one",
        title = "Plantas",
        description = "Jardim",
        videoUrl = "https://facevo.example/video.mp4",
        thumbnailUrl = null,
        category = "Plantas",
        author = "FaceVo",
        date = "01/09/2026",
    )

    @Test
    fun `returns network content and updates cache`() = runTest {
        val cache = FakeCache()
        val repository = repository(successResponse(), cache)

        val result = repository.refresh() as CatalogResult.Success

        assertFalse(result.fromCache)
        assertEquals(listOf(video), cache.value)
    }

    @Test
    fun `returns valid empty catalog and caches it`() = runTest {
        val cache = FakeCache(value = listOf(video))
        val repository = repository(CatalogResponseDto(videos = emptyList()), cache)

        val result = repository.refresh() as CatalogResult.Success

        assertTrue(result.videos.isEmpty())
        assertEquals(emptyList<CatalogVideo>(), cache.value)
    }

    @Test
    fun `uses existing cache when network fails`() = runTest {
        val cache = FakeCache(value = listOf(video))
        val repository = repository(error = IOException("offline"), cache = cache)

        val result = repository.refresh() as CatalogResult.Success

        assertTrue(result.fromCache)
        assertEquals(listOf(video), result.videos)
    }

    @Test
    fun `returns failure when network and cache fail`() = runTest {
        val repository = repository(
            error = IOException("offline"),
            cache = FakeCache(readError = IOException("disk")),
        )

        assertSame(CatalogResult.Failure, repository.refresh())
    }

    @Test
    fun `invalid response does not replace valid cache`() = runTest {
        val cache = FakeCache(value = listOf(video))
        val response = CatalogResponseDto(
            videos = listOf(CatalogVideoDto(id = "bad", videoUrl = "not-a-url")),
        )
        val repository = repository(response, cache)

        val result = repository.refresh() as CatalogResult.Success

        assertTrue(result.fromCache)
        assertEquals(listOf(video), cache.value)
        assertEquals(0, cache.writeCount)
    }

    @Test
    fun `failed cache write keeps old cache and returns fresh response`() = runTest {
        val old = video.copy(id = "old")
        val cache = FakeCache(value = listOf(old), writeError = IOException("disk full"))
        val repository = repository(successResponse(), cache)

        val result = repository.refresh() as CatalogResult.Success

        assertFalse(result.fromCache)
        assertEquals(listOf(video), result.videos)
        assertEquals(listOf(old), cache.value)
    }

    @Test
    fun `cache write cancellation cancels refresh`() = runTest {
        val repository = repository(
            successResponse(),
            FakeCache(writeError = CancellationException("cancelled")),
        )

        try {
            repository.refresh()
            fail("Expected refresh cancellation")
        } catch (_: CancellationException) {
            // Expected: cancellation must never fall back to stale cache.
        }
    }

    private fun repository(
        response: CatalogResponseDto? = null,
        cache: FakeCache,
        error: Exception? = null,
    ) = DefaultCatalogRepository(
        network = object : CatalogNetworkSource {
            override suspend fun fetch(): CatalogResponseDto = error?.let { throw it } ?: response!!
        },
        cache = cache,
        mapper = CatalogMapper(allowCleartext = false),
    )

    private fun successResponse() = CatalogResponseDto(
        version = 186,
        videos = listOf(
            CatalogVideoDto(
                id = video.id,
                title = video.title,
                description = video.description,
                videoUrl = video.videoUrl,
                category = video.category,
                author = video.author,
                date = video.date,
            ),
        ),
    )

    private class FakeCache(
        var value: List<CatalogVideo>? = null,
        private val readError: Exception? = null,
        private val writeError: Exception? = null,
    ) : CatalogCache {
        var writeCount = 0

        override suspend fun read(): List<CatalogVideo>? = readError?.let { throw it } ?: value

        override suspend fun write(videos: List<CatalogVideo>) {
            writeCount++
            writeError?.let { throw it }
            value = videos
        }
    }
}
