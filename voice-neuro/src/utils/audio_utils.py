import torchaudio
import numpy as np
from pathlib import Path

SAMPLE_RATE = 16000

def load_wav(path: str, target_sr=SAMPLE_RATE):
    wav, sr = torchaudio.load(path)
    if wav.shape[0] > 1:
        wav = wav.mean(dim=0, keepdim=True)
    if sr != target_sr:
        wav = torchaudio.functional.resample(wav, sr, target_sr)
    # normalize
    wav = wav / (wav.abs().max() + 1e-6)
    return wav.squeeze(0).numpy(), target_sr
