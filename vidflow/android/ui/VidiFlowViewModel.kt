package com.vidismart.vidiflow.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidismart.vidiflow.data.ChatMessage
import com.vidismart.vidiflow.data.ChatRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class VidiFlowUiState(
    val messages: List<ChatMessage> = emptyList(),
    val input: String = "",
    val streaming: Boolean = false,
)

class VidiFlowViewModel(
    private val repository: ChatRepository = ChatRepository(),
) : ViewModel() {
    private val _state = MutableStateFlow(VidiFlowUiState())
    val state: StateFlow<VidiFlowUiState> = _state.asStateFlow()

    fun onInputChange(value: String) {
        _state.update { it.copy(input = value) }
    }

    fun send() {
        val text = _state.value.input.trim()
        if (text.isEmpty() || _state.value.streaming) return

        val userMsg = ChatMessage(role = "user", content = text)
        _state.update {
            it.copy(
                messages = it.messages + userMsg,
                input = "",
                streaming = true,
            )
        }

        viewModelScope.launch {
            val history = _state.value.messages
            var assistant = ChatMessage(role = "assistant", content = "")
            _state.update { it.copy(messages = it.messages + assistant) }

            try {
                repository.streamChat(history).collect { token ->
                    assistant = assistant.copy(content = assistant.content + token)
                    _state.update { st ->
                        val msgs = st.messages.toMutableList()
                        if (msgs.isNotEmpty() && msgs.last().role == "assistant") {
                            msgs[msgs.lastIndex] = assistant
                        }
                        st.copy(messages = msgs)
                    }
                }
            } catch (e: Exception) {
                val err = ChatMessage(
                    role = "assistant",
                    content = "[error] ${e.message ?: e::class.java.simpleName}",
                )
                _state.update { it.copy(messages = it.messages.dropLast(1) + err) }
            } finally {
                _state.update { it.copy(streaming = false) }
            }
        }
    }
}
