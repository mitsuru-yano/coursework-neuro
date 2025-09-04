from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import commands, train, predict, websocket

# ---------------- FastAPI app ----------------
app = FastAPI(title="Voice Assistant Backend")

# Разрешаем CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # можно ограничить на свой домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(commands.router)
app.include_router(train.router)
app.include_router(predict.router)
app.include_router(websocket.router)


# ---------------- Run ----------------
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
