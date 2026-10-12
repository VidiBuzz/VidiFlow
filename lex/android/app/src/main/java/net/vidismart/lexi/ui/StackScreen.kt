package net.vidismart.lexi.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import net.vidismart.lexi.data.SavedTerm

/** The Smart Stack tab: saved terms, private notes, and export to a study package. */
@Composable
fun StackScreen(
    saved: List<SavedTerm>,
    onOpen: (String) -> Unit,
    onRemove: (String) -> Unit,
    onNoteChange: (String, String) -> Unit,
    onExportHtml: () -> Unit,
    onExportJson: () -> Unit,
    onImport: () -> Unit,
    onClear: () -> Unit
) {
    if (saved.isEmpty()) {
        Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Text("SMART STACK", color = LexiViolet, fontSize = 11.sp, fontWeight = FontWeight.Black)
            Box(modifier = Modifier.padding(top = 12.dp)) {
                Text(
                    "Nothing saved yet.\n\nSelect any word in another app, choose \"Lexi\" from the " +
                        "text menu, then tap Add to my Smart Stack.",
                    color = LexiDim,
                    fontSize = 13.sp
                )
            }
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Column {
                Text("SMART STACK", color = LexiViolet, fontSize = 11.sp, fontWeight = FontWeight.Black)
                Text(
                    "${saved.size} term${if (saved.size == 1) "" else "s"} saved",
                    color = LexiInk,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onExportHtml, modifier = Modifier.weight(1f)) { Text("Export study pkg") }
                OutlinedButton(onClick = onExportJson, modifier = Modifier.weight(1f)) { Text("Export JSON") }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onImport, modifier = Modifier.weight(1f)) { Text("Import backup") }
                TextButton(onClick = onClear, modifier = Modifier.weight(1f)) {
                    Text("Delete all", color = LexiDim)
                }
            }
        }
        items(saved, key = { it.acr }) { item ->
            StackCard(
                item = item,
                onOpen = { onOpen(item.acr) },
                onRemove = { onRemove(item.acr) },
                onNoteChange = { text -> onNoteChange(item.acr, text) }
            )
        }
    }
}

@Composable
private fun StackCard(
    item: SavedTerm,
    onOpen: () -> Unit,
    onRemove: () -> Unit,
    onNoteChange: (String) -> Unit
) {
    var note by remember(item.acr) { mutableStateOf(item.note) }

    LaunchedEffect(note) {
        if (note != item.note) {
            delay(500)
            onNoteChange(note)
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onOpen),
        colors = CardDefaults.cardColors(containerColor = LexiCard)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(item.acr, color = LexiCyan, fontWeight = FontWeight.Black, fontSize = 16.sp)
                TextButton(onClick = onRemove) { Text("Remove", color = LexiDim, fontSize = 12.sp) }
            }
            if (item.full.isNotBlank()) Text(item.full, color = LexiViolet, fontSize = 12.sp)
            if (item.oneLiner.isNotBlank()) {
                Text(item.oneLiner, color = LexiInk, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
            }
            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                minLines = 1,
                label = { Text("My note") },
                modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
            )
            Text(
                "Saved ${item.savedAt.take(10)}" + if (item.source.isNotBlank()) " · ${item.source}" else "",
                color = LexiDim,
                fontSize = 11.sp
            )
        }
    }
}
