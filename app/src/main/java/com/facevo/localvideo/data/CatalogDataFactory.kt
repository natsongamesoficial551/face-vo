package com.facevo.localvideo.data

import android.content.Context
import com.facevo.localvideo.BuildConfig
import com.facevo.localvideo.data.cache.FileCatalogCache
import com.facevo.localvideo.data.remote.CatalogApi
import com.facevo.localvideo.data.remote.RetrofitCatalogNetworkSource
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.net.URI
import java.util.concurrent.TimeUnit

object CatalogDataFactory {
    fun create(context: Context): CatalogRepository {
        check(BuildConfig.DEBUG || URI(BuildConfig.API_BASE_URL).scheme.equals("https", true)) {
            "Production API URL must use HTTPS"
        }
        val moshi = Moshi.Builder().addLast(KotlinJsonAdapterFactory()).build()
        val client = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .callTimeout(30, TimeUnit.SECONDS)
            .build()
        val api = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(CatalogApi::class.java)
        return DefaultCatalogRepository(
            network = RetrofitCatalogNetworkSource(api),
            cache = FileCatalogCache(context.cacheDir, moshi, allowCleartext = BuildConfig.DEBUG),
            mapper = CatalogMapper(allowCleartext = BuildConfig.DEBUG),
        )
    }
}
