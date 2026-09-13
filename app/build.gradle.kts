plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.facevo.localvideo"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.facevo.localvideo"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "2.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    buildTypes {
        debug {
            val configuredUrl = providers.gradleProperty("FACEVO_API_BASE_URL")
                .getOrElse("https://facevo-api.onrender.com/")
            val baseUrl = configuredUrl.trimEnd('/') + "/"
            buildConfigField("String", "API_BASE_URL", "\"${baseUrl.replace("\"", "\\\"")}\"")
        }
        release {
            val configuredUrl = providers.gradleProperty("FACEVO_API_BASE_URL")
                .getOrElse("https://invalid.facevo.example/")
            val baseUrl = configuredUrl.trimEnd('/') + "/"
            require(baseUrl.startsWith("https://")) {
                "FACEVO_API_BASE_URL must use HTTPS for release builds"
            }
            buildConfigField("String", "API_BASE_URL", "\"${baseUrl.replace("\"", "\\\"")}\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.recyclerview:recyclerview:1.4.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.2")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-ui:1.5.1")
    implementation("com.github.bumptech.glide:glide:4.16.0")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
}
