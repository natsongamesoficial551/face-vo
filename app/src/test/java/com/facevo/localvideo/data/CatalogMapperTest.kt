package com.facevo.localvideo.data

import com.facevo.localvideo.data.remote.CatalogResponseDto
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test

class CatalogMapperTest {
    private val adapter = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()
        .adapter(CatalogResponseDto::class.java)

    @Test
    fun `maps real contract and ignores unknown fields`() {
        val response = adapter.fromJson(
            """{
                "version":186,
                "futureField":"ignored",
                "videos":[{
                    "id":" video-1 ",
                    "title":"Plantas",
                    "description":"Jardim",
                    "videoUrl":"https://facevo.example/media/video.mp4",
                    "thumbUrl":"https://facevo.example/media/thumb.jpg",
                    "thumbnail":"screenshots/thumb.jpg",
                    "category":"Plantas",
                    "author":"FaceVo",
                    "date":"01/09/2026",
                    "approved":true,
                    "order":1,
                    "unknown":42
                }]
            }""".trimIndent(),
        )!!

        val result = CatalogMapper(allowCleartext = false).map(response)

        assertEquals(listOf("video-1"), result.map { it.id })
        assertEquals("https://facevo.example/media/thumb.jpg", result.single().thumbnailUrl)
    }

    @Test
    fun `filters invalid items and preserves valid order`() {
        val response = adapter.fromJson(
            """{"videos":[
                {"id":"first","videoUrl":"https://facevo.example/1.mp4"},
                {"id":"","videoUrl":"https://facevo.example/2.mp4"},
                {"id":"unsafe","videoUrl":"http://facevo.example/3.mp4"},
                {"id":"last","videoUrl":"https://facevo.example/4.mp4"}
            ]}""",
        )!!

        val result = CatalogMapper(allowCleartext = false).map(response)

        assertEquals(listOf("first", "last"), result.map { it.id })
    }

    @Test
    fun `allows HTTP only when explicitly enabled`() {
        val response = adapter.fromJson(
            """{"videos":[{"id":"local","videoUrl":"http://10.0.2.2:8787/media/video.mp4"}]}""",
        )!!

        assertEquals(1, CatalogMapper(allowCleartext = true).map(response).size)
        assertThrows(InvalidCatalogException::class.java) {
            CatalogMapper(allowCleartext = false).map(response)
        }
    }

    @Test
    fun `invalid optional thumbnail is removed`() {
        val response = adapter.fromJson(
            """{"videos":[{"id":"one","videoUrl":"https://facevo.example/1.mp4","thumbUrl":"file:///tmp/a.jpg"}]}""",
        )!!

        assertNull(CatalogMapper(allowCleartext = false).map(response).single().thumbnailUrl)
    }
}
