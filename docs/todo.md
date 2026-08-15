# TODO: Notification Center

Чеклист по [plan.md](./plan.md). Архитектура: [architecture.md](./architecture.md).

Как трекать: `[ ]` → `[x]`. Этап закрыт, когда отмечен его блок **Готово**.

**Сейчас:** этап 2.

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

- [ ] `NotificationStore`: FIFO, лимит 100, `getAll` / `push` / `clear`
- [ ] `NotificationServiceImpl`: `id` + `timestamp`, `onNotification`, `getHistory`, `clearHistory`, `actionInvoked`, `setClient` / `disconnectClient`
- [ ] Backend DI-модуль: store, service, `RpcConnectionHandler`
- [ ] **Готово:** сервис дергается из тестов с фейковым client

## Этап 3. Unit-тесты (Jest)

- [ ] `notification-store.spec.ts`: порядок, вытеснение 101-й, `clear`
- [ ] `notification-service.spec.ts`: `push` → store + client, `id`/`timestamp`, `getHistory`
- [ ] **Готово:** `npm test` зелёный

## Этап 4. Frontend: RPC, toast, демо-push

- [ ] RPC-прокси + `NotificationClientImpl` (Emitter, `getHistory` на старте, `DisposableCollection`)
- [ ] Toast overlay: `actions[]`, 5 с для info/warning, error до закрытия, `clearTimeout` в dispose
- [ ] Команда `notification-center.pushSample`
- [ ] Frontend DI-модуль
- [ ] **Готово:** демо-push показывает toast; error не гаснет сам; action → `actionInvoked`

## Этап 5. Панель истории

- [ ] `ReactWidget` + `WidgetFactory`, view в sidebar
- [ ] Список: иконка severity, title/message, время `HH:MM:SS`
- [ ] Раскрытие `actions[]` → `actionInvoked`
- [ ] Чекбоксы фильтра по severity
- [ ] «Очистить все» (`clearHistory` + локальный сброс)
- [ ] Подписка на Emitter; стартовая история из `getHistory()`
- [ ] **Готово:** новые toast в списке, фильтр работает, очистка опустошает панель

## Этап 6. E2E (Playwright) — закрывает v1

- [ ] Playwright + `@theia/playwright`
- [ ] Page object `NotificationToast`
- [ ] Page object `NotificationPanel`
- [ ] Сценарий: info → toast 5 с → запись в панели
- [ ] Сценарий: error → toast до крестика
- [ ] Сценарий: клик по action
- [ ] Сценарий: фильтр severity
- [ ] Сценарий: «Очистить все»
- [ ] **Готово:** e2e зелёные на локальном хосте

## Этап 7. Плюсы (после v1)

- [ ] `PersistedNotificationStore` (JSON в user-data)
- [ ] E2E: reload → история на месте
- [ ] Группировка панели: Сегодня / Вчера / Ранее
- [ ] E2E на заголовки групп
- [ ] CSS-анимация появления/исчезновения toast
- [ ] **Готово:** выбранные плюсы сделаны (можно закрывать по одному)

## Этап 8. CI/CD и GitHub Releases

- [ ] `.github/workflows/ci.yml`: PR и `main` → lint, compile, Jest, Node 22
- [ ] `.github/workflows/release.yml`: тег `v*` → pack + GitHub Release с `.tgz`
- [ ] `contents: write` только у release-job
- [ ] Версия тега `vX.Y.Z` совпадает с `package.json`
- [ ] В `readme.md`: ссылка на Releases и установка tarball
- [ ] **Готово:** CI зелёный на PR; тег создаёт скачиваемый Release
