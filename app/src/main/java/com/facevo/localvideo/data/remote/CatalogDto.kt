package com.facevo.localvideo.data.remote

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = false)
internal data class CatalogResponseDto(
    val version: Long? = null,
    val videos: List<CatalogVideoDto>? = null,
)

@JsonClass(generateAdapter = false)
internal data class CatalogVideoDto(
    val id: String? = null,
    val title: String? = null,
    val description: String? = null,
    val thumbnail: String? = null,
    val videoUrl: String? = null,
    val thumbUrl: String? = null,
    val category: String? = null,
    val author: String? = null,
    val date: String? = null,
)
