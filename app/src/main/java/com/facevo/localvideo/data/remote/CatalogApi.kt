package com.facevo.localvideo.data.remote

import retrofit2.http.GET

internal interface CatalogApi {
    @GET("api/catalog")
    suspend fun getCatalog(): CatalogResponseDto
}
