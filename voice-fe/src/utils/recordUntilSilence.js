// recordUntilSilence.js
export async function recordUntilSilence(
    audioCtx,
    micStream,
    bufferRef,
    {
      // чувствительность VAD (0.01–0.05), подстрой в проекте
      silenceThreshold = 0.02,
      // сколько подряд мс тишины => стоп
      maxSilence = 1000,
      // максимум длительности (страховка)
      maxDuration = 10000,
      // шаг опроса
      chunkSize = 50,
      // через сколько мс после TTS вообще начинать слушать
      startDelay = 120,
      // нужно, чтобы старт записи был стабильным (речь держится >= minSpeechMs)
      minSpeechMs = 120,
      // захватываем небольшой «хвост» перед стартом, чтобы не обрезать начало слова
      preRollMs = 150,
      // вкл/выкл простую отладку
      debug = false,
    } = {}
  ) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    // Подготовка анализатора
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.05;

    const source = audioCtx.createMediaStreamSource(micStream);
    source.connect(analyser);

    const timeDomain = new Uint8Array(analyser.fftSize);

    const getVolume = () => {
      analyser.getByteTimeDomainData(timeDomain);
      let sumSquares = 0;
      for (let i = 0; i < timeDomain.length; i++) {
        const v = (timeDomain[i] - 128) / 128;
        sumSquares += v * v;
      }
      return Math.sqrt(sumSquares / timeDomain.length); // RMS [0..~1]
    };

    // КРИТИЧЕСКОЕ: небольшой холдофф после TTS и очистка ring-буфера — делается СНАРУЖИ,
    // но здесь на всякий случай даём микрофону стабилизироваться:
    await delay(startDelay);

    // Фазы: ждём начала речи -> пишем до тишины
    let started = false;
    let aboveMs = 0;
    let silenceMs = 0;
    let elapsed = 0;

    // Локальный пул кадров
    const collected = [];

    // Pre-roll кольцевой буфер
    const preRollFrames = [];
    let preRollSamples = 0;
    const samplesPerMs = audioCtx.sampleRate / 1000;
    const preRollMaxSamples = Math.ceil(preRollMs * samplesPerMs);

    const pumpFromGlobalBuffer = () => {
      while (bufferRef.current.length > 0) {
        const frame = bufferRef.current.shift();
        if (!started) {
          // до старта — в pre-roll
          preRollFrames.push(frame);
          preRollSamples += frame.length;
          // подрезаем старое
          while (preRollSamples > preRollMaxSamples && preRollFrames.length > 0) {
            preRollSamples -= preRollFrames[0].length;
            preRollFrames.shift();
          }
        } else {
          // после старта — в основной массив
          collected.push(frame);
        }
      }
    };

    if (debug) console.log("[VAD] wait speech…");
    while (!started && elapsed < maxDuration) {
      pumpFromGlobalBuffer();
      const vol = getVolume();
      if (vol >= silenceThreshold) {
        aboveMs += chunkSize;
        if (aboveMs >= minSpeechMs) {
          started = true;
          // добавляем pre-roll к началу
          if (preRollFrames.length) collected.push(...preRollFrames);
          if (debug) console.log("[VAD] speech started; preRollFrames:", preRollFrames.length);
        }
      } else {
        aboveMs = 0;
      }
      elapsed += chunkSize;
      await delay(chunkSize);
    }

    if (!started) {
      if (debug) console.warn("[VAD] speech not detected (timeout)");
      return new Float32Array(0);
    }

    // Пишем до тишины или до maxDuration
    if (debug) console.log("[VAD] recording until silence…");
    while (elapsed < maxDuration) {
      pumpFromGlobalBuffer();
      const vol = getVolume();
      if (vol < silenceThreshold) {
        silenceMs += chunkSize;
        if (silenceMs >= maxSilence) {
          if (debug) console.log("[VAD] silence reached -> stop");
          break;
        }
      } else {
        silenceMs = 0;
      }
      elapsed += chunkSize;
      await delay(chunkSize);
    }

    // Склейка
    let total = 0;
    for (const f of collected) total += f.length;
    const merged = new Float32Array(total);
    let pos = 0;
    for (const f of collected) {
      merged.set(f, pos);
      pos += f.length;
    }

    if (debug) {
      const sec = (merged.length / audioCtx.sampleRate).toFixed(2);
      console.log(`[VAD] merged samples: ${merged.length} (~${sec}s)`);
    }
    return merged;
  }
