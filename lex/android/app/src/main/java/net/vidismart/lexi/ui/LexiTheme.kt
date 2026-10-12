package net.vidismart.lexi.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Lexi tokens — the same values as the web app (`--dj-cyan`, `--dj-violet`, `--bg-dark`).
val LexiCyan = Color(0xFF00E5FF)
val LexiViolet = Color(0xFFA78BFA)
val LexiInk = Color(0xFFE5F6FF)
val LexiDim = Color(0xFF94A3B8)
val LexiBg = Color(0xFF030712)
val LexiPanel = Color(0xFF0B0F1E)
val LexiCard = Color(0xFF111A30)
val LexiAmber = Color(0xFFFBBF24)
val LexiGreen = Color(0xFF10B981)

private val LexiColors = darkColorScheme(
    primary = LexiCyan,
    onPrimary = LexiBg,
    secondary = LexiViolet,
    onSecondary = LexiBg,
    tertiary = LexiAmber,
    background = LexiBg,
    onBackground = LexiInk,
    surface = LexiPanel,
    onSurface = LexiInk,
    surfaceVariant = LexiCard,
    onSurfaceVariant = LexiDim,
    outline = Color(0xFF1E293B)
)

@Composable
fun LexiTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = LexiColors, content = content)
}
