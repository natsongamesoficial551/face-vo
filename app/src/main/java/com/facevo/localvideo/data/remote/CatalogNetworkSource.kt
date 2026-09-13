package com.facevo.localvideo.data.remote

internal interface CatalogNetworkSource {
    suspend fun fetch(): CatalogResponseDto
}

internal class RetrofitCatalogNetworkSource(
    private val api: CatalogApi,
) : CatalogNetworkSource {
    override suspend fun fetch(): CatalogResponseDto = api.getCatalog()
}
