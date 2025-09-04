# Project: voice-assistant-backend (FastAPI + Wav2Vec2)

# Files are separated by markers: ### FILE: <path>

### FILE: README.md

"""
Voice Assistant Backend (FastAPI)

Кратко:

-   FastAPI приложение для локального запуска на Windows 11
-   Использует Hugging Face Wav2Vec2 (предобученную русскоязычную модель)
-   Поддерживает: добавление команд, загрузку примеров, дообучение, инференс, WebSocket wake-word

Запуск (быстрое):

1. Установи Python 3.10+ и git.
2. Создай виртуальное окружение:
   python -m venv .venv
   .\.venv\Scripts\activate
3. Установи зависимости:
   pip install -r requirements.txt
4. Запусти сервер:
   uvicorn app:app --host 127.0.0.1 --port 8000 --reload

Примечания:

-   По умолчанию ожидаем WAV 16kHz mono. В FE нужно ресемплировать/конвертировать.
-   Можно добавить команды через POST /add-command и добавить примеры через POST /train (multipart/form-data).
-   WebSocket /ws принимает двоичные пакеты аудио (WAV bytes) и возвращает JSON-уведомление {"wake": true} при детекции wake-word.

"""
