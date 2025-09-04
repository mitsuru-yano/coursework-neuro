from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import uuid
from src.models_ai.inited_model import voice_model
from src.utils.paths import BASE_DIR

router = APIRouter()



# ---------------- WebSocket: Wake-word ----------------
@router.websocket('/ws')
async def websocket_endpoint(ws: WebSocket):
    """
    Детекция wake-word в потоке аудио
    """
    await ws.accept()
    try:
        while True:
            data = await ws.receive_bytes()
            tmpfile = BASE_DIR / f"ws_{uuid.uuid4().hex}.wav"
            tmpfile.write_bytes(data)

            label, prob = voice_model.predict(str(tmpfile))
            tmpfile.unlink(missing_ok=True)

            wake_word = voice_model.wake_word  # обычно 'wake'

            print(f"label: {label} => {wake_word} => {prob}")

            if label == wake_word and prob > 0.85:
                await ws.send_json({"wake": True, "label": label, "confidence": float(prob)})
            else:
                await ws.send_json({"wake": False})

    except WebSocketDisconnect:
        return
