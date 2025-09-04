from pathlib import Path
import json

# ---------------- Paths ----------------
BASE_DIR = Path(__file__).parent.parent.parent
DATASET_DIR = BASE_DIR / "src/dataset"
MODELS_DIR = BASE_DIR / "src/models_ai"
COMMANDS_FILE = BASE_DIR / "src/commands.json"

# Создаем папки и файл команд, если их нет
DATASET_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
if not COMMANDS_FILE.exists():
    COMMANDS_FILE.write_text(json.dumps(["привет","погода","время","пока","unknown","wake"], ensure_ascii=False))
