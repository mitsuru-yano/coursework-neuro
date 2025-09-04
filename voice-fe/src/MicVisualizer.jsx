import React, { useEffect, useRef } from 'react'
import styled from '@emotion/styled'

export default function MicVisualizer({ stream, recording }) {
    const circleFillRef = useRef(null)
    const circleBorderRef = useRef(null)
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)
    const rafRef = useRef(null)
    const rmsPrevRef = useRef(0)

    useEffect(() => {
        if (!recording || !stream) {
            stop()
            return
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        const audioCtx = new AudioCtx()
        audioContextRef.current = audioCtx

        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        analyserRef.current = analyser

        const timeData = new Uint8Array(analyser.frequencyBinCount)

        const animate = () => {
            if (!analyserRef.current) return
            analyserRef.current.getByteTimeDomainData(timeData)

            let sumSq = 0
            for (let i = 0; i < timeData.length; i++) {
                const v = (timeData[i] - 128) / 128
                sumSq += v * v
            }
            const rms = Math.sqrt(sumSq / timeData.length)
            const smooth = rms * 0.6 + rmsPrevRef.current * 0.4
            rmsPrevRef.current = smooth

            const scaleFill = 1 + smooth * 1.0
            const scaleBorder = 1 + smooth * 0.5
            const opFill = 0.25 + smooth * 0.9
            const opBorder = 0.12 + smooth * 0.7

            if (circleFillRef.current) {
                circleFillRef.current.style.transform = `translate(-50%, -50%) scale(${scaleFill})`
                circleFillRef.current.style.opacity = `${Math.min(opFill, 1.2)}`
            }
            if (circleBorderRef.current) {
                circleBorderRef.current.style.transform = `translate(-50%, -50%) scale(${scaleBorder})`
                circleBorderRef.current.style.opacity = `${Math.min(opBorder, 1)}`
            }

            rafRef.current = requestAnimationFrame(animate)
        }

        rafRef.current = requestAnimationFrame(animate)

        return () => stop()
    }, [recording, stream])

    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        if (analyserRef.current) analyserRef.current.disconnect()
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
        rafRef.current = null
        analyserRef.current = null
        audioContextRef.current = null
    }

    return (
        <MicContainer>
            <MicCircle>
                <MicFill ref={circleFillRef} />
                <MicBorder ref={circleBorderRef} />
            </MicCircle>

            <MicIcon>
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="#222" />
                    <path
                        d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-3.08A7 7 0 0 0 19 11z"
                        fill="#222"
                    />
                </svg>
            </MicIcon>
        </MicContainer>
    )
}

/* ==== Emotion styles ==== */

const MicContainer = styled.div`
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 6px 0;
`

const MicCircle = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 180px;
    height: 180px;
    transform: translate(-50%, -50%);
    pointer-events: none;
`

const MicFill = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70px;
    height: 70px;
    background: #dd3333;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
    z-index: 10;
`

const MicBorder = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid #dd3333;
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
    z-index: 9;
`

const MicIcon = styled.div`
    position: relative;
    z-index: 20;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
`
