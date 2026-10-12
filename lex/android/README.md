# Lexi for Android (M0)

Native Android client for Lexi: decode tech acronyms **anywhere on the device** by selecting text
and choosing "Lexi" from the selection menu, then build your own Smart Stack.

Plan of record: `M:\code\vidismart\plans\lexi-extension-android-plan.md` (§3 Part B).
Desktop parity lives in the same folder — `lex/extension/` (Chrome MV3) and `lex/app/` (web).

## Status (2026-09-28)

| Milestone | State |
|---|---|
| **M0** project skeleton, dictionary + term detail from the canonical seed | ✅ written, **not yet compiled** (see Prerequisites) |
| **M1** system-wide decode (`ACTION_PROCESS_TEXT` + `ACTION_SEND` + `lexi://decode`) | ✅ code written (manifest + `ProcessTextActivity` + `SendTextActivity`) |
| **M2** Smart Stack + export/import | ✅ code written (`StackStore`, share sheet, JSON backup) |
| **M3** optional floating "Lexi bubble" | ⬜ not started (Play policy work required) |
| **M4** `terms.json` sync from R2 | ⬜ not started (`TermRepository.refreshFromNetwork` is the hook) |

## Prerequisites (this machine has none of these)

1. **JDK 17+** and **Android Studio** (or Android SDK command-line tools) — this workstation has
   no Android SDK, no Android Studio and no JDK, so the first build must happen elsewhere
   (or in GitHub Actions with `android-actions/setup-android`).
2. First open: Android Studio will point at `gradle/wrapper/gradle-wrapper.properties`
   (Gradle **8.11.1**, required by AGP 8.7.x). The binary `gradle-wrapper.jar` is **not** in git —
   let Android Studio use its bundled Gradle, then run the `wrapper` task once to generate
   `gradlew` / `gradlew.bat` / `gradle-wrapper.jar`.
3. `compileSdk` / `targetSdk` = **35**, `minSdk` = **26**, JDK target 17, AGP 8.7.3, Kotlin 2.0.21,
   Compose BOM 2024.10.01.

## Data — one source of truth, zero copies

`app/build.gradle.kts` contains:

```kotlin
sourceSets["main"].assets.srcDir("../../data")
```

so the app ships **`lex/data/seed-unified.json` itself** (the canonical 15-term seed the extension
pipeline writes). Editing `lex/data/seed-unified.json` changes the app on the next build — there is
no copy step to forget. `TermRepository` parses it with the platform's `org.json`; when M4 lands,
`refreshFromNetwork()` swaps in `https://cdn.vidi.news/lexi/terms.json` (the same file the Chrome
extension syncs), so one publish updates both clients.

> The asset source set ships the whole `lex/data/` folder (a few hundred KB, no secrets).
> Concept images are read from `https://cdn.vidi.news/images/lexi/<ACR>.jpg`.

## How the selection menu works

* `ProcessTextActivity` — `ACTION_PROCESS_TEXT` (`text/plain`). This is what puts
  **"Lexi — decode this term"** in the selection menu of Chrome, Docs, Gmail, Slack, PDFs…
* `SendTextActivity` — `ACTION_SEND` (`text/plain`) for apps without a selection API.
* Both forward the text to `MainActivity` (`EXTRA_DECODE_TEXT`) and finish; `lexi://decode?q=RAG`
  is handled as a deep link.
* `MainActivity` opens the **Decode** tab, which resolves exact acronym → token → multi-word
  acronym → keyword, and lists every term found in a longer selection.

## Signing (needed for Play)

```properties
# lex/android/keystore.properties  (gitignored — copy from keystore.properties.example)
storeFile=C:/secure/lexi-release.jks
storePassword=…
keyAlias=lexi
keyPassword=…
```
Keep the real keystore outside the repo **and backed up**: Play updates must be signed with it.
Without this file the module still builds — only `bundleRelease` skips signing.

## Build

```powershell
cd M:\code\vidismart\lex\android
.\gradlew.bat :app:assembleDebug     # debug APK  (applicationId net.vidismart.lexi.debug)
.\gradlew.bat :app:bundleRelease     # Play AAB  (needs keystore.properties)
.\gradlew.bat :app:installDebug      # to a connected device
```

## Manual smoke test for M1

1. Install the debug APK.
2. In Chrome: open any page, long-press **RAG** → the text menu shows **Lexi — decode this term**.
3. Tap it: Lexi opens on the Decode tab with the card for *Retrieval-Augmented Generation*.
4. Tap **Save** → Stack tab shows 1 term; add a note; export the study package (HTML) via the
   share sheet and open it in Chrome.
5. Open the Lexi dictionary tab: all 15 seeded terms must be listed and searchable.

## Layout

```
app/src/main/java/net/vidismart/lexi/
├── MainActivity.kt            tabs (Dictionary / Decode / Stack), detail routing, intent intake
├── data/Term.kt               Term, AnatomyPart, FlowStep, Brand
├── data/TermRepository.kt     seed JSON → List<Term>, search, resolve, decodeAll, M4 sync hook
├── data/StackStore.kt         Smart Stack JSON, import/export (extension-compatible), study-package HTML
├── share/ProcessTextActivity.kt, SendTextActivity.kt, Exporter.kt
└── ui/                        LexiTheme, DictionaryScreen, TermDetailScreen, DecodeScreen,
                              StackScreen, CdnImage
```
