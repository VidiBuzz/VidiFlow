package net.vidismart.lexi.ui

import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import net.vidismart.lexi.data.Term

/**
 * The Decode tab — the Android stand-in for hovering.
 * This is where `ACTION_PROCESS_TEXT` / `ACTION_SEND` selections land, and where users
 * can paste a whole sentence to see every term Lexi recognises inside it.
 */
@Composable
fun DecodeScreen(
    initialText: String?,
    decode: (String) -> Term?,
    decodeAll: (String) -> List<Term>,
    isSaved: (String) -> Boolean,
    onOpen: (Term) -> Unit,
    onSave: (Term) -> Unit
) {
    val context = LocalContext.current
    var text by remember { mutableStateOf("") }
    var searched by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf("Paste or type text, then decode.") }

    val primary = if (searched) decode(text) else null
    val mentioned = if (searched && primary == null) decodeAll(text) else emptyList()

    LaunchedEffect(initialText) {
        if (!initialText.isNullOrBlank()) {
            text = initialText
            searched = true
            message = "Decoded selection."
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("DECODE ANY TEXT", color = LexiViolet, fontSize = 11.sp, fontWeight = FontWeight.Black)

        OutlinedTextField(
            value = text,
            onValueChange = { text = it; searched = false },
            minLines = 3,
            label = { Text("Selection, sentence or pasted text") },
            modifier = Modifier.fillMaxWidth()
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { searched = true; message = "" }, modifier = Modifier.weight(1f)) {
                Text("Decode")
            }
            OutlinedButton(
                onClick = {
                    val clip = (context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager)
                        ?.primaryClip?.getItemAt(0)?.coerceToText(context)?.toString()
                    if (!clip.isNullOrBlank()) {
                        text = clip
                        searched = true
                        message = "Pasted from clipboard."
                    } else {
                        message = "Clipboard is empty."
                    }
                },
                modifier = Modifier.weight(1f)
            ) { Text("Paste") }
        }

        TextButton(onClick = { text = ""; searched = false; message = "Cleared." }) {
            Text("Clear", color = LexiDim)
        }

        if (message.isNotBlank()) Text(message, color = LexiDim, fontSize = 12.sp)

        if (searched && text.isNotBlank()) {
            if (primary != null) {
                Text("MATCH", color = LexiCyan, fontSize = 11.sp, fontWeight = FontWeight.Black)
                TermCard(
                    term = primary,
                    isSaved = isSaved(primary.acr),
                    onOpen = { onOpen(primary) },
                    onSave = { onSave(primary) }
                )
            } else if (mentioned.isEmpty()) {
                Text(
                    "No LEX term found in this text yet — v0.1 ships 15 curated terms; " +
                        "the dictionary grows via cdn.vidi.news/lexi/terms.json.",
                    color = LexiDim,
                    fontSize = 12.sp
                )
            } else {
                Text(
                    "${mentioned.size} TERMS FOUND",
                    color = LexiCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black
                )
                mentioned.forEach { hit ->
                    TermCard(
                        term = hit,
                        isSaved = isSaved(hit.acr),
                        onOpen = { onOpen(hit) },
                        onSave = { onSave(hit) }
                    )
                }
            }
        }
        Box(modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
private fun TermCard(term: Term, isSaved: Boolean, onOpen: () -> Unit, onSave: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable(onClick = onOpen),
        colors = CardDefaults.cardColors(containerColor = LexiCard)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(term.acr, color = LexiCyan, fontWeight = FontWeight.Black, fontSize = 16.sp)
                Text(term.full, color = LexiViolet, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(term.oneLiner, color = LexiInk, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
            }
            OutlinedButton(onClick = onSave, enabled = !isSaved) {
                Text(if (isSaved) "★" else "Save", fontSize = 12.sp)
            }
        }
    }
}
