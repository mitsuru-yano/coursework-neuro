from fastapi import APIRouter, Form, Body
from fastapi.responses import JSONResponse
import shutil
from src.utils.file import load_commands, save_commands
from src.utils.paths import DATASET_DIR

router = APIRouter()

# ---------------- Endpoints: Commands ----------------
@router.get("/commands")
async def get_commands():
    """
    Возвращает список команд
    """
    return {"commands": load_commands()}

@router.post("/add-command")
async def add_command(name: str = Form(...)):
    """
    Добавляет новую команду
    """
    cmds = load_commands()
    if name in cmds:
        return JSONResponse({'status':'exists','message':'Команда уже существует'})
    cmds.append(name)
    (DATASET_DIR / name).mkdir(parents=True, exist_ok=True)
    save_commands(cmds)
    return {'status':'ok','message':'Команда добавлена','commands':cmds}

@router.delete("/command/{name}")
async def delete_command(name: str):
    """
    Удаляет команду и её файлы
    """
    cmds = load_commands()
    if name not in cmds:
        return JSONResponse({'status':'not_found','message':'Команда не найдена'}, status_code=404)
    cmds.remove(name)
    save_commands(cmds)
    folder = DATASET_DIR / name
    if folder.exists():
        shutil.rmtree(folder)
    return {'status':'ok','message':'Команда удалена','commands':cmds}

@router.post("/sync-commands")
async def sync_commands(payload: dict = Body(...)):
    """
    Полная синхронизация команд из NodeJS.
    payload = { "commands": ["привет", "погода", "время", ...] }
    """
    new_cmds = payload.get("commands", [])
    if not isinstance(new_cmds, list):
        return JSONResponse({"status": "error", "message": "commands must be a list"}, status_code=400)

    # 1. Сохраняем команды в JSON
    save_commands(new_cmds)

    # 2. Создаём папки под новые команды
    for name in new_cmds:
        (DATASET_DIR / name).mkdir(parents=True, exist_ok=True)

    # 3. Удаляем папки, которых больше нет в списке
    for folder in DATASET_DIR.iterdir():
        if folder.is_dir() and folder.name not in new_cmds:
            shutil.rmtree(folder)

    return {"status": "ok", "commands": new_cmds}
