from fastapi import APIRouter, Form, File, UploadFile
from pathlib import Path
import uuid
import asyncio

from src.utils.paths import DATASET_DIR
from src.utils.file import convert_to_wav
from src.models_ai.inited_model import voice_model

router = APIRouter()


# ---------------- Endpoint: Train one file ----------------
@router.post("/train-solo")
async def train_solo(command: str = Form(...), file: UploadFile = File(...)):
    """
    Дообучение на одном WAV файле
    """
    if not command or not file:
        return {'status':'error','message':'Не переданы command или file'}

    folder = DATASET_DIR / command
    folder.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix or '.wav'
    tmp = folder / f"{uuid.uuid4().hex}{ext}"
    tmp.write_bytes(await file.read())

    # Конвертация в WAV, если необходимо
    if ext.lower() != ".wav":
        try:
            wav_file = convert_to_wav(tmp)  # функция конвертации
            tmp.unlink()
            tmp = wav_file
        except Exception as e:
            return {'status':'error','message':f'Ошибка конвертации: {e}'}

    # Дообучение модели
    try:
        print("before train_incremental")
        voice_model.train_incremental(str(tmp), command)
        print("after train_incremental")
        status = 'ok'
        message = 'Файл сохранён и модель дообучена'
    except Exception as e:
        status = 'error'
        message = f'Ошибка обучения: {e}'

    return {'status': status, 'message': message, 'saved': str(tmp)}

# ---------------- Endpoint: Train multiple files ----------------
@router.post("/train")
async def train_multiple(command: str = Form(...), files: list[UploadFile] = File(...)):
    """
    Дообучение на нескольких WAV файлах
    """
    if not command or not files:
        return {'status':'error','message':'Не переданы command или files'}

    folder = DATASET_DIR / command
    folder.mkdir(parents=True, exist_ok=True)

    saved_files = []
    errors = []

    for file in files:
        ext = Path(file.filename).suffix or '.wav'
        tmp = folder / f"{uuid.uuid4().hex}{ext}"
        tmp.write_bytes(await file.read())

        # Конвертация в WAV
        if ext.lower() != ".wav":
            try:
                wav_file = convert_to_wav(tmp)
                tmp.unlink()
                tmp = wav_file
            except Exception as e:
                errors.append(f"{file.filename}: {e}")
                continue

        # Дообучение модели на этом файле
        try:
            voice_model.train_incremental(str(tmp), command)
            saved_files.append(str(tmp))
        except Exception as e:
            errors.append(f"{file.filename}: {e}")

    status = 'ok' if not errors else 'partial'
    message = 'Файлы сохранены и модель дообучена' if not errors else f'Ошибки при обучении: {errors}'

    return {'status': status, 'message': message, 'saved': saved_files}


training_status = {
    "running": False,
    "message": None
}

# ---------------- Endpoint: Train background ----------------
@router.get("/train-background")
async def train_background():
    """
    Запускает полное переобучение модели в фоне.
    """
    global training_status
    loop = asyncio.get_event_loop()
    try:
        if training_status["running"]:
            return {"status": "error", "message": "Обучение уже запущено"}

        training_status = {"running": True, "message": "Обучение запущено"}

        async def background_task():
            try:
                await voice_model.train_background()
                training_status.update({"running": False, "message": "Обучение завершено"})
            except Exception as e:
                training_status.update({"running": False, "message": f"Ошибка: {e}"})

        loop.create_task(background_task())
        return {"status": "ok", "message": "Фоновое обучение запущено"}
    except Exception as e:
        return {"status": "error", "message": f"Ошибка запуска: {e}"}

@router.get("/train-status")
async def train_status():
    return training_status
