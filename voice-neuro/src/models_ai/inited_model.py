from src.utils.paths import DATASET_DIR, MODELS_DIR, COMMANDS_FILE
from src.models_ai.model import VoiceModel

voice_model = VoiceModel(
    dataset_dir=str(DATASET_DIR),
    models_dir=str(MODELS_DIR),
    commands_file=str(COMMANDS_FILE)
)
