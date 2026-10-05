Nest Dictionary API

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
<img width="891" height="926" alt="ClassDiogramDictionaryBack drawio" src="https://github.com/user-attachments/assets/c8b6e150-b0c7-4c54-9962-3b62091d5727" /># 



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












![Uploadin<?xml version="1.0" encoding="UTF-8"?>
<!-- Do not edit this file with editors other than draw.io -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="891px" height="926px" viewBox="0 0 891 926" content="&lt;mxfile host=&quot;app.diagrams.net&quot; agent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0&quot; version=&quot;29.6.6&quot;&gt;&#10;  &lt;diagram name=&quot;Страница-1&quot; id=&quot;wyrdoffJVyxkEleNwNxq&quot;&gt;&#10;    &lt;mxGraphModel dx=&quot;2068&quot; dy=&quot;1128&quot; grid=&quot;1&quot; gridSize=&quot;10&quot; guides=&quot;1&quot; tooltips=&quot;1&quot; connect=&quot;1&quot; arrows=&quot;1&quot; fold=&quot;1&quot; page=&quot;1&quot; pageScale=&quot;1&quot; pageWidth=&quot;827&quot; pageHeight=&quot;1169&quot; math=&quot;0&quot; shadow=&quot;0&quot;&gt;&#10;      &lt;root&gt;&#10;        &lt;mxCell id=&quot;0&quot; /&gt;&#10;        &lt;mxCell id=&quot;1&quot; parent=&quot;0&quot; /&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-6&quot; edge=&quot;1&quot; parent=&quot;1&quot; source=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.511;entryY=1.08;entryDx=0;entryDy=0;entryPerimeter=0;&quot; target=&quot;_L6m9T75-ljy2NTBbYRm-47&quot;&gt;&#10;          &lt;mxGeometry relative=&quot;1&quot; as=&quot;geometry&quot;&gt;&#10;            &lt;mxPoint x=&quot;760&quot; y=&quot;440&quot; as=&quot;targetPoint&quot; /&gt;&#10;          &lt;/mxGeometry&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; parent=&quot;1&quot; style=&quot;swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;&quot; value=&quot;AuthService&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;268&quot; width=&quot;380&quot; x=&quot;80&quot; y=&quot;520&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-2&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ id: number&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;26&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-25&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ email: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;52&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-35&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ role: UserRole&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;78&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-48&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+&amp;amp;nbsp;refreshToken: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;104&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-3&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;&quot; value=&quot;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;8&quot; width=&quot;380&quot; y=&quot;130&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-4&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ register (email: string, password: string): AuthResponse&amp;amp;nbsp;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;138&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-21&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ login (email: string, password: string): AuthResponse&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;164&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-22&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ logout (refreshToken: string)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;190&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-23&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ activate (activationLink: string)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;216&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-24&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ refresh (refreshToken&amp;lt;span style=&amp;quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&amp;quot;&amp;gt;: string): AuthResponse&amp;lt;/span&amp;gt;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;380&quot; y=&quot;242&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; parent=&quot;1&quot; style=&quot;swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;&quot; value=&quot;UserWordService&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;346&quot; width=&quot;436&quot; x=&quot;534&quot; y=&quot;510&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-6&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ eng: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;26&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-1&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ transcription: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;52&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-13&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ transcription: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;78&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-14&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ pronunciationUrl: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;104&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-15&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+&amp;amp;nbsp;&amp;amp;nbsp;progress: number&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;130&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-7&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;&quot; value=&quot;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;8&quot; width=&quot;436&quot; y=&quot;156&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-8&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ findAll (): Word[]&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;164&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-59&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ getWordsAmount (userId: string): nimber&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;190&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-60&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ getIdsUnknownWord (userId: string): number[]&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;216&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-61&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ getUnknownWord (ids: string): Word[]&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;242&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-62&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ getKnownWord (userId: string, amountWords: number): Word[]&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;268&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-63&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ getWordsProgress (userId: string): { wordId: number, progress: number }[]&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;294&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-64&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-5&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ updateWordsProgress ( { wordId: number, progress: number })&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;436&quot; y=&quot;320&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; parent=&quot;1&quot; style=&quot;swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;&quot; value=&quot;TokenService&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;242&quot; width=&quot;480&quot; x=&quot;490&quot; y=&quot;184&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-37&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ accessToken: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;26&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-36&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+&amp;amp;nbsp;refreshToken: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;52&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-11&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;&quot; value=&quot;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;8&quot; width=&quot;480&quot; y=&quot;78&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-12&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ generateTokens (payload: UserData): { accessToken: string; refreshToken: string }&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;86&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-43&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ saveToken (userId: number, refreshToken: string, entityManager: EntityManager)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;112&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-44&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ revokedToken (refreshToken: string, entityManager: EntityManager)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;138&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-45&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ findToken (refreshToken: string): RefreshToken&amp;amp;nbsp;&amp;amp;nbsp;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;164&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-46&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ validateAccessToken (token: string): UserData&amp;amp;nbsp;&amp;amp;nbsp;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;190&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-47&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-9&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ validateRefreshToken (token: string): UserData&amp;amp;nbsp;&amp;amp;nbsp;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;480&quot; y=&quot;216&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; parent=&quot;1&quot; style=&quot;swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;&quot; value=&quot;EmailService&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;190&quot; width=&quot;330&quot; x=&quot;90&quot; y=&quot;210&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-14&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ host: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;26&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-50&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ port: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;52&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-56&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ secure: bool&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;78&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-57&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ email: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;104&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-58&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ passwordEmail: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;130&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-15&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;&quot; value=&quot;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;8&quot; width=&quot;330&quot; y=&quot;156&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-16&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-13&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ sendActivationEmail(to: string, link: string)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;330&quot; y=&quot;164&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; parent=&quot;1&quot; style=&quot;swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;&quot; value=&quot;AdminWordService&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;216&quot; width=&quot;534&quot; x=&quot;293&quot; y=&quot;890&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-16&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ eng: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;26&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-19&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ pronunciationUrl: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;52&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-18&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ transcription: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;78&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-17&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ transcription: string&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;104&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-19&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;&quot; value=&quot;&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;8&quot; width=&quot;534&quot; y=&quot;130&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;_L6m9T75-ljy2NTBbYRm-20&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ create({eng: string, transcription: string,translation: string,&amp;amp;nbsp;pronunciationUrl: string})&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;138&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-10&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+ update (id: number, {eng: string, transcription: string,translation: string, pronunciationUrl: string})&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;164&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-11&quot; parent=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;&quot; value=&quot;+remove (id: number)&quot; vertex=&quot;1&quot;&gt;&#10;          &lt;mxGeometry height=&quot;26&quot; width=&quot;534&quot; y=&quot;190&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-3&quot; edge=&quot;1&quot; parent=&quot;1&quot; source=&quot;_L6m9T75-ljy2NTBbYRm-1&quot; style=&quot;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0.481;entryY=0.992;entryDx=0;entryDy=0;entryPerimeter=0;&quot; target=&quot;_L6m9T75-ljy2NTBbYRm-16&quot;&gt;&#10;          &lt;mxGeometry relative=&quot;1&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-7&quot; edge=&quot;1&quot; parent=&quot;1&quot; source=&quot;_L6m9T75-ljy2NTBbYRm-17&quot; style=&quot;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0.481;entryY=1.205;entryDx=0;entryDy=0;entryPerimeter=0;&quot; target=&quot;_L6m9T75-ljy2NTBbYRm-64&quot;&gt;&#10;          &lt;mxGeometry relative=&quot;1&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;        &lt;mxCell id=&quot;PE6L-6shhf5JGSrGQ6lv-12&quot; edge=&quot;1&quot; parent=&quot;1&quot; source=&quot;_L6m9T75-ljy2NTBbYRm-59&quot; style=&quot;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.999;entryY=0.062;entryDx=0;entryDy=0;entryPerimeter=0;&quot; target=&quot;_L6m9T75-ljy2NTBbYRm-4&quot;&gt;&#10;          &lt;mxGeometry relative=&quot;1&quot; as=&quot;geometry&quot; /&gt;&#10;        &lt;/mxCell&gt;&#10;      &lt;/root&gt;&#10;    &lt;/mxGraphModel&gt;&#10;  &lt;/diagram&gt;&#10;&lt;/mxfile&gt;&#10;"><defs/><g><g data-cell-id="0"><g data-cell-id="1"><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-6"><g transform="translate(0.5,0.5)"><path d="M 190 336 L 649.03 245.31" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 654.18 244.3 L 647.99 249.09 L 649.03 245.31 L 646.64 242.22 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-1"><g transform="translate(0.5,0.5)"><path d="M 0 362 L 0 336 L 380 336 L 380 362" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(#ffffff, var(--ge-dark-color, #121212)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 0 362 L 0 604 L 380 604 L 380 362" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 0 362 L 380 362" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe center; width: 378px; height: 1px; padding-top: 343px; margin-left: 1px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: normal; word-wrap: normal; ">AuthService</div></div></div></foreignObject><text x="190" y="355" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px" text-anchor="middle" font-weight="bold">AuthService</text></switch></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-2"><g transform="translate(0.5,0.5)"><rect x="0" y="362" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 369px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ id: number</div></div></div></foreignObject><text x="6" y="381" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ id: number</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-25"><g transform="translate(0.5,0.5)"><rect x="0" y="388" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 395px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ email: string</div></div></div></foreignObject><text x="6" y="407" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ email: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-35"><g transform="translate(0.5,0.5)"><rect x="0" y="414" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 421px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ role: UserRole</div></div></div></foreignObject><text x="6" y="433" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ role: UserRole</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-48"><g transform="translate(0.5,0.5)"><rect x="0" y="440" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 447px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ refreshToken: string</div></div></div></foreignObject><text x="6" y="459" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ refreshToken: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-3"><g transform="translate(0.5,0.5)"><path d="M 0 470 L 380 470" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-4"><g transform="translate(0.5,0.5)"><rect x="0" y="474" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 481px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ register (email: string, password: string): AuthResponse </div></div></div></foreignObject><text x="6" y="493" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ register (email: string, password: string): AuthResponse </text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-21"><g transform="translate(0.5,0.5)"><rect x="0" y="500" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 507px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ login (email: string, password: string): AuthResponse</div></div></div></foreignObject><text x="6" y="519" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ login (email: string, password: string): AuthResponse</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-22"><g transform="translate(0.5,0.5)"><rect x="0" y="526" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 533px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ logout (refreshToken: string)</div></div></div></foreignObject><text x="6" y="545" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ logout (refreshToken: string)</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-23"><g transform="translate(0.5,0.5)"><rect x="0" y="552" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 559px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ activate (activationLink: string)</div></div></div></foreignObject><text x="6" y="571" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ activate (activationLink: string)</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-24"><g transform="translate(0.5,0.5)"><rect x="0" y="578" width="380" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 370px; height: 1px; padding-top: 585px; margin-left: 6px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ refresh (refreshToken<span style="background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));">: string): AuthResponse</span></div></div></div></foreignObject><text x="6" y="597" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ refresh (refreshToken: string): AuthResponse</text></switch></g></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-5"><g transform="translate(0.5,0.5)"><path d="M 454 352 L 454 326 L 890 326 L 890 352" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(#ffffff, var(--ge-dark-color, #121212)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 454 352 L 454 672 L 890 672 L 890 352" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 454 352 L 890 352" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe center; width: 434px; height: 1px; padding-top: 333px; margin-left: 455px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: normal; word-wrap: normal; ">UserWordService</div></div></div></foreignObject><text x="672" y="345" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px" text-anchor="middle" font-weight="bold">UserWordService</text></switch></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-6"><g transform="translate(0.5,0.5)"><rect x="454" y="352" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 359px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ eng: string</div></div></div></foreignObject><text x="460" y="371" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ eng: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-1"><g transform="translate(0.5,0.5)"><rect x="454" y="378" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 385px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ transcription: string</div></div></div></foreignObject><text x="460" y="397" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ transcription: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-13"><g transform="translate(0.5,0.5)"><rect x="454" y="404" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 411px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ transcription: string</div></div></div></foreignObject><text x="460" y="423" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ transcription: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-14"><g transform="translate(0.5,0.5)"><rect x="454" y="430" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 437px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ pronunciationUrl: string</div></div></div></foreignObject><text x="460" y="449" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ pronunciationUrl: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-15"><g transform="translate(0.5,0.5)"><rect x="454" y="456" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 463px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+  progress: number</div></div></div></foreignObject><text x="460" y="475" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+  progress: number</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-7"><g transform="translate(0.5,0.5)"><path d="M 454 486 L 890 486" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-8"><g transform="translate(0.5,0.5)"><rect x="454" y="490" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 497px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ findAll (): Word[]</div></div></div></foreignObject><text x="460" y="509" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ findAll (): Word[]</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-59"><g transform="translate(0.5,0.5)"><rect x="454" y="516" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 523px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ getWordsAmount (userId: string): nimber</div></div></div></foreignObject><text x="460" y="535" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ getWordsAmount (userId: string): nimber</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-60"><g transform="translate(0.5,0.5)"><rect x="454" y="542" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 549px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ getIdsUnknownWord (userId: string): number[]</div></div></div></foreignObject><text x="460" y="561" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ getIdsUnknownWord (userId: string): number[]</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-61"><g transform="translate(0.5,0.5)"><rect x="454" y="568" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 575px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ getUnknownWord (ids: string): Word[]</div></div></div></foreignObject><text x="460" y="587" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ getUnknownWord (ids: string): Word[]</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-62"><g transform="translate(0.5,0.5)"><rect x="454" y="594" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 601px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ getKnownWord (userId: string, amountWords: number): Word[]</div></div></div></foreignObject><text x="460" y="613" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ getKnownWord (userId: string, amountWords: number): Word[]</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-63"><g transform="translate(0.5,0.5)"><rect x="454" y="620" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 627px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ getWordsProgress (userId: string): { wordId: number, progress: number }[]</div></div></div></foreignObject><text x="460" y="639" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ getWordsProgress (userId: string): { wordId: number, progress: number...</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-64"><g transform="translate(0.5,0.5)"><rect x="454" y="646" width="436" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 426px; height: 1px; padding-top: 653px; margin-left: 460px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ updateWordsProgress ( { wordId: number, progress: number })</div></div></div></foreignObject><text x="460" y="665" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ updateWordsProgress ( { wordId: number, progress: number })</text></switch></g></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-9"><g transform="translate(0.5,0.5)"><path d="M 410 26 L 410 0 L 890 0 L 890 26" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(#ffffff, var(--ge-dark-color, #121212)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 410 26 L 410 242 L 890 242 L 890 26" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 410 26 L 890 26" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe center; width: 478px; height: 1px; padding-top: 7px; margin-left: 411px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: normal; word-wrap: normal; ">TokenService</div></div></div></foreignObject><text x="650" y="19" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px" text-anchor="middle" font-weight="bold">TokenService</text></switch></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-37"><g transform="translate(0.5,0.5)"><rect x="410" y="26" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 33px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ accessToken: string</div></div></div></foreignObject><text x="416" y="45" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ accessToken: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-36"><g transform="translate(0.5,0.5)"><rect x="410" y="52" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 59px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ refreshToken: string</div></div></div></foreignObject><text x="416" y="71" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ refreshToken: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-11"><g transform="translate(0.5,0.5)"><path d="M 410 82 L 890 82" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-12"><g transform="translate(0.5,0.5)"><rect x="410" y="86" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 93px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ generateTokens (payload: UserData): { accessToken: string; refreshToken: string }</div></div></div></foreignObject><text x="416" y="105" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ generateTokens (payload: UserData): { accessToken: string; refreshToken: str...</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-43"><g transform="translate(0.5,0.5)"><rect x="410" y="112" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 119px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ saveToken (userId: number, refreshToken: string, entityManager: EntityManager)</div></div></div></foreignObject><text x="416" y="131" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ saveToken (userId: number, refreshToken: string, entityManager: EntityManage...</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-44"><g transform="translate(0.5,0.5)"><rect x="410" y="138" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 145px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ revokedToken (refreshToken: string, entityManager: EntityManager)</div></div></div></foreignObject><text x="416" y="157" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ revokedToken (refreshToken: string, entityManager: EntityManager)</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-45"><g transform="translate(0.5,0.5)"><rect x="410" y="164" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 171px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ findToken (refreshToken: string): RefreshToken  </div></div></div></foreignObject><text x="416" y="183" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ findToken (refreshToken: string): RefreshToken  </text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-46"><g transform="translate(0.5,0.5)"><rect x="410" y="190" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 197px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ validateAccessToken (token: string): UserData  </div></div></div></foreignObject><text x="416" y="209" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ validateAccessToken (token: string): UserData  </text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-47"><g transform="translate(0.5,0.5)"><rect x="410" y="216" width="480" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 470px; height: 1px; padding-top: 223px; margin-left: 416px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ validateRefreshToken (token: string): UserData  </div></div></div></foreignObject><text x="416" y="235" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ validateRefreshToken (token: string): UserData  </text></switch></g></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-13"><g transform="translate(0.5,0.5)"><path d="M 10 52 L 10 26 L 340 26 L 340 52" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(#ffffff, var(--ge-dark-color, #121212)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 10 52 L 10 216 L 340 216 L 340 52" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 10 52 L 340 52" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe center; width: 328px; height: 1px; padding-top: 33px; margin-left: 11px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: normal; word-wrap: normal; ">EmailService</div></div></div></foreignObject><text x="175" y="45" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px" text-anchor="middle" font-weight="bold">EmailService</text></switch></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-14"><g transform="translate(0.5,0.5)"><rect x="10" y="52" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 59px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ host: string</div></div></div></foreignObject><text x="16" y="71" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ host: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-50"><g transform="translate(0.5,0.5)"><rect x="10" y="78" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 85px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ port: string</div></div></div></foreignObject><text x="16" y="97" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ port: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-56"><g transform="translate(0.5,0.5)"><rect x="10" y="104" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 111px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ secure: bool</div></div></div></foreignObject><text x="16" y="123" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ secure: bool</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-57"><g transform="translate(0.5,0.5)"><rect x="10" y="130" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 137px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ email: string</div></div></div></foreignObject><text x="16" y="149" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ email: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-58"><g transform="translate(0.5,0.5)"><rect x="10" y="156" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 163px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ passwordEmail: string</div></div></div></foreignObject><text x="16" y="175" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ passwordEmail: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-15"><g transform="translate(0.5,0.5)"><path d="M 10 186 L 340 186" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-16"><g transform="translate(0.5,0.5)"><rect x="10" y="190" width="330" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 320px; height: 1px; padding-top: 197px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ sendActivationEmail(to: string, link: string)</div></div></div></foreignObject><text x="16" y="209" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ sendActivationEmail(to: string, link: string)</text></switch></g></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-17"><g transform="translate(0.5,0.5)"><path d="M 213 732 L 213 706 L 747 706 L 747 732" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(#ffffff, var(--ge-dark-color, #121212)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 213 732 L 213 922 L 747 922 L 747 732" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 213 732 L 747 732" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe center; width: 532px; height: 1px; padding-top: 713px; margin-left: 214px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: normal; word-wrap: normal; ">AdminWordService</div></div></div></foreignObject><text x="480" y="725" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px" text-anchor="middle" font-weight="bold">AdminWordService</text></switch></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-16"><g transform="translate(0.5,0.5)"><rect x="213" y="732" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 739px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ eng: string</div></div></div></foreignObject><text x="219" y="751" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ eng: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-19"><g transform="translate(0.5,0.5)"><rect x="213" y="758" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 765px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ pronunciationUrl: string</div></div></div></foreignObject><text x="219" y="777" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ pronunciationUrl: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-18"><g transform="translate(0.5,0.5)"><rect x="213" y="784" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 791px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ transcription: string</div></div></div></foreignObject><text x="219" y="803" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ transcription: string</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-17"><g transform="translate(0.5,0.5)"><rect x="213" y="810" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 817px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ transcription: string</div></div></div></foreignObject><text x="219" y="829" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ transcription: string</text></switch></g></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-19"><g transform="translate(0.5,0.5)"><path d="M 213 840 L 747 840" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="_L6m9T75-ljy2NTBbYRm-20"><g transform="translate(0.5,0.5)"><rect x="213" y="844" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 851px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ create({eng: string, transcription: string,translation: string, pronunciationUrl: string})</div></div></div></foreignObject><text x="219" y="863" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ create({eng: string, transcription: string,translation: string, pronunciationUrl: str...</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-10"><g transform="translate(0.5,0.5)"><rect x="213" y="870" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 877px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+ update (id: number, {eng: string, transcription: string,translation: string, pronunciationUrl: string})</div></div></div></foreignObject><text x="219" y="889" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+ update (id: number, {eng: string, transcription: string,translation: string, pronunci...</text></switch></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-11"><g transform="translate(0.5,0.5)"><rect x="213" y="896" width="534" height="26" fill="none" stroke="none" pointer-events="all"/></g><g><g><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 524px; height: 1px; padding-top: 903px; margin-left: 219px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 22px; overflow: hidden; color: #000000; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: light-dark(#000000, #ffffff); line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">+remove (id: number)</div></div></div></foreignObject><text x="219" y="915" fill="light-dark(#000000, #ffffff)" font-family="Helvetica" font-size="12px">+remove (id: number)</text></switch></g></g></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-3"><g transform="translate(0.5,0.5)"><path d="M 178.79 336 L 169.26 222.14" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 168.82 216.91 L 172.89 223.59 L 169.26 222.14 L 165.92 224.17 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-7"><g transform="translate(0.5,0.5)"><path d="M 625.18 706 L 658.61 681.13" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 662.82 678 L 659.29 684.98 L 658.61 681.13 L 655.11 679.37 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g><g data-cell-id="PE6L-6shhf5JGSrGQ6lv-12"><g transform="translate(0.5,0.5)"><path d="M 454 529 L 384.79 479.33" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke" style="stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/><path d="M 380.53 476.26 L 388.26 477.5 L 384.79 479.33 L 384.17 483.19 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="all" style="fill: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); stroke: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));"/></g></g></g></g></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.drawio.com/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Text is not SVG - cannot display</text></a></switch></svg>g ClassDiogramDictionaryBack.drawio.svg…]()
