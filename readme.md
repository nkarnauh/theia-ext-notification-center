# Notification Center

[![CI](https://github.com/nkarnauh/theia-ext-notification-center/actions/workflows/ci.yml/badge.svg)](https://github.com/nkarnauh/theia-ext-notification-center/actions/workflows/ci.yml)

Theia-расширение: backend публикует типизированные уведомления, frontend показывает toast и ведёт историю в боковой панели.

## Документация

| Документ | Зачем |
|---|---|
| [docs/idea.md](docs/idea.md) | Задача и требования |
| [docs/architecture.md](docs/architecture.md) | Стек, слои `shared` / `backend` / `frontend`, RPC, UI, CI |
| [docs/plan.md](docs/plan.md) | Этапы реализации |
| [docs/todo.md](docs/todo.md) | Чеклист прогресса |

Статус — в [todo.md](docs/todo.md).

## Стек

TypeScript, Eclipse Theia, InversifyJS, React, Jest, Playwright, GitHub Actions.

Подробности — в [архитектуре](docs/architecture.md).

## Разработка

```bash
npm install
npm run compile
npm run lint
npm test
npm run build:browser
npm run start:browser
```

Хост: http://localhost:3000. `browser-app/` — локальное Theia-приложение, в релиз не входит.

E2E (Playwright, нужен собранный хост):

```bash
npm run playwright:install
npm run build:browser
npm run test:e2e
```

`test:e2e` сам поднимает хост на http://localhost:3000, если он ещё не запущен.

## Установка

Скачайте tarball с [GitHub Releases](https://github.com/nkarnauh/theia-ext-notification-center/releases) и поставьте в Theia-приложение:

```bash
npm install ./theia-ext-notification-center-<version>.tgz
```

Релиз создаётся тегом `vX.Y.Z`, который должен совпадать с `version` в `package.json`. На каждый PR GitHub Actions гоняет lint, Jest и Playwright e2e.

Пока релиза нет — собирать из исходников по [плану](docs/plan.md).
