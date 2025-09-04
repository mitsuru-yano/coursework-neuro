import json
from pathlib import Path
from pydub import AudioSegment
from .paths import COMMANDS_FILE


# ---------------- Utility ----------------
def load_commands():
    """Загрузить список команд"""
    return json.loads(COMMANDS_FILE.read_text(encoding='utf-8'))

def save_commands(cmds):
    """Сохранить список команд"""
    COMMANDS_FILE.write_text(json.dumps(cmds, ensure_ascii=False), encoding='utf-8')

def convert_to_wav(src_path: Path) -> Path:
    """Конвертируем любой аудиофайл в wav"""
    audio = AudioSegment.from_file(src_path)
    wav_path = src_path.with_suffix(".wav")
    audio.export(wav_path, format="wav")
    return wav_path
