package net.vidismart.lexi.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** A term the user kept in their Smart Stack. */
data class SavedTerm(
    val acr: String,
    val full: String,
    val oneLiner: String,
    val note: String,
    val savedAt: String,
    val source: String
)

/**
 * Smart Stack storage.
 *
 * v0.1 persists one small JSON document in the app's private files dir so the schema stays
 * byte-compatible with the Chrome extension's `chrome.storage.local.notes` record
 * (`{term, full, oneLiner, url, note, savedAt}`) — export/import works in both directions.
 * M2 can swap the backing file for Room without touching callers.
 */
class StackStore(context: Context) {

    private val appContext = context.applicationContext
    private val file = File(appContext.filesDir, FILE_NAME)

    /** Newest first. */
    fun all(): List<SavedTerm> = read().sortedByDescending { it.savedAt }

    fun isSaved(acr: String): Boolean = read().any { it.acr.equals(acr, ignoreCase = true) }

    fun count(): Int = read().size

    /** @return true when the term was newly added, false when it was already in the stack. */
    fun add(term: Term, source: String = "Lexi for Android"): Boolean {
        val current = read()
        if (current.any { it.acr.equals(term.acr, ignoreCase = true) }) return false
        current.add(
            SavedTerm(
                acr = term.acr,
                full = term.full,
                oneLiner = term.oneLiner,
                note = "",
                savedAt = nowIso(),
                source = source
            )
        )
        write(current)
        return true
    }

    fun removeByAcr(acr: String) {
        write(read().filterNot { it.acr.equals(acr, ignoreCase = true) })
    }

    fun updateNote(acr: String, note: String) {
        write(read().map { if (it.acr.equals(acr, ignoreCase = true)) it.copy(note = note) else it })
    }

    fun clear() = write(emptyList())

    /* ----------------------------- export / import ----------------------------- */

    /** Same shape as the Chrome extension's "lexi-stack-backup-*.json", so either side can restore the other. */
    fun exportJson(): String {
        val array = JSONArray()
        all().forEach { n ->
            array.put(
                JSONObject()
                    .put("term", n.acr)
                    .put("full", n.full)
                    .put("oneLiner", n.oneLiner)
                    .put("url", n.source)
                    .put("note", n.note)
                    .put("savedAt", n.savedAt)
            )
        }
        return JSONObject()
            .put("exportedAt", nowIso())
            .put("count", array.length())
            .put("notes", array)
            .toString(2)
    }

    /**
     * Restores from a study-package backup (`{"notes":[...]}` or a bare array).
     * @return how many terms were newly added.
     */
    fun importJson(raw: String): Int {
        val incoming = try {
            val trimmed = raw.trim()
            val array = if (trimmed.startsWith("[")) JSONArray(trimmed)
            else JSONObject(trimmed).optJSONArray("notes") ?: JSONArray()
            (0 until array.length()).mapNotNull { i -> array.optJSONObject(i) }
        } catch (e: Exception) {
            emptyList()
        }
        if (incoming.isEmpty()) return 0
        val current = read()
        var added = 0
        incoming.forEach { o ->
            val acr = o.str("term").ifBlank { o.str("acr") }
            if (acr.isBlank() || current.any { it.acr.equals(acr, ignoreCase = true) }) return@forEach
            current.add(
                SavedTerm(
                    acr = acr,
                    full = o.str("full"),
                    oneLiner = o.str("oneLiner"),
                    note = o.str("note"),
                    savedAt = o.str("savedAt").ifBlank { nowIso() },
                    source = o.str("url").ifBlank { o.str("source") }
                )
            )
            added++
        }
        if (added > 0) write(current)
        return added
    }

    /** Standalone dark-themed study package — the same document `popup.js` produces. */
    fun buildHtml(lookup: (String) -> Term?): String {
        val stamp = stamp()
        val notes = all()
        val sections = notes.joinToString("\n") { n ->
            val term = lookup(n.acr)
            val anatomy = term?.anatomy.orEmpty().joinToString("") { a ->
                "<li><strong>${esc(a.letter)} &mdash; ${esc(a.word)}</strong> " +
                    "<em>(${esc(a.role)})</em>: ${esc(a.desc)}</li>"
            }
            buildString {
                append("<section>")
                append("<h2>${esc(n.acr)} <span>${esc(n.full.ifBlank { term?.full.orEmpty() })}</span></h2>")
                append("<p class=\"one\">${esc(n.oneLiner.ifBlank { term?.oneLiner.orEmpty() })}</p>")
                term?.origin?.takeIf { it.isNotBlank() }?.let { append("<p class=\"origin\">Origin: ${esc(it)}</p>") }
                if (anatomy.isNotEmpty()) append("<ul>$anatomy</ul>")
                if (n.note.isNotBlank()) append("<p class=\"note\">My note: ${esc(n.note)}</p>")
                append("<p class=\"meta\">Saved ${esc(n.savedAt.take(10))} &middot; ${esc(n.source)}</p>")
                append("</section>")
            }
        }
        return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n" +
            "<title>Lexi &mdash; Study Package ($stamp)</title>\n<style>" +
            "body{background:#0b0f1e;color:#e5f6ff;font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:32px 20px;}" +
            "h1{color:#00e5ff;} h1 span{color:#a78bfa;}" +
            "section{border:1px solid rgba(0,229,255,.3);border-radius:12px;padding:16px 18px;margin:16px 0;background:rgba(13,20,38,.92);}" +
            "h2{color:#00e5ff;margin:0 0 6px;} h2 span{color:#a78bfa;font-size:14px;}" +
            ".one{color:#dbeafe;} .origin,.meta{color:#94a3b8;font-size:12px;} .note{color:#fbbf24;}" +
            "ul{margin:8px 0 0 18px;} li{margin:4px 0;}" +
            "</style>\n</head>\n<body>\n" +
            "<h1>Le<span>xi</span> &mdash; Study Package</h1>\n" +
            "<p class=\"meta\">${notes.size} terms &middot; exported $stamp &middot; Lexi for Android</p>\n" +
            sections + "\n</body>\n</html>"
    }

    private fun esc(value: String?): String = (value ?: "").replace("&", "&amp;")
        .replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    /* ------------------------------- persistence ------------------------------- */

    private fun read(): MutableList<SavedTerm> {
        if (!file.exists()) return mutableListOf()
        return try {
            val array = JSONObject(file.readText()).optJSONArray("notes") ?: JSONArray()
            MutableList(array.length()) { i ->
                val o = array.optJSONObject(i) ?: JSONObject()
                SavedTerm(
                    acr = o.str("term").ifBlank { o.str("acr") },
                    full = o.str("full"),
                    oneLiner = o.str("oneLiner"),
                    note = o.str("note"),
                    savedAt = o.str("savedAt"),
                    source = o.str("url").ifBlank { o.str("source") }
                )
            }
        } catch (e: Exception) {
            mutableListOf()
        }
    }

    private fun write(notes: List<SavedTerm>) {
        try {
            val array = JSONArray()
            notes.forEach { n ->
                array.put(
                    JSONObject()
                        .put("term", n.acr)
                        .put("full", n.full)
                        .put("oneLiner", n.oneLiner)
                        .put("note", n.note)
                        .put("savedAt", n.savedAt)
                        .put("url", n.source)
                )
            }
            file.writeText(JSONObject().put("version", 1).put("notes", array).toString())
        } catch (e: Exception) {
            // Storage failures must never crash the decoder.
        }
    }

    companion object {
        private const val FILE_NAME = "lexi-stack.json"
        private const val ISO = "yyyy-MM-dd'T'HH:mm:ss'Z'"

        fun nowIso(): String = SimpleDateFormat(ISO, Locale.US).format(Date())

        fun stamp(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    }
}
