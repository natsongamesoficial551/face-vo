package com.facevo.localvideo.ui

import com.facevo.localvideo.domain.CatalogVideo

sealed interface CatalogUiState {
    data object Loading : CatalogUiState
    data class Content(val videos: List<CatalogVideo>, val fromCache: Boolean) : CatalogUiState
    data object Empty : CatalogUiState
    data class Error(val message: String, val canRetry: Boolean = true) : CatalogUiState
}
