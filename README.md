# TECH EMPIRE — modular prototype

Экономическая/технологическая игра на React + TypeScript + Vite.

## Структура

- `index.html` — входная страница.
- `src/App.tsx` — корневой экран и навигация.
- `src/game/state.ts` — состояние игры, сохранение, симуляция экономики.
- `src/data/designs.ts` — конструкторы CPU/GPU/батареи и формулы.
- `src/hooks/useGame.ts` — React-состояние игры.
- `src/screens/Company` — корпорация.
- `src/screens/Empire` — производство, продукты и фабрики.
- `src/screens/Science` — научные направления.
- `src/screens/Lab` — конструктор технологий.
- `src/screens/Finance` — финансы.

## Запуск на компьютере

Нужен Node.js 20+.

```bash
npm install
npm run dev
```

Для проверки TypeScript:

```bash
npm run typecheck
```

Для production-сборки:

```bash
npm run build
```

После build готовая web-версия находится в `dist/`.

## Как сделать APK

Рекомендуемый путь — Android Studio + Capacitor. Это позволит упаковать тот же React-проект в настоящее Android-приложение без переписывания игры.

1. Установить Node.js 20+ и Android Studio.
2. В корне проекта выполнить:

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "TECH EMPIRE" "com.techempire.game" --web-dir dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

3. В Android Studio выбрать `Build → Generate App Bundles or APKs → Generate APKs`.
4. Получившийся APK можно установить на Android-телефон.

При дальнейших изменениях игры:

```bash
npm run build
npx cap sync android
```

и снова собрать APK в Android Studio.

## Важно

Это текущая рабочая база, а не финальная версия всех механик TECH EMPIRE. Архитектура специально разделена по экранам, состоянию, данным и игровой логике, чтобы дальше добавлять NPC-компании, дочерние компании, закупки, патенты, рынок акций, полноценное дерево технологий, космос и другие системы без превращения проекта в один огромный файл.

## 📱 APK прямо с Android-планшета

Для планшета самый простой вариант — загрузить проект в GitHub и запустить готовый workflow:

**Actions → Build TECH EMPIRE APK → Run workflow → Artifacts → TECH-EMPIRE-debug-apk**.

Подробная инструкция находится в `README_ANDROID.md`.

Также есть локальный скрипт `scripts/build-apk-termux.sh` для сборки через Termux.
