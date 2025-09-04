/** @jsxImportSource @emotion/react */
import { useState, useRef, useEffect } from 'react'
import { css } from '@emotion/react'
import MicVisualizer from './MicVisualizer'
import { fetchHelper } from '@utils/fetchHelper'
import { useAuthContext } from '@context/AuthContext'
import { Button } from '@ui/Button'
// 🔊 Компонент визуализации микрофона
function MicVisualizerPro({ stream, recording }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!recording || !stream) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64

        source.connect(analyser)
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            analyser.getByteFrequencyData(dataArray)

            const barWidth = (canvas.width / dataArray.length) * 1.5
            let x = 0
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = dataArray[i] / 2
                ctx.fillStyle = '#e53935'
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
                x += barWidth + 2
            }
            requestAnimationFrame(draw)
        }

        draw()

        return () => {
            audioCtx.close()
        }
    }, [stream, recording])

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            css={css`
                background: #212121;
                border-radius: 8px;
            `}
        />
    )
}

export default function VoiceRecorder({ command }) {
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [audioBlob, setAudioBlob] = useState(null)
    const [timer, setTimer] = useState(0)
    const [serverResponse, setServerResponse] = useState(null)
    const [stream, setStream] = useState(null)
    const [loading, setLoading] = useState(null)
    const timerRef = useRef(null)
    const audioURL = audioBlob ? URL.createObjectURL(audioBlob) : null
    const { token } = useAuthContext()

    useEffect(() => {
        if (recording) {
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
        } else {
            clearInterval(timerRef.current)
        }
        return () => clearInterval(timerRef.current)
    }, [recording])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const chunks = []

        recorder.ondataavailable = (e) => chunks.push(e.data)
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            setAudioBlob(blob)
            setRecording(false)
            setStream(null)
        }

        recorder.start()
        setMediaRecorder(recorder)
        setAudioBlob(null)
        setTimer(0)
        setStream(stream)
        setRecording(true)
    }

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop()
        }
    }

    const sendRecording = async () => {
        if (!audioBlob) return
        const formData = new FormData()
        formData.append('file', audioBlob, 'recording.webm')
        formData.append('command', command)

        const { data, error } = await fetchHelper(command ? '/python/train-solo' : '/api/predict', {
            method: 'POST',
            body: formData,
            token,
        })
        setServerResponse(data)
    }

    const handleRetrain = async () => {
        setLoading(true) // включаем индикатор

        // Запуск фонового обучения
        const { data, error } = await fetchHelper('/python/train-background', { token })
        if (error) {
            setServerResponse(`Ошибка запуска обучения: ${error.message}`)
            setLoading(false)
            return
        }

        setServerResponse(data.message)

        // Функция для опроса статуса
        const pollTrainingStatus = async () => {
            const { data: statusData, error: statusError } = await fetchHelper(
                '/python/train-status',
                {
                    token,
                }
            )
            if (statusError) {
                setServerResponse(`Ошибка проверки статуса: ${statusError.message}`)
                setLoading(false)
                return
            }

            setServerResponse(statusData.message)

            if (statusData.running) {
                setTimeout(pollTrainingStatus, 2000) // продолжаем опрос
            } else {
                setLoading(false) // завершение — выключаем индикатор
                console.log('Фоновое обучение завершено')
            }
        }

        pollTrainingStatus() // запускаем опрос
    }

    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                gap: 16px;
                align-items: center;
            `}
        >
            {/* Микрофон с анимацией */}
            <MicVisualizer stream={stream} recording={recording} />

            {/* 🔊 Визуализатор */}
            {recording && <MicVisualizerPro stream={stream} recording={recording} />}

            {/* Таймер */}
            {recording && (
                <div
                    css={css`
                        font-size: 18px;
                        font-weight: bold;
                        color: #e53935;
                    `}
                >
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </div>
            )}

            {/* Кнопки */}
            {!recording ? (
                <Button onClick={startRecording} label="🎙 Начать запись" />
            ) : (
                <Button onClick={stopRecording} label="⏹ Остановить" />
            )}

            {/* Прослушка и отправка */}
            {audioURL && !recording && (
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        align-items: center;
                    `}
                >
                    <audio controls src={audioURL}></audio>
                    <div
                        css={css`
                            display: flex;
                            gap: 10px;
                        `}
                    >
                        <Button onClick={sendRecording} label="⬆ Отправить" />
                        <Button size="sm" onClick={() => setAudioBlob(null)} label="❌ Отмена" />
                    </div>
                </div>
            )}
            <Button onClick={handleRetrain} label="Full Retrain" size="sm" loading={loading} />
            {/* Ответ сервера */}
            {serverResponse && (
                <pre
                    css={css`
                        margin-top: 10px;
                        font-size: 16px;
                        color: #2e7d32;
                        font-weight: 500;
                    `}
                >
                    {JSON.stringify(serverResponse, null, 2)}
                </pre>
            )}
        </div>
    )
}
