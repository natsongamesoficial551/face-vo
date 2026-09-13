package com.facevo.localvideo.data

import com.facevo.localvideo.data.remote.CatalogResponseDto
import com.facevo.localvideo.domain.CatalogVideo
import java.net.URI

internal class CatalogMapper(
    private val allowCleartext: Boolean,
) {
    fun map(response: CatalogResponseDto): List<CatalogVideo> {
        val input = response.videos ?: throw InvalidCatalogException()
        val valid = input.mapNotNull { item ->
            val id = item.id?.trim().orEmpty()
            val videoUrl = item.videoUrl?.trim().orEmpty()
            if (id.isEmpty() || !isAcceptedUrl(videoUrl)) return@mapNotNull null

            CatalogVideo(
                id = id,
                title = item.title?.trim().orEmpty(),
                description = item.description?.trim().orEmpty(),
                videoUrl = videoUrl,
                thumbnailUrl = item.thumbUrl?.takeIf(::isAcceptedUrl)
                    ?: item.thumbnail?.takeIf(::isAcceptedUrl),
                category = item.category?.trim().orEmpty(),
                author = item.author?.trim().orEmpty(),
                date = item.date?.trim().orEmpty(),
            )
        }
        if (input.isNotEmpty() && valid.isEmpty()) throw InvalidCatalogException()
        return valid
    }

    private fun isAcceptedUrl(value: String): Boolean = runCatching {
        val uri = URI(value)
        uri.isAbsolute && !uri.host.isNullOrBlank() &&
            (uri.scheme.equals("https", true) ||
                (allowCleartext && uri.scheme.equals("http", true)))
    }.getOrDefault(false)
}

internal class InvalidCatalogException : Exception()
