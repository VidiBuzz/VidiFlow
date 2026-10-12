// Lexi for Android — root build file.
// Keep plugin versions in sync with gradle/wrapper/gradle-wrapper.properties:
//   AGP 8.7.x requires Gradle >= 8.9, JDK 17+.
plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
