# TODO: Notification Center

Чеклист по [plan.md](./plan.md). Архитектура: [architecture.md](./architecture.md).

Как трекать: `[ ]` → `[x]`. Этап закрыт, когда отмечен его блок **Готово**.

**Сейчас:** этап 8 — дождаться зелёного CI на GitHub. Этап 7 закрыт.

## Этап 0. Каркас расширения

- [x] `package.json`: `@theia/core`, `theiaExtensions` на frontend/backend-модули
- [x] `tsconfig.json` (strict)
- [x] Пустые DI-модули `src/backend` и `src/frontend`
- [x] Каталоги `src/shared`, `src/backend`, `src/frontend`
- [x] ESLint
- [x] Jest: конфиг и скрипт `test` для `src/**/*.spec.ts`
- [x] **Готово:** `npm run compile` проходит, Theia-хост поднимается с пустым расширением

## Этап 1. Shared-контракт

- [x] `notification-types.ts`: `NotificationSeverity`, `NotificationAction`, `Notification`, `NotificationInput`
- [x] `notification-protocol.ts`: path `/services/notification-center`, Symbol, `NotificationService` / `NotificationClient`
- [x] Реэкспорт из `index.ts`
- [x] **Готово:** `shared` без импортов frontend/backend, типы как в §5 архитектуры

## Этап 2. Backend: store и сервис

- [x] `NotificationStore`: FIFO, лимит 100, `getAll` / `push` / `clear`
- [x] `NotificationServiceImpl`: `id` + `timestamp`, `onNotification`, `getHistory`, `clearHistory`, `actionInvoked`, `setClient` / `disconnectClient`
- [x] Backend DI-модуль: store, service, `RpcConnectionHandler`
- [x] **Готово:** сервис дергается из тестов с фейковым client

## Этап 3. Unit-тесты (Jest)

- [x] `notification-store.spec.ts`: порядок, вытеснение 101-й, `clear`
- [x] `notification-service.spec.ts`: `push` → store + client, `id`/`timestamp`, `getHistory`
- [x] **Готово:** `npm test` зелёный

## Этап 4. Frontend: RPC, toast, демо-push

- [x] RPC-прокси + `NotificationClientImpl` (Emitter, `getHistory` на старте, `DisposableCollection`)
- [x] Toast overlay: `actions[]`, 5 с для info/warning, error до закрытия, `clearTimeout` в dispose
- [x] Команда `notification-center.pushSample`
- [x] Frontend DI-модуль
- [x] **Готово:** демо-push показывает toast; error не гаснет сам; action → `actionInvoked`

## Этап 5. Панель истории

- [x] `ReactWidget` + `WidgetFactory`, view в sidebar
- [x] Список: иконка severity, title/message, время `HH:MM:SS`
- [x] Раскрытие `actions[]` → `actionInvoked`
- [x] Чекбоксы фильтра по severity
- [x] «Очистить все» (`clearHistory` + локальный сброс)
- [x] Подписка на Emitter; стартовая история из `getHistory()`
- [x] **Готово:** новые toast в списке, фильтр работает, очистка опустошает панель

## Этап 6. E2E (Playwright) — закрывает v1

- [x] Playwright + `@theia/playwright`
- [x] Page object `NotificationToast`
- [x] Page object `NotificationPanel`
- [x] Сценарий: info → toast 5 с → запись в панели
- [x] Сценарий: error → toast до крестика
- [x] Сценарий: клик по action
- [x] Сценарий: фильтр severity
- [x] Сценарий: «Очистить все»
- [x] **Готово:** e2e зелёные на локальном хосте

## Этап 7. Плюсы (после v1)

- [x] `PersistedNotificationStore` (JSON в user-data)
- [x] E2E: reload → история на месте
- [x] Группировка панели: Сегодня / Вчера / Ранее
- [x] E2E на заголовки групп
- [x] CSS-анимация появления/исчезновения toast
- [x] **Готово:** выбранные плюсы сделаны (можно закрывать по одному)

## Этап 8. CI/CD и GitHub Releases

- [x] `.github/workflows/ci.yml`: PR и `main`, Node 22, job `unit` (lint, compile, Jest)
- [x] Тот же workflow: job `e2e` (`playwright install --with-deps chromium`, `build:browser`, `test:e2e`)
- [x] Артефакт `test-results/` при падении e2e
- [x] `.github/workflows/release.yml`: тег `v*` → `unit` + `e2e`, затем pack + GitHub Release с `.tgz`
- [x] `contents: write` только у release-job
- [x] Версия тега `vX.Y.Z` совпадает с `package.json`
- [x] В `readme.md`: ссылка на Releases и установка tarball
- [ ] **Готово:** CI зелёный на PR (unit и e2e); тег создаёт скачиваемый Release
