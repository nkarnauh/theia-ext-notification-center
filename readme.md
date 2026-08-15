# Notification Center

Theia-расширение: backend публикует типизированные уведомления, frontend показывает toast и ведёт историю в боковой панели.

## Документация

| Документ | Зачем |
|---|---|
| [docs/idea.md](docs/idea.md) | Задача и требования |
| [docs/architecture.md](docs/architecture.md) | Стек, слои `shared` / `backend` / `frontend`, RPC, UI, CI |
| [docs/plan.md](docs/plan.md) | Этапы реализации |
| [docs/todo.md](docs/todo.md) | Чеклист прогресса |

## Стек

TypeScript, Eclipse Theia, InversifyJS, React, Jest, Playwright, GitHub Actions.

Подробности — в [архитектуре](docs/architecture.md).

## Установка

Готовые сборки появятся в [GitHub Releases](https://github.com/nkarnauh/theia-ext-notification-center/releases) после этапа CI/CD: tarball `.tgz`, его ставят в Theia-приложение как npm-зависимость.

```bash
npm install ./theia-ext-notification-center-<version>.tgz
```

Пока релиза нет — собирать из исходников по [плану](docs/plan.md).
