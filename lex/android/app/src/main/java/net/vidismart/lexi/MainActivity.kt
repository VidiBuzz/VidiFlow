package net.vidismart.lexi

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import net.vidismart.lexi.data.StackStore
import net.vidismart.lexi.data.Term
import net.vidismart.lexi.data.TermRepository
import net.vidismart.lexi.share.Exporter
import net.vidismart.lexi.ui.DecodeScreen
import net.vidismart.lexi.ui.DictionaryScreen
import net.vidismart.lexi.ui.LexiDim
import net.vidismart.lexi.ui.LexiTheme
import net.vidismart.lexi.ui.StackScreen
import net.vidismart.lexi.ui.TermDetailScreen

class MainActivity : ComponentActivity() {

    private val incoming = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        consume(intent)
        val repository = TermRepository(applicationContext)
        val store = StackStore(applicationContext)
        setContent { LexiTheme { LexiApp(repository, store, incoming) } }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        consume(intent)
    }

    /** Accepts a selection handed over by ProcessTextActivity/SendTextActivity or a lexi:// link. */
    private fun consume(intent: Intent?) {
        val fromExtra = intent?.getStringExtra(EXTRA_DECODE_TEXT)
        val fromLink = intent?.data?.getQueryParameter("q")
        val text = fromExtra?.takeIf { it.isNotBlank() } ?: fromLink?.takeIf { it.isNotBlank() }
        if (text != null) incoming.value = text
    }

    companion object {
        const val EXTRA_DECODE_TEXT = "net.vidismart.lexi.DECODE_TEXT"
    }
}

private const val TAB_DICTIONARY = 0
private const val TAB_DECODE = 1
private const val TAB_STACK = 2

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LexiApp(
    repository: TermRepository,
    store: StackStore,
    incoming: MutableState<String?>
) {
    val context = LocalContext.current
    var tab by remember { mutableIntStateOf(TAB_DICTIONARY) }
    var selected by remember { mutableStateOf<Term?>(null) }
    var stack by remember { mutableStateOf(store.all()) }

    val savedAcrs = remember(stack) { stack.map { it.acr.uppercase() }.toSet() }
    val openTerm: (Term) -> Unit = { term -> selected = term }
    val saveTerm: (Term) -> Unit = { term ->
        store.add(term, "Lexi for Android")
        stack = store.all()
        selected = null
    }

    // M2: restore a stack exported from the Chrome extension.
    val importLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            val raw = runCatching {
                context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
            }.getOrNull()
            if (!raw.isNullOrBlank()) {
                store.importJson(raw)
                stack = store.all()
            }
        }
    }

    // A selection arrived: show it on the Decode tab and consume the one-shot value.
    // Done in an effect (never during composition) to keep the snapshot state consistent;
    // DecodeScreen's own LaunchedEffect still receives the text from this same pass.
    val pending = incoming.value
    LaunchedEffect(pending) {
        if (pending != null) {
            tab = TAB_DECODE
            incoming.value = null
        }
    }

    val open = selected
    if (open != null) {
        TermDetailScreen(
            term = open,
            isSaved = savedAcrs.contains(open.acr.uppercase()),
            onSave = { saveTerm(open) },
            onBack = { selected = null }
        )
        return
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Lexi", fontWeight = FontWeight.Black, fontSize = 20.sp)
                        Text(
                            "${repository.count} terms · decode tech speak anywhere",
                            color = LexiDim,
                            fontSize = 11.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                NavigationBarItem(
                    selected = tab == TAB_DICTIONARY,
                    onClick = { tab = TAB_DICTIONARY },
                    icon = { Text("Aa") },
                    label = { Text("Dictionary") }
                )
                NavigationBarItem(
                    selected = tab == TAB_DECODE,
                    onClick = { tab = TAB_DECODE },
                    icon = { Text("L>") },
                    label = { Text("Decode") }
                )
                NavigationBarItem(
                    selected = tab == TAB_STACK,
                    onClick = { tab = TAB_STACK },
                    icon = { Text("★") },
                    label = { Text("Stack ${stack.size}") }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (tab) {
                TAB_DICTIONARY -> DictionaryScreen(
                    search = { repository.search(it) },
                    savedAcrs = savedAcrs,
                    onOpen = openTerm
                )

                TAB_DECODE -> DecodeScreen(
                    initialText = pending,
                    decode = { repository.resolve(it) },
                    decodeAll = { repository.decodeAll(it) },
                    isSaved = { store.isSaved(it) },
                    onOpen = openTerm,
                    onSave = saveTerm
                )

                else -> StackScreen(
                    saved = stack,
                    onOpen = { acr -> repository.byAcr(acr)?.let { openTerm(it) } },
                    onRemove = { acr -> store.removeByAcr(acr); stack = store.all() },
                    onNoteChange = { acr, note -> store.updateNote(acr, note); stack = store.all() },
                    onExportHtml = {
                        Exporter.shareFile(
                            context,
                            "lexi-study-package-${StackStore.stamp()}.html",
                            "text/html",
                            store.buildHtml { acr -> repository.byAcr(acr) },
                            "Share your Lexi study package"
                        )
                    },
                    onExportJson = {
                        Exporter.shareFile(
                            context,
                            "lexi-stack-backup-${StackStore.stamp()}.json",
                            "application/json",
                            store.exportJson(),
                            "Share your Lexi stack backup"
                        )
                    },
                    onImport = { importLauncher.launch("application/json") },
                    onClear = { store.clear(); stack = store.all() }
                )
            }
        }
    }
}
