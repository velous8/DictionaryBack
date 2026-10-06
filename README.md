# Nest Dictionary API

REST API для приложения по изучению английских слов.  
Регистрация, JWT-авторизация, активация аккаунта по email, словарь, прогресс изучения и админ-управление словарём.

[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Содержание

- [О проекте](#о-проекте)
- [Стек](#стек)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [API](#api)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Тестирование](#тестирование)
- [Скрипты](#скрипты)
- [Roadmap](#roadmap)
- [Лицензия](#лицензия)
- [Контакты](#контакты)

## О проекте

**Nest Dictionary API** — backend для изучения английской лексики.  
Отвечает за:

- регистрацию, авторизацию и аутентификацию пользователей;
- активацию аккаунтов через email;
- хранение и выдачу слов;
- изменение прогресса изучения;
- CRUD слов для администратора.

### Демо

- Swagger: `http://localhost:3000/api/docs`
- Скриншот: `docs/images/swagger.png`

## Стек

- **Backend:** NestJS, TypeScript
- **БД:** PostgreSQL, TypeORM / Prisma
- **Auth:** JWT, Passport
- **Email:** Nodemailer
- **Документация:** Swagger
- **Тесты:** Jest, Supertest
- **Инфраструктура:** Docker, docker-compose
- **Качество:** ESLint, Prettier

## Быстрый старт

### Требования

- Node.js >= 18
- Docker и Docker Compose
- npm / yarn / pnpm

### Запуск

```bash
git clone https://github.com/your-username/nest-dictionary-api.git
cd nest-dictionary-api
cp .env.example .env
docker-compose up -d
npm install
npm run migration:run
npm run seed
npm run start:dev
