import { useAuthContext } from '@context/AuthContext'
import { useTTSContext } from '@context/TTSContext'
import { fetchHelper } from '@utils/fetchHelper'
import { recordUntilSilence } from '@utils/recordUntilSilence'
import {getJoke} from "@utils/apiRequests"
import React, { useEffect, useRef, useState } from 'react'

const WS_URL = 'ws://neuro.huskyduckstudio.by/ws'
const PREDICT_URL = '/api/predict'

export default function WakeAndRecord() {
    const [listening, setListening] = useState(false)
    const [wsConnected, setWsConnected] = useState(false)
    const [status, setStatus] = useState('idle')
    const [lastResult, setLastResult] = useState(null)
    const [trainCmd, setTrainCmd] = useState('')
    const [autoRecordSec, setAutoRecordSec] = useState(4.0)

    const { speakMultilang } = useTTSContext()
    const { token } = useAuthContext()

    const wsRef = useRef(null)
    const audioCtxRef = useRef(null)
    const micStreamRef = useRef(null)
    const processorRef = useRef(null)
    const bufferRef = useRef([])
    const stopSendingRef = useRef(false) // <--- контроль отправки чанков
    const lastSentRef = useRef(0)
    const sampleRateTarget = 16000
    const sendIntervalMs = 600

    function downsampleBuffer(buffer, srcRate, dstRate) {
        if (dstRate === srcRate) return buffer
        const sampleRateRatio = srcRate / dstRate
        const newLength = Math.round(buffer.length / sampleRateRatio)
        const result = new Float32Array(newLength)
        let offsetResult = 0
        let offsetBuffer = 0
        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
            let accum = 0,
                count = 0
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i]
                count++
            }
            result[offsetResult] = count ? accum / count : 0
            offsetResult++
            offsetBuffer = nextOffsetBuffer
        }
        return result
    }

    function encodeWAVFloat32(float32Array, sampleRate) {
        const downsampled = downsampleBuffer(float32Array, sampleRate, sampleRateTarget)
        const buffer = new ArrayBuffer(44 + downsampled.length * 2)
        const view = new DataView(buffer)
        const writeString = (view, offset, str) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
        }
        writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + downsampled.length * 2, true)
        writeString(view, 8, 'WAVE')
        writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, sampleRateTarget, true)
        view.setUint32(28, sampleRateTarget * 2, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        writeString(view, 36, 'data')
        view.setUint32(40, downsampled.length * 2, true)
        let offset = 44
        for (let i = 0; i < downsampled.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, downsampled[i]))
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
        }
        return new Blob([view], { type: 'audio/wav' })
    }

    function sendWakeChunk(float32Samples, srcSampleRate) {
        if (stopSendingRef.current) return // <--- отключение отправки
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        const wavBlob = encodeWAVFloat32(float32Samples, srcSampleRate)
        wavBlob.arrayBuffer().then((ab) => {
            try {
                wsRef.current.send(ab)
            } catch {}
        })
    }

    async function handleWakeDetected(info) {
        setStatus('wake_detected')
        console.log('wake_detected')
        setLastResult({ wakeInfo: info })

        // on wake
        stopSendingRef.current = true

        // TTS
        await speakMultilang('Слушаю')

        // СБРОСИМ все кадры, накопленные во время TTS,
        // чтобы не тащить wake/эхо в запись команды
        bufferRef.current = []

        // маленькая пауза, чтобы схлопнулась реверберация
        await new Promise((r) => setTimeout(r, 120))

        // запись до тишины
        setStatus('recording_command')
        const merged = await recordUntilSilence(
            audioCtxRef.current,
            micStreamRef.current,
            bufferRef,
            {
                silenceThreshold: 0.02,
                maxSilence: 1000,
                maxDuration: 10000,
                chunkSize: 50,
                startDelay: 0, // уже подождали выше
                minSpeechMs: 120,
                preRollMs: 150,
                debug: true, // включи для логов
            }
        )

        // если пусто — повторить или выйти
        if (!merged || merged.length === 0) {
            setStatus('no_speech')
            stopSendingRef.current = false
            return
        }

        // Конвертируем в WAV
        const wavBlob = encodeWAVFloat32(merged, audioCtxRef.current.sampleRate)

        if (false) {
            const url = URL.createObjectURL(wavBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'debug_command.wav'
            a.click()
        }

        const form = new FormData()
        form.append('file', wavBlob, 'command.wav')

        setStatus('sending_to_predict')
        try {
            const { data, error } = await fetchHelper(PREDICT_URL, {
                method: 'POST',
                body: form,
                token,
            })
            if (data.action === "joke") {
                const joke = await getJoke()
                speakMultilang(joke)
            }
            setLastResult(data || error)
            setStatus('idle')
        } catch (err) {
            setStatus('error')
        } finally {
            stopSendingRef.current = false // снова включаем отправку
        }
    }

    async function startListening() {
        if (listening) return
        setStatus('init')

        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`)
        ws.binaryType = 'arraybuffer'
        ws.onopen = () => {
            setWsConnected(true)
            setStatus('ws_open')
        }
        ws.onclose = () => {
            setWsConnected(false)
            setStatus('ws_closed')
        }
        ws.onerror = () => {
            setStatus('ws_error')
        }
        ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data)
                if (data.wake) handleWakeDetected(data)
            } catch {}
        }
        wsRef.current = ws

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1,
                sampleRate: 48000, // браузер всё равно может игнорировать, но попросить можно
            },
        })

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = audioCtx
        micStreamRef.current = stream
        const src = audioCtx.createMediaStreamSource(stream)

        const processor = audioCtx.createScriptProcessor(4096, 1, 1)
        processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0)
            const data = new Float32Array(input.length)
            data.set(input)
            bufferRef.current.push(data)

            const maxSamples = 4 * audioCtx.sampleRate
            let total = 0
            for (let i = bufferRef.current.length - 1; i >= 0; i--) {
                total += bufferRef.current[i].length
                if (total > maxSamples) {
                    bufferRef.current.splice(0, i)
                    break
                }
            }

            const now = Date.now()
            if (!stopSendingRef.current && now - lastSentRef.current > sendIntervalMs) {
                let got = 0,
                    tail = []
                const needed = Math.ceil((sendIntervalMs / 1000) * audioCtx.sampleRate)
                for (let i = bufferRef.current.length - 1; i >= 0 && got < needed; i--) {
                    tail.unshift(bufferRef.current[i])
                    got += bufferRef.current[i].length
                }
                const merged = new Float32Array(got)
                let p = 0
                for (const t of tail) {
                    merged.set(t, p)
                    p += t.length
                }
                sendWakeChunk(merged, audioCtx.sampleRate)
                lastSentRef.current = now
            }
        }

        src.connect(processor)
        processor.connect(audioCtx.destination)
        processorRef.current = processor
        setListening(true)
        setStatus('listening')
    }

    function stopListening() {
        if (!listening) return
        if (processorRef.current) {
            processorRef.current.disconnect()
            processorRef.current = null
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((t) => t.stop())
            micStreamRef.current = null
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close()
            audioCtxRef.current = null
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        bufferRef.current = []
        setListening(false)
        setWsConnected(false)
        setStatus('stopped')
    }

    useEffect(() => () => stopListening(), [])

    return (
        <div style={{ padding: 20 }}>
            <h2>Wake-word + Recorder (React)</h2>
            <div>
                <button onClick={startListening} disabled={listening}>
                    Start Listening
                </button>
                <button onClick={stopListening} disabled={!listening}>
                    Stop
                </button>
                <span style={{ marginLeft: 12 }}>
                    WS: {wsConnected ? 'connected' : 'disconnected'} — Status: {status}
                </span>
            </div>
            <div style={{ marginTop: 12 }}>
                <label>
                    Auto record sec:
                    <input
                        type="number"
                        step="0.5"
                        value={autoRecordSec}
                        onChange={(e) => setAutoRecordSec(e.target.value)}
                        style={{ width: 80, marginLeft: 8 }}
                    />
                </label>
            </div>
            <hr />
            <div>
                <h4>Последний результат</h4>
                <pre style={{ background: '#f6f6f6', padding: 12 }}>
                    {JSON.stringify(lastResult, null, 2)}
                </pre>
            </div>
        </div>
    )
}
