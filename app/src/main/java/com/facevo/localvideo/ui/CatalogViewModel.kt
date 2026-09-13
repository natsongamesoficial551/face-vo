package com.facevo.localvideo.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.facevo.localvideo.data.CatalogRepository
import com.facevo.localvideo.data.CatalogResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class CatalogViewModel(
    private val repository: CatalogRepository,
) : ViewModel() {
    private val mutableState = MutableStateFlow<CatalogUiState>(CatalogUiState.Loading)
    val state: StateFlow<CatalogUiState> = mutableState.asStateFlow()
    private var refreshJob: Job? = null

    init {
        refresh()
    }

    fun retry() = refresh()

    private fun refresh() {
        refreshJob?.cancel()
        mutableState.value = CatalogUiState.Loading
        refreshJob = viewModelScope.launch {
            mutableState.value = when (val result = repository.refresh()) {
                is CatalogResult.Success -> if (result.videos.isEmpty()) {
                    CatalogUiState.Empty
                } else {
                    CatalogUiState.Content(result.videos, result.fromCache)
                }
                CatalogResult.Failure -> CatalogUiState.Error(
                    message = "Nao foi possivel carregar os videos. Tente novamente.",
                )
            }
        }
    }
}

class CatalogViewModelFactory(
    private val repository: CatalogRepository,
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        require(modelClass.isAssignableFrom(CatalogViewModel::class.java))
        return CatalogViewModel(repository) as T
    }
}
