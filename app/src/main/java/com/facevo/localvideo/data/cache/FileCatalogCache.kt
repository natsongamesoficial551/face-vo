package com.facevo.localvideo.data.cache

import com.facevo.localvideo.domain.CatalogVideo
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.nio.file.Files
import java.nio.file.StandardCopyOption

internal class FileCatalogCache(
    cacheDir: File,
    moshi: Moshi,
    private val allowCleartext: Boolean,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) : CatalogCache {
    private val target = File(cacheDir, "catalog.json")
    private val adapter = moshi.adapter<List<CachedCatalogVideo>>(
        Types.newParameterizedType(List::class.java, CachedCatalogVideo::class.java),
    )

    override suspend fun read(): List<CatalogVideo>? = withContext(ioDispatcher) {
        if (!target.isFile) return@withContext null
        runCatching {
            adapter.fromJson(target.readText())
                ?.map(CachedCatalogVideo::toDomain)
                ?.takeIf(::isValid)
        }.getOrNull()
    }

    override suspend fun write(videos: List<CatalogVideo>) = withContext(ioDispatcher) {
        target.parentFile?.mkdirs()
        val temporary = File(target.parentFile, "${target.name}.tmp")
        try {
            temporary.writeText(adapter.toJson(videos.map(CachedCatalogVideo::fromDomain)))
            Files.move(
                temporary.toPath(),
                target.toPath(),
                StandardCopyOption.ATOMIC_MOVE,
                StandardCopyOption.REPLACE_EXISTING,
            )
        } finally {
            temporary.delete()
        }
        Unit
    }

    private fun isValid(videos: List<CatalogVideo>): Boolean = videos.all { video ->
        video.id.isNotBlank() && isAcceptedUrl(video.videoUrl) &&
            (video.thumbnailUrl == null || isAcceptedUrl(video.thumbnailUrl))
    }

    private fun isAcceptedUrl(value: String): Boolean = runCatching {
        val uri = java.net.URI(value)
        uri.isAbsolute && !uri.host.isNullOrBlank() &&
            (uri.scheme.equals("https", true) ||
                (allowCleartext && uri.scheme.equals("http", true)))
    }.getOrDefault(false)
}

@JsonClass(generateAdapter = false)
internal data class CachedCatalogVideo(
    val id: String,
    val title: String,
    val description: String,
    val videoUrl: String,
    val thumbnailUrl: String?,
    val category: String,
    val author: String,
    val date: String,
) {
    fun toDomain() = CatalogVideo(id, title, description, videoUrl, thumbnailUrl, category, author, date)

    companion object {
        fun fromDomain(video: CatalogVideo) = CachedCatalogVideo(
            video.id,
            video.title,
            video.description,
            video.videoUrl,
            video.thumbnailUrl,
            video.category,
            video.author,
            video.date,
        )
    }
}
