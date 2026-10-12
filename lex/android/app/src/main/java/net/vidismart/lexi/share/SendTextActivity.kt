package net.vidismart.lexi.share

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import net.vidismart.lexi.MainActivity

/** M1: share-sheet target for apps that do not expose ACTION_PROCESS_TEXT. */
class SendTextActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val shared = intent?.getStringExtra(Intent.EXTRA_TEXT).orEmpty()
        if (shared.isBlank()) {
            finish()
            return
        }
        startActivity(
            Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra(MainActivity.EXTRA_DECODE_TEXT, shared)
            }
        )
        finish()
    }
}
