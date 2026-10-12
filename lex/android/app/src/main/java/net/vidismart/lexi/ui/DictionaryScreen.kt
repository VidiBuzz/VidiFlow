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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.background
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import net.vidismart.lexi.data.Term

/**
 * The dictionary tab: search across the 15 canonical terms and open any of them.
 * `search` is injected (backed by TermRepository) so this screen stays pure UI.
 */
@Composable
fun DictionaryScreen(
    search: (String) -> List<Term>,
    savedAcrs: Set<String>,
    onOpen: (Term) -> Unit
) {
    var query by remember { mutableStateOf("") }
    val results = remember(query) { search(query) }

    Column(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                singleLine = true,
                label = { Text("Search terms, e.g. CRM, RAG, JIT…") },
                modifier = Modifier.fillMaxWidth()
            )
            Text(
                text = "${results.size} of ${search("").size} terms",
                color = LexiDim,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outline)

        if (results.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No dictionary match.", color = LexiDim)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(results, key = { it.acr }) { term ->
                    TermRow(term = term, isSaved = savedAcrs.contains(term.acr.uppercase())) { onOpen(term) }
                }
            }
        }
    }
}

@Composable
private fun TermRow(term: Term, isSaved: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = LexiCard)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(LexiCyan),
                contentAlignment = Alignment.Center
            ) {
                Text(term.initial, color = LexiBg, fontWeight = FontWeight.Black)
            }
            Column(modifier = Modifier.padding(start = 12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(term.acr, color = LexiCyan, fontWeight = FontWeight.Black, fontSize = 17.sp)
                    if (isSaved) {
                        Text(
                            "  ★ in stack",
                            color = LexiAmber,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                Text(term.full, color = LexiViolet, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                if (term.dept.isNotBlank()) {
                    Text(term.dept, color = LexiDim, fontSize = 11.sp)
                }
                Text(
                    term.oneLiner,
                    color = LexiInk,
                    fontSize = 12.5.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}
