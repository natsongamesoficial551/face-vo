package com.facevo.localvideo.data.cache

import com.facevo.localvideo.domain.CatalogVideo
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class FileCatalogCacheTest {
    @get:Rule
    val temporaryFolder = TemporaryFolder()

    @Test
    fun `writes and reads complete catalog without leaving temporary file`() = runTest {
        val directory = temporaryFolder.newFolder("cache")
        val moshi = Moshi.Builder().addLast(KotlinJsonAdapterFactory()).build()
        val cache = FileCatalogCache(
            directory,
            moshi,
            allowCleartext = false,
            ioDispatcher = StandardTestDispatcher(testScheduler),
        )
        val videos = listOf(
            CatalogVideo("one", "Title", "Description", "https://example.com/1.mp4", null, "Plants", "FaceVo", "today"),
        )

        cache.write(videos)

        assertEquals(videos, cache.read())
        assertFalse(directory.resolve("catalog.json.tmp").exists())
    }

    @Test
    fun `rejects corrupt or unsafe cached content`() = runTest {
        val directory = temporaryFolder.newFolder("invalid-cache")
        directory.resolve("catalog.json").writeText(
            """[{"id":"one","title":"","description":"","videoUrl":"file:///video.mp4","thumbnailUrl":null,"category":"","author":"","date":""}]""",
        )
        val moshi = Moshi.Builder().addLast(KotlinJsonAdapterFactory()).build()
        val cache = FileCatalogCache(
            directory,
            moshi,
            allowCleartext = false,
            ioDispatcher = StandardTestDispatcher(testScheduler),
        )

        assertNull(cache.read())
    }
}
