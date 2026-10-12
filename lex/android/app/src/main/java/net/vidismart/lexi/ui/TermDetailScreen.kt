package net.vidismart.lexi.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import net.vidismart.lexi.data.Term

/** Full term view — the Android twin of the extension's hover card + Lex Lab studio pane. */
@Composable
fun TermDetailScreen(
    term: Term,
    isSaved: Boolean,
    onSave: () -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        TextButton(onClick = onBack) { Text("← Back", color = LexiCyan) }

        Text(term.acr, color = LexiCyan, fontWeight = FontWeight.Black, fontSize = 30.sp)
        Text(term.full, color = LexiViolet, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        if (term.dept.isNotBlank()) Text(term.dept, color = LexiDim, fontSize = 12.sp)

        CdnImage(url = term.conceptImg, label = "${term.acr} concept art")
        if (term.conceptDesc.isNotBlank()) {
            Text(term.conceptDesc, color = LexiDim, fontSize = 12.sp)
        }
        Text(term.oneLiner, color = LexiInk, fontSize = 14.sp)

        if (term.origin.isNotBlank()) {
            Section("ORIGIN") { Text(term.origin, color = LexiViolet, fontSize = 12.5.sp) }
        }
        if (term.notes.isNotBlank()) {
            Section("VIDISMART NOTE") { Text(term.notes, color = LexiAmber, fontSize = 12.5.sp) }
        }

        if (term.anatomy.isNotEmpty()) {
            Section("WORD ANATOMY") {
                term.anatomy.forEach { part ->
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(LexiCyan),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(part.letter, color = LexiBg, fontWeight = FontWeight.Black, fontSize = 13.sp)
                        }
                        Column(modifier = Modifier.padding(start = 10.dp)) {
                            Text(
                                "${part.word} — ${part.role}",
                                color = LexiInk,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                            Text(part.desc, color = LexiDim, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        if (term.flow.isNotEmpty()) {
            Section("HOW IT WORKS") {
                term.flow.forEach { step ->
                    Row(modifier = Modifier.padding(vertical = 3.dp)) {
                        Text(
                            "${step.icon.ifBlank { "•" }} ${step.step}",
                            color = if (step.active) LexiCyan else LexiDim,
                            fontSize = 12.sp,
                            modifier = Modifier.width(96.dp),
                            fontWeight = if (step.active) FontWeight.Bold else FontWeight.Normal
                        )
                        Column {
                            Text(step.title, color = LexiInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text(step.desc, color = LexiDim, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        if (term.brands.isNotEmpty()) {
            Section("BRANDS & ECOSYSTEM") {
                term.brands.forEach { brand ->
                    Row(modifier = Modifier.padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(brand.name, color = LexiInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("  ${brand.share}", color = LexiCyan, fontSize = 12.sp)
                        Text("  ${brand.tag}", color = LexiDim, fontSize = 11.sp)
                    }
                }
            }
        }

        if (term.replaces.isNotEmpty()) {
            Section("LEGACY IT REPLACES") {
                term.replaces.forEach { Text("• $it", color = LexiDim, fontSize = 12.5.sp) }
            }
        }
        if (term.connectsWith.isNotEmpty()) {
            Section("CONNECTS WITH") {
                term.connectsWith.forEach { Text("• $it", color = LexiDim, fontSize = 12.5.sp) }
            }
        }
        if (term.keywords.isNotEmpty()) {
            Section("KEYWORDS") { Text(term.keywords.joinToString(" · "), color = LexiDim, fontSize = 12.sp) }
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outline)
        Button(onClick = onSave, enabled = !isSaved, modifier = Modifier.fillMaxWidth()) {
            Text(if (isSaved) "★ Already in your Smart Stack" else "★ Add to my Smart Stack")
        }
        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Back to dictionary") }
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = LexiCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(title, color = LexiViolet, fontSize = 10.5.sp, fontWeight = FontWeight.Black)
            Box(modifier = Modifier.padding(top = 6.dp)) { content() }
        }
    }
}
