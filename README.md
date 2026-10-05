# Nest Dictionary API

Backend для приложения по изучению английских слов.

API предоставляет регистрацию и авторизацию пользователей, активацию аккаунта через email, JWT-аутентификацию, работу со словарём, персональный прогресс изучения слов и административное управление словарём.

---

## Содержание

* [О проекте](#о-проекте)
* [Возможности](#возможности)
* [Технологический стек](#технологический-стек)
* [Быстрый старт](#быстрый-старт)

  * [Предварительные требования](#предварительные-требования)
  * [Установка](#установка)
  * [Переменные окружения](#переменные-окружения)
  * [Запуск](#запуск)
* [Структура репозитория](#структура-репозитория)
* [Обзор архитектуры](#обзор-архитектуры)
* [Аутентификация](#аутентификация)
* [API](#api)

  * [Authentication](#authentication-api)
  * [Words](#words-api)
  * [Admin](#admin-api)
* [Модель данных](#модель-данных)
* [Валидация](#валидация)
* [Логирование](#логирование)
* [Тестирование](#тестирование)
* [NPM Scripts](#npm-scripts)
* [Развертывание](#развертывание)
* [Безопасность](#безопасность)
* [Developer Checklist](#developer-checklist)
* [Распространённые проблемы](#распространённые-проблемы)
* [Contributing](#contributing)
* [License](#license)

---

# О проекте

**Nest Dictionary API** — REST API для приложения, предназначенного для изучения английской лексики.

Backend отвечает за:

* регистрацию, авторизацию и аутентификацию пользователей;
* активацию аккаунтов через email;
* хранение и предоставление слов;
* изменение прогресса изучения слов;
* управление словарем.

---

# Обзор архитектуры

## Диаграммы

### Диаграмма классов

```mermaid
classDiagram
    class User {
        UUID id
        string email
        string passwordHash
        UserRole role
        boolean isActivated
        string activationLink
        Date createdAt
        Date updatedAt
    }

    class RefreshToken {
        UUID id
        UUID userId
        string tokenHash
        Date expiresAt
        Date createdAt
        boolean revoked
    }

    class Word {
        UUID id
        string eng
        string transcription
        string translation
        string pronunciationUrl
    }

    class Progression {
        UUID id
        UUID userId
        UUID wordId
        int progress
    }

    class UserRole {
        <<enumeration>>
        USER
        ADMIN
    }

    User --> UserRole
    User "1" --> "*" RefreshToken
    User "1" --> "*" Progression
    Word "1" --> "*" Progression
```

### ER-диаграмма базы данных

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ PROGRESSIONS : has
    WORDS ||--o{ PROGRESSIONS : has

    USERS {
        uuid id PK
        varchar email UK
        varchar passwordHash
        enum role
        timestamp createdAt
        timestamp updatedAt
        boolean isActivated
        varchar activationLink
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid userId FK
        varchar tokenHash UK
        timestamp expiresAt
        timestamp createdAt
        boolean revoked
    }

    WORDS {
        uuid id PK
        varchar eng
        varchar transcription
        text translation
        varchar pronunciationUrl
    }

    PROGRESSIONS {
        uuid id PK
        uuid userId FK
        uuid wordId FK
        integer progress
    }
```

### Диаграмма последовательности — регистрация

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant AuthController
    participant AuthService
    participant Database
    participant TokenService
    participant EmailService

    User->>Client: Заполняет форму регистрации
    Client->>AuthController: POST /auth/register
    AuthController->>AuthService: register(dto)

    AuthService->>Database: Проверка email
    Database-->>AuthService: Пользователь не найден

    AuthService->>AuthService: Хеширование пароля
    AuthService->>Database: Создание User
    Database-->>AuthService: User

    AuthService->>TokenService: Генерация access/refresh tokens
    TokenService-->>AuthService: Tokens

    AuthService->>Database: Сохранение RefreshToken
    AuthService->>EmailService: Отправка activation email

    AuthService-->>AuthController: User + accessToken
    AuthController-->>Client: 201 Created + cookie
    Client-->>User: Регистрация завершена
```

### Диаграмма последовательности — обновление прогресса

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant WordController
    participant JwtAuthGuard
    participant WordService
    participant Database

    User->>Client: Изменяет прогресс слов
    Client->>WordController: PATCH /word/progress
    WordController->>JwtAuthGuard: Проверка JWT
    JwtAuthGuard-->>WordController: User

    WordController->>WordService: updateWordsProgress()
    WordService->>Database: Начало транзакции
    WordService->>Database: Блокировка записей
    WordService->>WordService: Расчёт нового прогресса
    WordService->>Database: Upsert Progression
    Database-->>WordService: Успешно
    WordService-->>WordController: success + updated
    WordController-->>Client: 200 OK
    Client-->>User: Прогресс обновлён
```

## Возможности

# Запуск

## Development

```bash
npm run start:dev
```

## Production

Сначала создайте production build:

```bash
npm run build
```

Затем запустите:

```bash
npm run start:prod
```

## Debug

```bash
npm run start:debug
```

---

# Структура репозитория

Основная структура backend:

```text
nest-dictionary/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   ├── interfaces/
│   │   ├── services/
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   │
│   ├── word/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   ├── word.controller.ts
│   │   ├── word.module.ts
│   │   └── word.service.ts
│   │
│   ├── app.module.ts
│   ├── main.ts
│   └── logger.config.ts
│
├── test/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env
├── .gitignore
└── README.md
```

> Названия вложенных директорий могут отличаться в зависимости от фактической структуры репозитория.

---

# Обзор архитектуры

Проект разделён на отдельные NestJS modules.

```text
                    ┌──────────────────┐
                    │     Client       │
                    │ localhost:5173   │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             ▼
                    ┌──────────────────┐
                    │   NestJS API     │
                    │   port: 3000     │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
       ┌─────────────┐               ┌─────────────┐
       │ AuthModule  │               │ WordModule  │
       └──────┬──────┘               └──────┬──────┘
              │                             │
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    ┌──────────────────┐
                    │    TypeORM       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    └──────────────────┘
```

## AuthModule

Отвечает за:

* регистрацию;
* login;
* logout;
* активацию аккаунта;
* refresh token;
* JWT authentication;
* работу с пользователем;
* работу с Refresh Token;
* отправку email.

## WordModule

Отвечает за:

* получение слов;
* получение неизвестных слов;
* получение изучаемых слов;
* получение прогресса;
* изменение прогресса;
* CRUD слов для администратора.

---

# Аутентификация

В проекте используется комбинация:

```text
Access Token
+
Refresh Token
```

Access Token используется для доступа к защищённым API.

Refresh Token хранится в `HttpOnly` cookie.

Для защищённого endpoint клиент должен отправлять:

```http
Authorization: Bearer <access_token>
```

---

## Authentication Flow

### Registration

```text
Client
   │
   │ POST /auth/register
   ▼
NestJS
   │
   ├── validate DTO
   ├── check email
   ├── hash password
   ├── create activation link
   ├── create user
   ├── generate tokens
   └── send activation email
          │
          ▼
       Client
```

После регистрации пользователь получает Access Token и Refresh Token, но аккаунт остаётся неактивированным до перехода по ссылке из email.

---

## Login

```text
POST /auth/login
       │
       ▼
Check user
       │
       ├── check password
       ├── check activation
       ├── generate Access Token
       └── generate Refresh Token
```

---

## Refresh Token Rotation

При запросе:

```http
POST /auth/refresh
```

сервер:

1. получает Refresh Token из cookie;
2. проверяет его;
3. проверяет токен в базе данных;
4. отзывает старый Refresh Token;
5. создаёт новый Refresh Token;
6. выдаёт новый Access Token.

Это позволяет использовать rotation для Refresh Token.

---

# API

Base URL:

```text
http://localhost:3000
```

---

# Authentication API

## Register

```http
POST /auth/register
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "user": {},
  "accessToken": "..."
}
```

Также устанавливается:

```text
refreshToken
```

в `HttpOnly` cookie.

---

## Login

```http
POST /auth/login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "user": {},
  "accessToken": "..."
}
```

---

## Logout

```http
POST /auth/logout
```

Refresh Token отзывается, а cookie очищается.

### Response

```json
{
  "success": true
}
```

---

## Activate account

```http
GET /auth/activate/:activationLink
```

Активирует аккаунт пользователя.

После активации выполняется redirect на `CLIENT_URL`.

---

## Refresh

```http
POST /auth/refresh
```

Refresh Token берётся из cookie.

### Response

```json
{
  "user": {},
  "accessToken": "..."
}
```

---

# Words API

Все endpoints этого раздела требуют JWT authentication.

---

## Get all words

```http
GET /word
```

Возвращает все слова словаря.

---

## Get words amount

```http
GET /word/amount
```

Возвращает общее количество слов в словаре.

---

## Get unknown word IDs

```http
GET /word/idsUnknown
```

Возвращает ID слов, которые пользователь ещё не изучал.

В текущей реализации слово считается неизвестным, если у пользователя отсутствует progression с положительным значением.

---

## Get unknown words

```http
GET /word/unknown?ids=1,2,3
```

Возвращает слова по списку ID.

Пример:

```http
GET /word/unknown?ids=1,2,3
```

---

## Get words in progress

```http
GET /word/known?amountWords=10
```

Возвращает случайные слова, у которых:

```text
progress > 0
progress < 100
```

Таким образом, endpoint фактически возвращает слова, которые пользователь уже начал изучать, но ещё не довёл до `100%`.

---

## Get progress

```http
GET /word/progress
```

Возвращает прогресс текущего пользователя.

Пример:

```json
[
  {
    "wordId": 1,
    "progress": 20
  },
  {
    "wordId": 2,
    "progress": 75
  }
]
```

---

## Update progress

```http
PATCH /word/progress
```

### Request

```json
{
  "ids": [1, 2, 3],
  "values": [10, 5, 20]
}
```

### Важно

`values` в текущей реализации являются **изменением текущего прогресса**, а не новым абсолютным значением.

Например:

```text
Current progress: 40
value: 10

Result: 50
```

Результат ограничивается:

```text
0 <= progress <= 100
```

Обновление выполняется транзакционно с блокировкой соответствующих записей.

---

# Admin API

Admin endpoints требуют:

```http
Authorization: Bearer <admin_access_token>
```

и роль:

```text
ADMIN
```

---

## Create word

```http
POST /admin/word
```

### Request

```json
{
  "eng": "apple",
  "transcription": "[ˈæpəl]",
  "translation": "яблоко",
  "pronunciationUrl": "https://example.com/apple.mp3"
}
```

### Поля

| Поле               | Тип    | Required |
| ------------------ | ------ | -------: |
| `eng`              | string |       Да |
| `transcription`    | string |      Нет |
| `translation`      | string |       Да |
| `pronunciationUrl` | URL    |      Нет |

---

## Update word

```http
PATCH /admin/word/:id
```

Пример:

```http
PATCH /admin/word/1
```

```json
{
  "translation": "яблоко"
}
```

Все поля при обновлении являются необязательными.

---

## Delete word

```http
DELETE /admin/word/:id
```

Пример:

```http
DELETE /admin/word/1
```

---

# API Summary

| Endpoint                         | Method | Auth   | Description |
| -------------------------------- | ------ | ------ | ----------- |
| `/auth/register`                 | POST   | —      | Регистрация |
| `/auth/login`                    | POST   | —      | Авторизация |
| `/auth/logout`                   | POST   | Cookie | Выход       |
| `/auth/activate/:activationLink` | GET    | —      |             |
