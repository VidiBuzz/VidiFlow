package com.vidismart.vidiflow.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Streams assistant tokens from the FastAPI SSE proxy.
 * Emulator default: http://10.0.2.2:8080
 */
class ChatRepository(
    private val baseUrl: String = "http://10.0.2.2:8080",
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS) // SSE: no read timeout
        .build(),
) {
    fun streamChat(messages: List<ChatMessage>): Flow<String> = flow {
        val arr = JSONArray()
        messages.forEach { m ->
            arr.put(
                JSONObject()
                    .put("role", m.role)
                    .put("content", m.content),
            )
        }
        val bodyJson = JSONObject().put("messages", arr).toString()
        val body = bodyJson.toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url("$baseUrl/chat/stream")
            .post(body)
            .header("Accept", "text/event-stream")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                emit("[error ${response.code}] ${response.message}")
                return@flow
            }
            val source = response.body?.source() ?: return@flow
            while (!source.exhausted()) {
                val line = source.readUtf8Line() ?: break
                if (!line.startsWith("data:")) continue
                val payload = line.removePrefix("data:").trim()
                if (payload == "[DONE]") break
                if (payload.isNotEmpty()) emit(payload)
            }
        }
    }.flowOn(Dispatchers.IO)
}
