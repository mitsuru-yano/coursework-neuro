### FILE: model.py
import torch
from transformers import Wav2Vec2Model, Wav2Vec2Processor
import torch.nn as nn
from pathlib import Path
import json
import numpy as np
from src.utils.audio_utils import load_wav

# -------------------- Классификатор --------------------
class SimpleClassifier(nn.Module):
    """Простейший полносвязный классификатор для эмбеддингов Wav2Vec2"""
    def __init__(self, base_dim, n_classes):
        super().__init__()
        self.fc = nn.Linear(base_dim, n_classes)

    def forward(self, x):
        # x: (batch, feat_dim)
        return self.fc(x)

# -------------------- Основная модель --------------------
class VoiceModel:
    """Модель для распознавания голосовых команд на основе Wav2Vec2"""
    def __init__(self, dataset_dir='dataset', models_dir='models', commands_file='commands.json'):
        self.dataset_dir = Path(dataset_dir)
        self.models_dir = Path(models_dir)
        self.commands_file = Path(commands_file)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Загружаем предобученный Wav2Vec2 для русского языка
        self.pretrained_name = 'jonatasgrosman/wav2vec2-large-xlsr-53-russian'
        print('Loading feature extractor and base model...')
        self.processor = Wav2Vec2Processor.from_pretrained(self.pretrained_name)
        self.base = Wav2Vec2Model.from_pretrained(self.pretrained_name).to(self.device)

        # Замораживаем веса базовой модели
        for p in self.base.parameters():
            p.requires_grad = False

        # Загружаем список команд
        self.commands = json.loads(self.commands_file.read_text(encoding='utf-8'))
        self.label2idx = {c:i for i,c in enumerate(self.commands)}
        self.idx2label = {i:c for c,i in self.label2idx.items()}

        # Классификатор для эмбеддингов
        hidden = self.base.config.hidden_size
        self.classifier = SimpleClassifier(hidden, len(self.commands)).to(self.device)

        # Слово для "wake"
        self.wake_word = 'wake' if 'wake' in self.commands else self.commands[0]

        # Пытаемся загрузить сохранённую модель
        self._load_if_exists()

    # -------------------- Загрузка / сохранение --------------------
    def _load_if_exists(self):
        p = self.models_dir / 'current_model.pt'
        if p.exists():
            sd = torch.load(p, map_location=self.device)
            try:
                self.classifier.load_state_dict(sd['classifier'])
                print('Loaded classifier from', p)
            except Exception as e:
                print('Failed to load classifier:', e)

    def _save(self):
        p = self.models_dir / 'current_model.pt'
        torch.save({'classifier': self.classifier.state_dict()}, p)
        print('Saved model to', p)

    # -------------------- Подготовка данных --------------------
    def _build_dataset(self):
        """Возвращает список (wav_path, label_idx) для полного обучения"""
        self.commands = json.loads(self.commands_file.read_text(encoding='utf-8'))
        self.label2idx = {c:i for i,c in enumerate(self.commands)}
        self.idx2label = {i:c for c,i in self.label2idx.items()}
        samples = []
        for c in self.commands:
            folder = self.dataset_dir / c
            if not folder.exists():
                continue
            for p in folder.glob('*.wav'):
                samples.append((str(p), self.label2idx[c]))
        return samples

    # -------------------- Эмбеддинг --------------------
    def extract_embedding(self, wav_np: np.ndarray, sr: int):
        """Извлекает эмбеддинг для WAV с помощью Wav2Vec2"""
        inputs = self.processor(wav_np, sampling_rate=sr, return_tensors='pt', padding=True)
        input_values = inputs.input_values.to(self.device)
        with torch.no_grad():
            out = self.base(input_values).last_hidden_state  # (B, T, H)
            emb = out.mean(dim=1)  # усреднение по временной оси
        return emb.cpu()

    # -------------------- Предсказание --------------------
    def predict(self, wav_path: str):
        wav, sr = load_wav(wav_path)
        emb = self.extract_embedding(wav, sr).to(self.device)
        self.classifier.eval()
        with torch.no_grad():
            logits = self.classifier(emb)
            probs = torch.softmax(logits, dim=-1)
            prob, idx = torch.max(probs, dim=-1)
            label = self.idx2label[int(idx.item())]
            return label, float(prob.item())

    # -------------------- Фоновое обучение --------------------
    async def train_background(self):
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.train)

    # -------------------- Полное обучение --------------------
    def train(self, epochs=10, batch_size=4, lr=1e-3):
        """Полное обучение на всех данных из dataset/"""
        print('Building dataset...')
        samples = self._build_dataset()
        if len(samples) < 2:
            print('Not enough samples to train.')
            return
        X, y = [], []
        for path, label in samples:
            wav, sr = load_wav(path)
            emb = self.extract_embedding(wav, sr)
            X.append(emb.squeeze(0).numpy())
            y.append(label)
        X = torch.tensor(np.stack(X), dtype=torch.float32).to(self.device)
        y = torch.tensor(y, dtype=torch.long).to(self.device)
        dataset = torch.utils.data.TensorDataset(X, y)
        loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

        n_classes = len(self.commands)
        if self.classifier.fc.out_features != n_classes:
            self.classifier = SimpleClassifier(self.base.config.hidden_size, n_classes).to(self.device)

        opt = torch.optim.Adam(self.classifier.parameters(), lr=lr)
        loss_fn = nn.CrossEntropyLoss()

        print('Start training.. samples=', len(dataset))
        for epoch in range(epochs):
            self.classifier.train()
            total_loss = 0.0
            for xb, yb in loader:
                opt.zero_grad()
                logits = self.classifier(xb)
                loss = loss_fn(logits, yb)
                loss.backward()
                opt.step()
                total_loss += loss.item()
            print(f'Epoch {epoch+1}/{epochs}, loss={total_loss/len(loader):.4f}')
        self._save()

    # -------------------- Инкрементальное обучение --------------------
    def train_incremental(self, file_path: str, label: str, epochs=3, lr=1e-3):
        """
        Дообучение модели на одном примере.
        """
        # 1️⃣ Обновляем список команд
        if label not in self.commands:
            self.commands.append(label)
            self.label2idx = {lbl: i for i, lbl in enumerate(self.commands)}
            self.idx2label = {i: lbl for i, lbl in enumerate(self.commands)}
            n_classes = len(self.commands)
            self.classifier = SimpleClassifier(self.base.config.hidden_size, n_classes).to(self.device)

        # 2️⃣ Загружаем WAV
        wav, sr = load_wav(file_path)
        emb = self.extract_embedding(wav, sr).to(self.device)

        # 3️⃣ Подготовка данных
        X = emb
        y = torch.tensor([self.label2idx[label]], dtype=torch.long, device=self.device)

        # 4️⃣ Обучение
        opt = torch.optim.Adam(self.classifier.parameters(), lr=lr)
        loss_fn = nn.CrossEntropyLoss()
        self.classifier.train()
        for epoch in range(epochs):
            opt.zero_grad()
            logits = self.classifier(X)
            loss = loss_fn(logits, y)
            loss.backward()
            opt.step()
            print(f"Incremental Epoch {epoch+1}/{epochs}, loss={loss.item():.4f}")

        # 5️⃣ Сохраняем
        self._save()

    # -------------------- Сохранение классификатора --------------------
    def save_model(self):
        torch.save(self.classifier.state_dict(), self.models_dir / "classifier.pth")
