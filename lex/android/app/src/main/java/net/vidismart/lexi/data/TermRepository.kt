package net.vidismart.lexi.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Reads the canonical LEX dictionary that ships as an app asset.
 *
 * The asset is `lex/data/seed-unified.json` itself — `app/build.gradle.kts` points the
 * `assets` source set at `../../data`, so there is no copy step and no drift.
 * When M4 lands, [refreshFromNetwork] replaces the in-memory list with
 * `https://cdn.vidi.news/lexi/terms.json` (the same payload the extension syncs).
 */
class TermRepository(private val context: Context) {

    private var loaded: List<Term> = emptyList()

    /** All terms, sorted alphabetically by acronym. */
    val terms: List<Term>
        get() {
            if (loaded.isEmpty()) loaded = readAsset()
            return loaded
        }

    private val byKey: Map<String, Term>
        get() = terms.associateBy { it.acr.uppercase() }

    val count: Int get() = terms.size

    /** Direct acronym lookup, case-insensitive; tolerant of trailing punctuation. */
    fun byAcr(acr: String?): Term? {
        val key = acr?.trim()?.uppercase()?.trimEnd('.', ',', ':', ';', '!', '?') ?: return null
        return byKey[key]
    }

    /** Dictionary search across acronym, expansion, department and keywords. */
    fun search(query: String): List<Term> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return terms
        return terms.filter { t ->
            t.acr.lowercase().contains(q) ||
                t.full.lowercase().contains(q) ||
                t.dept.lowercase().contains(q) ||
                t.oneLiner.lowercase().contains(q) ||
                t.keywords.any { it.lowercase().contains(q) }
        }
    }

    /**
     * The Android equivalent of hovering: map a text selection (or shared text) to one term.
     * Order: exact acronym -> acronym after stripping punctuation -> any token -> multi-word
     * acronym inside the text -> keyword hit. Returns null when nothing matches.
     */
    fun resolve(raw: String?): Term? {
        val text = raw?.trim().orEmpty()
        if (text.isEmpty()) return null

        byAcr(text)?.let { return it }

        for (token in TOKEN.split(text)) {
            if (token.isNotBlank()) byAcr(token)?.let { return it }
        }

        // Multi-word acronyms such as "Cloudflare KV" appear verbatim inside a sentence.
        for (t in terms.sortedByDescending { it.acr.length }) {
            if (containsWord(text, t.acr)) return t
        }

        // Keyword fallback: "vector database" -> RAG.
        val lower = text.lowercase()
        for (t in terms) {
            if (t.keywords.any { it.isNotBlank() && (lower == it.lowercase() || containsWord(text, it)) }) return t
        }
        return null
    }

    /** Every term mentioned inside a blob of text (used by the Decode tab). */
    fun decodeAll(raw: String?): List<Term> {
        val text = raw?.trim().orEmpty()
        if (text.isEmpty()) return emptyList()
        return terms
            .filter { containsWord(text, it.acr) }
            .sortedBy { text.uppercase().indexOf(it.acr.uppercase()) }
    }

    /** Replaces the bundled list with a network payload (M4: terms.json). */
    fun refreshFromNetwork(json: String): Int {
        val parsed = parse(json, CDN_BASE_FALLBACK)
        if (parsed.isNotEmpty()) loaded = parsed
        return parsed.size
    }

    private fun containsWord(haystack: String, needle: String): Boolean {
        if (needle.isBlank()) return false
        return Regex("(?i)\\b" + Regex.escape(needle) + "s?\\b").containsMatchIn(haystack)
    }

    private fun readAsset(): List<Term> = try {
        val json = context.assets.open(ASSET_NAME).bufferedReader().use { it.readText() }
        parse(json, CDN_BASE_FALLBACK)
    } catch (e: Exception) {
        emptyList()
    }

    private fun parse(json: String, fallbackBase: String): List<Term> = try {
        val root = JSONObject(json)
        val base = root.str("cdn_base").ifBlank { fallbackBase }
        val array = root.optJSONArray("terms") ?: JSONArray()
        (0 until array.length())
            .mapNotNull { i -> array.optJSONObject(i)?.let { toTerm(it, base) } }
            .filter { it.acr.isNotBlank() }
            .sortedBy { it.acr.uppercase() }
    } catch (e: Exception) {
        emptyList()
    }

    private fun toTerm(o: JSONObject, cdnBase: String): Term = Term(
        acr = o.str("acr"),
        full = o.str("full"),
        dept = o.str("dept"),
        oneLiner = o.str("oneLiner"),
        notes = o.str("notes"),
        origin = o.str("origin"),
        conceptDesc = o.str("conceptDesc"),
        conceptImg = absolute(cdnBase, o.str("conceptImg")),
        conceptVideo = absolute(cdnBase, o.str("conceptVideo")),
        keywords = o.strList("keywords"),
        anatomy = o.objList("anatomy") { a ->
            AnatomyPart(a.str("letter"), a.str("word"), a.str("role"), a.str("desc"), a.str("icon"))
        },
        flow = o.objList("flow") { f ->
            FlowStep(
                f.str("step"), f.str("title"), f.str("desc"), f.str("icon"),
                f.optBoolean("active", false)
            )
        },
        brands = o.objList("brands") { b -> Brand(b.str("name"), b.str("share"), b.str("tag")) },
        replaces = o.strList("replaces"),
        connectsWith = o.strList("connectsWith")
    )

    /** Turns `images/lexi/CRM.jpg` + cdn_base into an absolute CDN URL. */
    private fun absolute(cdnBase: String, path: String): String {
        if (path.isBlank()) return ""
        if (path.contains("://")) return path
        val base = if (cdnBase.endsWith("/")) cdnBase else "$cdnBase/"
        return base + path.substringAfterLast('/')
    }

    companion object {
        const val ASSET_NAME = "seed-unified.json"
        const val CDN_BASE_FALLBACK = "https://cdn.vidi.news/images/lexi/"
        const val TERMS_URL = "https://cdn.vidi.news/lexi/terms.json"

        private val TOKEN = Regex("[^A-Za-z0-9]+")
    }
}

/* ---------- small org.json helpers (kept here so the parser stays readable) ---------- */

internal fun JSONObject.str(key: String): String {
    if (isNull(key)) return ""
    val raw = optString(key, "")
    return if (raw == "null") "" else raw.trim()
}

internal fun JSONObject.strList(key: String): List<String> {
    val array = optJSONArray(key) ?: return emptyList()
    return (0 until array.length()).mapNotNull { i ->
        array.optString(i, "").takeIf { it.isNotBlank() }?.trim()
    }
}

internal fun <T> JSONObject.objList(key: String, map: (JSONObject) -> T): List<T> {
    val array = optJSONArray(key) ?: return emptyList()
    return (0 until array.length()).mapNotNull { i -> array.optJSONObject(i)?.let(map) }
}
