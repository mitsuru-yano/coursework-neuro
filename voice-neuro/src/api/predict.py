from fastapi import APIRouter, File, UploadFile
from pathlib import Path
import uuid
from src.utils.file import convert_to_wav
from src.utils.paths import BASE_DIR
from src.models_ai.inited_model import voice_model

router = APIRouter()

# ---------------- Endpoint: Predict ----------------
@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Предсказание команды по WAV файлу
    """
    ext = Path(file.filename).suffix or ".wav"
    tmp = BASE_DIR / f"tmp_{uuid.uuid4().hex}{ext}"
    tmp.write_bytes(await file.read())

    if ext.lower() != ".wav":
        tmp_wav = convert_to_wav(tmp)
        tmp.unlink()
        tmp = tmp_wav

    try:
        label, prob = voice_model.predict(str(tmp))
        return {'command': label, 'confidence': float(prob)}
    finally:
        tmp.unlink(missing_ok=True)
