# Lexi Android — release shrinking rules.
# v0.1 keeps isMinifyEnabled = false; these rules are here for when it is turned on.
-keep class net.vidismart.lexi.data.** { *; }
-keepclassmembers class * {
    @androidx.compose.runtime.Composable <methods>;
}
