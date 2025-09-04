import React, { createContext, useContext, useState, useEffect } from 'react'

const _TTS_PROVIDER_KEY = 'tts_details'

const defaultSettings = {
    language: 'ru-RU',
    voice: null,
    rate: 1,
    pitch: 1,
}

const TTSContext = createContext(defaultSettings)

export const TTSContextProvider = ({ children }) => {
    const [voices, setVoices] = useState([])
    const [languages, setLanguages] = useState([])
    const [selectedEnVoice, setSelectedEnVoice] = useState(null)
    const [selectedRuVoice, setSelectedRuVoice] = useState(null)
    const [rate, setRate] = useState(1)
    const [pitch, setPitch] = useState(1)

    // Загружаем список голосов
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices()
            if (availableVoices.length === 0) return

            setVoices(availableVoices)
            setLanguages([...new Set(availableVoices.map((v) => v.lang))])

            // Загружаем сохранённые настройки
            const saved = JSON.parse(localStorage.getItem(_TTS_PROVIDER_KEY) || '{}')

            if (saved.voiceEn) {
                const en = availableVoices.find((v) => v.name === saved.voiceEn)
                if (en) setSelectedEnVoice(en)
            }
            if (saved.voiceRu) {
                const ru = availableVoices.find((v) => v.name === saved.voiceRu)
                if (ru) setSelectedRuVoice(ru)
            }
            if (saved.rate) setRate(saved.rate)
            if (saved.pitch) setPitch(saved.pitch)

            // Если голосов нет в localStorage – ставим дефолты
            if (!saved.voiceEn) {
                const enDefault = availableVoices.find((v) => v.lang.startsWith('en'))
                if (enDefault) setSelectedEnVoice(enDefault)
            }
            if (!saved.voiceRu) {
                const ruDefault = availableVoices.find((v) => v.lang.startsWith('ru'))
                if (ruDefault) setSelectedRuVoice(ruDefault)
            }
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    // Сохраняем в localStorage при изменении (но только после загрузки голосов)
    useEffect(() => {
        if (!voices.length) return

        localStorage.setItem(
            _TTS_PROVIDER_KEY,
            JSON.stringify({
                voiceEn: selectedEnVoice?.name,
                voiceRu: selectedRuVoice?.name,
                rate,
                pitch,
            })
        )
    }, [selectedEnVoice, selectedRuVoice, rate, pitch, voices])

    // Отфильтрованные голоса для выбранного языка
    const filteredEnVoices = voices.filter((v) => v.lang === 'en-US')
    const filteredRuVoices = voices.filter((v) => v.lang === 'ru-RU')

    // Определяем язык слова (с расширенной обработкой чисел)
    const detectLang = (word, nextWordLang = null, currentLang = null) => {
        // Числовые шаблоны
        const numberLike = /^([\d.,]+%?|№\d+|\d+(st|nd|rd|th)?|[\d]+(-й|-я)?)$/i

        if (numberLike.test(word)) {
            if (currentLang) return currentLang // наследуем язык текущей группы
            if (nextWordLang) return nextWordLang // если в начале — берём язык за ним
        }

        // Кириллица
        if (/[а-яА-ЯёЁ]/.test(word)) return 'ru'
        // Латиница
        if (/[a-zA-Z]/.test(word)) return 'en'
    }

    // Группировка слов по языкам
    const groupByLang = (words) => {
        const groups = []
        let currentGroup = []
        let currentLang = null

        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const nextWord = words[i + 1]
            const nextWordLang = nextWord ? detectLang(nextWord) : null

            const lang = detectLang(word, nextWordLang, currentLang)

            if (!currentLang) {
                currentLang = lang
                currentGroup.push(word)
            } else if (lang === currentLang) {
                currentGroup.push(word)
            } else {
                groups.push({ lang: currentLang, text: currentGroup.join(' ') })
                currentGroup = [word]
                currentLang = lang
            }
        }

        if (currentGroup.length > 0) {
            groups.push({ lang: currentLang, text: currentGroup.join(' ') })
        }

        return groups
    }

    // Мультиязычное воспроизведение
    const speakMultilang = (text) => {
        if (!text) return
        const words = text.split(/\s+/)
        const groups = groupByLang(words)

        const speakGroup = (index) => {
            if (index >= groups.length) return
            const { lang, text } = groups[index]
            const utterance = new SpeechSynthesisUtterance(text)

            utterance.voice =
                lang === 'en'
                    ? selectedEnVoice || voices.find((v) => v.lang.startsWith('en'))
                    : selectedRuVoice || voices.find((v) => v.lang.startsWith('ru'))

            utterance.rate = rate
            utterance.pitch = pitch

            utterance.onend = () => speakGroup(index + 1)
            speechSynthesis.speak(utterance)
        }

        speakGroup(0)
    }

    const cancel = () => {
        speechSynthesis.cancel()
    }

    const value = {
        languages, // доступные языки
        filteredEnVoices, // голоса для en языка
        filteredRuVoices, // голоса для ru языка
        selectedEnVoice,
        selectedRuVoice,
        setSelectedEnVoice,
        setSelectedRuVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        speakMultilang, // мультиязычное воспроизведение
        cancel,
    }

    return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>
}

export const useTTSContext = () => {
    return useContext(TTSContext)
}
