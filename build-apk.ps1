$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$GradleVersion = '8.11.1'
$ToolsDir = Join-Path $ProjectDir '.gradle-local'
$ZipPath = Join-Path $ToolsDir "gradle-$GradleVersion-bin.zip"
$GradleDir = Join-Path $ToolsDir "gradle-$GradleVersion"
$GradleBat = Join-Path $GradleDir 'bin\gradle.bat'
$SdkDir = 'D:\AndroidSdk'
$JavaHome = 'C:\Users\Natan\AppData\Local\Programs\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$Apk = Join-Path $ProjectDir 'app\build\outputs\apk\debug\app-debug.apk'

if (-not (Test-Path $SdkDir)) {
  throw "Android SDK não encontrado em $SdkDir"
}

if (-not (Test-Path $ToolsDir)) {
  New-Item -ItemType Directory -Path $ToolsDir | Out-Null
}

if (-not (Test-Path $GradleBat)) {
  if (-not (Test-Path $ZipPath)) {
    Write-Host "Baixando Gradle $GradleVersion..."
    Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-$GradleVersion-bin.zip" -OutFile $ZipPath
  }
  Write-Host "Extraindo Gradle..."
  Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
}

if (-not (Test-Path $JavaHome)) {
  throw "Java não encontrado em $JavaHome"
}

$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir
$env:JAVA_HOME = $JavaHome
$env:PATH = "$JavaHome\bin;$env:PATH"

if (Test-Path $Apk) {
  Remove-Item $Apk -Force
}

Write-Host "Compilando APK debug..."
& $GradleBat -p $ProjectDir :app:assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) {
  throw "Gradle falhou com código $LASTEXITCODE"
}

if (Test-Path $Apk) {
  Write-Host ""
  Write-Host "APK gerado em: $Apk"
} else {
  throw 'Build terminou, mas app-debug.apk não foi encontrado.'
}
