# План реализации: Notification Center

Опирается на [idea.md](./idea.md) и [architecture.md](./architecture.md).  
Прогресс работ — [todo.md](./todo.md).  
v1 — обязательные требования. Плюсы — после e2e. Затем CI/CD и GitHub Releases. Раскладка `src/` — после работающего кода.

Критерий готовности этапа: код компилируется, пункт «Готово когда» выполнен, следующий этап не начинается вполуха.

## Этап 0. Каркас расширения

**Цель:** npm-пакет Theia с каталогами `src/shared`, `src/backend`, `src/frontend`.

- `package.json`: зависимости `@theia/core`, `theiaExtensions` на frontend/backend-модули.
- `tsconfig.json`: strict TypeScript.
- Пустые DI-модули frontend/backend, чтобы Theia CLI собирал расширение.
- ESLint.
- Jest: конфиг, скрипт `test` для `src/**/*.spec.ts`.
- Каталог `e2e/` пока можно не наполнять.

**Готово когда:** `npm run compile` проходит, хост-приложение Theia поднимается с пустым расширением.

## Этап 1. Shared-контракт

**Цель:** единые типы и RPC-интерфейс без DOM/Node.

- `notification-types.ts`: `NotificationSeverity`, `NotificationAction`, `Notification`, `NotificationInput`.
- `notification-protocol.ts`: path `/services/notification-center`, Symbol и интерфейсы `NotificationService` / `NotificationClient`.
- Реэкспорт из `index.ts`.

**Готово когда:** `shared` не импортирует `frontend`/`backend`; типы совпадают с §5 архитектуры.

## Этап 2. Backend: store и сервис

**Цель:** in-memory история и RPC-сервер.

- `NotificationStore`: FIFO, лимит 100, `getAll`, `push`, `clear`.
- `NotificationServiceImpl`: `id` + `timestamp` в `push`, вызов `client.onNotification`, `getHistory`, `clearHistory`, `actionInvoked` (лог / no-op), `setClient` / `disconnectClient`.
- Backend DI-модуль: store, service, `RpcConnectionHandler`.

**Готово когда:** frontend ещё не обязателен; сервис можно дергать из unit-тестов с фейковым client.

## Этап 3. Unit-тесты (Jest)

**Цель:** плюс из ТЗ — тесты backend. Без браузера.

- `notification-store.spec.ts`: порядок, вытеснение 101-й записи, `clear`.
- `notification-service.spec.ts`: `push` пишет в store и зовёт client; выдаёт `id`/`timestamp`; `getHistory` делегирует store.

**Готово когда:** `npm test` зелёный.

## Этап 4. Frontend: RPC, toast, демо-push

**Цель:** событие с backend видно пользователю.

- RPC-прокси + `NotificationClientImpl` (`Emitter`, `getHistory` на старте, `DisposableCollection`).
- Кастомный toast overlay: actions, 5 с для info/warning, error до закрытия, `clearTimeout` в dispose.
- Команда `notification-center.pushSample` (info / по желанию error с action) — для ручной проверки и e2e.
- Frontend DI-модуль.

**Готово когда:** команда демо-push показывает toast; error не исчезает сам; клик по action уходит в `actionInvoked`.

## Этап 5. Панель истории

**Цель:** боковая панель по ТЗ п. 6–8.

- `ReactWidget` + `WidgetFactory`, view в sidebar.
- Список: иконка severity, title/message, время `HH:MM:SS`.
- Клик по записи с `actions[]` раскрывает кнопки → `actionInvoked`.
- Тулбар: три чекбокса severity, «Очистить все» (`clearHistory` + локальный сброс).
- Подписка на Emitter клиента; стартовая история из `getHistory()`.

**Готово когда:** новые toast попадают в список, фильтр скрывает строки, «Очистить все» опустошает панель.

## Этап 6. E2E (Playwright)

**Цель:** пользовательские сценарии на запущенном Theia.

- Playwright + `@theia/playwright`.
- Page objects: `NotificationToast`, `NotificationPanel`.
- Сценарии из §11.2 архитектуры:
  1. info: toast 5 с → запись в панели;
  2. error: toast до крестика;
  3. клик по action;
  4. фильтр severity;
  5. «Очистить все».

**Готово когда:** e2e зелёные против локального хоста. На этом v1 закрыт.

## Этап 7. Плюсы (после v1)

Порядок внутри этапа свободный, друг от друга не зависят.

| Плюс | Работа | Проверка |
|---|---|---|
| История после рестарта | `PersistedNotificationStore` (JSON в user-data), тот же интерфейс store | e2e: reload → список на месте |
| Группировка по дате | заголовки Сегодня / Вчера / Ранее в панели | e2e на заголовки групп |
| Анимация toast | CSS появления/исчезновения | визуально; e2e кадры не проверяет |

## Этап 8. CI/CD и GitHub Releases

**Цель:** на каждый PR проверять сборку и пользовательские сценарии; по тегу выкладывать скачиваемый пакет расширения.

- `.github/workflows/ci.yml`: `pull_request` и `push` в `main`, Node 22, два job'а:
  - `unit`: `npm ci`, lint, compile, Jest.
  - `e2e`: `npm ci`, `npx playwright install --with-deps chromium`, `npm run build:browser`, `npm run test:e2e`. Playwright сам поднимает хост (`webServer`, `reuseExistingServer: false` при `CI=true`), `workers: 1`. При падении — артефакт `test-results/` (скриншоты).
- `.github/workflows/release.yml`: тег `v*` → те же `unit` и `e2e`, затем `npm pack`, GitHub Release с `.tgz`.
- Права `contents: write` только у release-job (создание Release через `GITHUB_TOKEN`).
- Версия: тег `v1.2.3` ↔ `"version": "1.2.3"` в `package.json`. Перед тегом версию bumpать вручную или скриптом.
- В `readme.md` — ссылка на Releases и как поставить tarball в Theia-приложение (`npm install путь/к/theia-ext-notification-center-1.2.3.tgz`).

`browser-app/` в релизный tarball не входит, но в репозитории нужен: без него e2e в CI не собрать.

**Готово когда:** PR зелёный по `unit` и `e2e`; `git tag v0.1.0 && git push --tags` создаёт Release, с которого качается `.tgz`.

## Этап 9. Раскладка src по папкам

**Цель:** файлы frontend/backend сгруппированы по ответственности, слои Theia не меняются.

- DI-модули остаются в корне `src/frontend` и `src/backend` (пути `theiaExtensions` те же).
- `backend/store/`, `backend/service/`.
- `frontend/client/`, `frontend/commands/`, `frontend/toast/`, `frontend/panel/`.
- `shared/` без изменений. Имена `notification-*` и поведение не трогаем.

**Готово когда:** `compile`, lint, Jest и e2e зелёные; дерево в архитектуре совпадает с диском.

## Зависимости этапов

```
0 каркас → 1 shared → 2 backend → 3 Jest
                              ↘ 4 toast + демо-push → 5 панель → 6 e2e → 7 плюсы → 8 CI/CD → 9 раскладка src
```

Этап 3 можно делать параллельно с началом 4, но не раньше готового сервиса из 2.  
Этап 8 опирается на каркас, Jest и e2e из этапа 6; workflow можно набросать раньше, но Release имеет смысл, когда есть собираемый пакет после этапа 2+.  
Этап 9 — только перенос файлов и импортов, без смены API.

## Вне скоупа v1

- Отдельный HTTP/WebSocket вместо Theia RPC.
- Redux и прочий клиентский store сверх состояния виджета.
- Свой пакет Inversify/React вместо `@theia/core/shared/...`.
- TreeWidget вместо ReactWidget (в архитектуре выбран React).
