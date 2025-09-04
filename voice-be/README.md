# node-auth-proxy

Минимальный Node.js проект:
- Express + PostgreSQL (users: email, password, fname, lname)
- JWT auth (register/login)
- REST proxy to Python FastAPI
- WebSocket proxy: FE -> Socket.IO -> Node -> Python WebSocket (ws). Fallback to HTTP POST /ws-proxy

## Setup

1. Скопировать `.env` и настроить значения (DATABASE_URL, PYTHON_HTTP, PYTHON_WS).
2. Установить зависимости:
```bash
npm install
```
3. Запустить Postgres и выполнить `schema.sql`.
4. Запустить Node:
```bash
npm start
```

## Использование WS

Frontend подключается к Node через Socket.IO (в браузере):
```js
import { io } from "socket.io-client";
const socket = io('http://localhost:3000', { extraHeaders: { Authorization: 'Bearer <token>' } });

socket.emit('ws-message', { action: 'predict', payload: {...} });

socket.on('response', (data) => console.log('response', data));
```

Node пересылает сообщения в Python WebSocket (`PYTHON_WS`). Ожидается, что Python отвечает JSON с полем `id` совпадающим с отправленным, чтобы Node смог привязать ответ к клиенту. Если Python WS недоступен, Node отправит POST на `${PYTHON_HTTP}/ws-proxy`.
