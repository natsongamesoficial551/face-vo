package com.facevo.localvideo.data.cache

import com.facevo.localvideo.domain.CatalogVideo

internal interface CatalogCache {
    suspend fun read(): List<CatalogVideo>?
    suspend fun write(videos: List<CatalogVideo>)
}
