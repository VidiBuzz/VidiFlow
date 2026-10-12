package net.vidismart.lexi.data

/** One letter of an acronym's "word anatomy". */
data class AnatomyPart(
    val letter: String,
    val word: String,
    val role: String,
    val desc: String,
    val icon: String
)

/** One step of the system data flowchart. */
data class FlowStep(
    val step: String,
    val title: String,
    val desc: String,
    val icon: String,
    val active: Boolean
)

/** A ranked brand/tool in the term's ecosystem. */
data class Brand(
    val name: String,
    val share: String,
    val tag: String
)

/**
 * A single LEX term. Field names mirror `lex/data/seed-unified.json` (the canonical seed)
 * so the Android app, the Chrome extension and the web app speak the same schema.
 */
data class Term(
    val acr: String,
    val full: String,
    val dept: String,
    val oneLiner: String,
    val notes: String,
    val origin: String,
    val conceptDesc: String,
    val conceptImg: String,
    val conceptVideo: String,
    val keywords: List<String>,
    val anatomy: List<AnatomyPart>,
    val flow: List<FlowStep>,
    val brands: List<Brand>,
    val replaces: List<String>,
    val connectsWith: List<String>
) {
    /** Single letter used by the list "avatar" (falls back to '#' for non-alphabetic acronyms). */
    val initial: String
        get() = acr.trim().firstOrNull()?.uppercase() ?: "#"
}
