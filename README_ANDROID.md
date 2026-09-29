# TECH EMPIRE — сборка APK прямо с Android-планшета

## Самый простой путь: GitHub Actions

Этот проект уже содержит `.github/workflows/build-apk.yml`.

1. Создай GitHub-репозиторий и загрузи в него содержимое этой папки.
2. Открой репозиторий в браузере планшета.
3. Перейди в **Actions**.
4. Выбери **Build TECH EMPIRE APK**.
5. Нажми **Run workflow**.
6. Дождись зелёного завершения сборки.
7. Открой результат запуска → **Artifacts** → скачай `TECH-EMPIRE-debug-apk`.
8. Распакуй архив и установи `app-debug.apk` на планшет.

Это не требует Android Studio на планшете: APK собирается на сервере GitHub Actions.

## Сборка непосредственно в Termux

Если хочешь собирать APK локально на планшете:

```bash
bash scripts/build-apk-termux.sh
```

Готовый APK появится здесь:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Для Termux потребуется достаточно свободного места, Java, Android SDK/Gradle и время на первую установку зависимостей. Поэтому GitHub Actions обычно проще.

## Обычная сборка на ПК

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

## Обновление игры

После изменения исходников:

```bash
npm install
npm run build
npx cap sync android
```

Для APK:

```bash
cd android
./gradlew assembleDebug
```

Сохранения игры должны храниться отдельно от исходников, поэтому при обновлении APK они не должны стираться.
