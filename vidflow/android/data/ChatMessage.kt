package com.vidismart.vidiflow.data

import java.util.UUID

enum class MessageRole {
    USER, ASSISTANT, SYSTEM
}

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: MessageRole,
    val content: String,
    val isStreaming: Boolean = false
)
