package com.facevo.localvideo.data

import com.facevo.localvideo.data.cache.CatalogCache
import com.facevo.localvideo.data.remote.CatalogNetworkSource
import com.facevo.localvideo.domain.CatalogVideo
import kotlinx.coroutines.CancellationException

interface CatalogRepository {
    suspend fun refresh(): CatalogResult
}

sealed interface CatalogResult {
    data class Success(val videos: List<CatalogVideo>, val fromCache: Boolean) : CatalogResult
    data object Failure : CatalogResult
}

internal class DefaultCatalogRepository(
    private val network: CatalogNetworkSource,
    private val cache: CatalogCache,
    private val mapper: CatalogMapper,
) : CatalogRepository {
    override suspend fun refresh(): CatalogResult {
        return try {
            val videos = mapper.map(network.fetch())
            try {
                cache.write(videos)
            } catch (error: CancellationException) {
                throw error
            } catch (_: Exception) {
                // Fresh validated content remains usable even when persistence fails.
            }
            CatalogResult.Success(videos, fromCache = false)
        } catch (error: CancellationException) {
            throw error
        } catch (error: Exception) {
            readCache()?.let { CatalogResult.Success(it, fromCache = true) }
                ?: CatalogResult.Failure
        }
    }

    private suspend fun readCache(): List<CatalogVideo>? = try {
        cache.read()
    } catch (error: CancellationException) {
        throw error
    } catch (error: Exception) {
        null
    }
}
