package com.facevo.localvideo.domain

data class CatalogVideo(
    val id: String,
    val title: String,
    val description: String,
    val videoUrl: String,
    val thumbnailUrl: String?,
    val category: String,
    val author: String,
    val date: String,
)
