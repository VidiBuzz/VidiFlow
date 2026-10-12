package net.vidismart.lexi.share

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import net.vidismart.lexi.MainActivity

/**
 * M1: puts "Lexi" in the text-selection menu of every app (ACTION_PROCESS_TEXT).
 * It carries no UI of its own — it forwards the selection to MainActivity's Decode tab.
 */
class ProcessTextActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val selected = intent?.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString().orEmpty()
        forward(selected)
    }

    private fun forward(text: String) {
        if (text.isBlank()) {
            finish()
            return
        }
        startActivity(
            Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra(MainActivity.EXTRA_DECODE_TEXT, text)
            }
        )
        finish()
    }
}
