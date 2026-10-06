# Nest Dictionary API

Backend для приложения по изучению английских слов.

API предоставляет регистрацию и авторизацию пользователей, активацию аккаунта через email, JWT-аутентификацию, работу со словарём, персональный прогресс изучения слов и административное управление словарём.

## Стек

* **NestJS**
* **TypeScript**
* **PostgreSQL**
* **TypeORM**
* **JWT**
* **bcrypt**
* **Nodemailer**
* **class-validator**

## Основные возможности

* Регистрация и авторизация пользователей
* Активация аккаунта через email
* JWT-аутентификация
* Refresh Token
* Получение слов из словаря
* Получение неизвестных и изучаемых слов
* Отслеживание прогресса изучения
* Административный CRUD для слов

## Архитектура

### Диаграмма классов

<img width="891" height="926" alt="ClassDiagram Dictionary Back" src="https://github.com/user-attachments/assets/c8b6e150-b0c7-4c54-9962-3b62091d5727" />

### ER-диаграмма базы данных

<img width="662" height="541" alt="ER Dictionary" src="https://github.com/user-attachments/assets/c80726e3-31a0-42dc-82e9-767abff49531" />

### Диаграмма последовательности

<img width="831" height="1441" alt="SequenceDiagram Dictionary Back" src="https://github.com/user-attachments/assets/af480a5b-5a02-4f15-b7f0-e2b524aa4d22" />

## Основные модули

### AuthModule

Отвечает за:

* регистрацию и авторизацию;
* активацию аккаунта;
* JWT-аутентификацию;
* работу с access и refresh токенами;
* отправку email.

### WordModule

Отвечает за:

* получение слов;
* получение неизвестных слов;
* получение изучаемых слов;
* получение прогресса;
* изменение прогресса;
* CRUD слов для администратора.

## Запуск

```bash
npm install
npm run start:dev
```

API запускается на:

```text
http://localhost:3000
```

Для работы приложения необходимо настроить переменные окружения в `.env`.

## Основные API

### Auth

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/activate/:activationLink
```

### Words

```text
GET   /word
GET   /word/amount
GET   /word/idsUnknown
GET   /word/unknown
GET   /word/known
GET   /word/progress
PATCH /word/progress
```

### Admin

```text
POST   /admin/word
PATCH  /admin/word/:id
DELETE /admin/word/:id
```
