// apiRequests.js

// ---------------------- 1️⃣ Погода (OpenWeatherMap) ----------------------
export const getWeather = async (city) => {
    const apiKey = 'YOUR_API_KEY' // вставь свой ключ OpenWeatherMap
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        )
        const data = await res.json()
        return `Погода в ${city}: ${data.weather[0].description}, температура ${data.main.temp}°C`
    } catch (err) {
        return `Ошибка получения погоды: ${err.message}`
    }
}

// ---------------------- 2️⃣ Случайная шутка (JokeAPI) ----------------------
export const getJoke = async () => {
    try {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any')
        const data = await res.json()
        if (data.type === 'single') return data.joke
        return `${data.setup} ... ${data.delivery}`
    } catch (err) {
        return `Ошибка получения шутки: ${err.message}`
    }
}

// ---------------------- 3️⃣ Курс валют (ExchangeRate API) ----------------------
export const getExchangeRates = async (base = 'USD', symbols = ['EUR', 'GBP']) => {
    try {
        const res = await fetch(
            `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols.join(',')}`
        )
        const data = await res.json()
        const rates = symbols.map((sym) => `${sym}: ${data.rates[sym]}`).join(', ')
        return `Курс валют для ${base}: ${rates}`
    } catch (err) {
        return `Ошибка получения курса валют: ${err.message}`
    }
}

// ---------------------- 4️⃣ Случайный факт (Numbers API) ----------------------
export const getNumberFact = async () => {
    try {
        const number = Math.floor(Math.random() * 100)
        const res = await fetch(`http://numbersapi.com/${number}`)
        const text = await res.text()
        return text
    } catch (err) {
        return `Ошибка получения факта: ${err.message}`
    }
}

// ---------------------- 5️⃣ Новости (NewsAPI) ----------------------
export const getNews = async (category = 'technology') => {
    const apiKey = 'YOUR_API_KEY' // вставь свой ключ NewsAPI
    try {
        const res = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`
        )
        const data = await res.json()
        return data.articles.length > 0 ? data.articles[0].title : 'Новости не найдены'
    } catch (err) {
        return `Ошибка получения новостей: ${err.message}`
    }
}

// ---------------------- 6️⃣ Фото дня от NASA ----------------------
export const getNasaPhoto = async () => {
    try {
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
        const data = await res.json()
        return `${data.title}: ${data.url}`
    } catch (err) {
        return `Ошибка получения фото NASA: ${err.message}`
    }
}

// ---------------------- 7️⃣ Перевод (LibreTranslate) ----------------------
export const translateText = async (text, target = 'ru') => {
    try {
        const res = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            body: JSON.stringify({ q: text, source: 'en', target }),
            headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        return data.translatedText
    } catch (err) {
        return `Ошибка перевода: ${err.message}`
    }
}

// ---------------------- 8️⃣ Погода на Марсе (Open-Meteo Mars) ----------------------
export const getMarsWeather = async () => {
    try {
        const res = await fetch(
            'https://api.open-meteo.com/v1/mars?latitude=4.5&longitude=137.4&daily=temperature_2m_max'
        )
        const data = await res.json()
        return `Максимальная температура на Марсе сегодня: ${data.daily.temperature_2m_max[0]}°C`
    } catch (err) {
        return `Ошибка получения погоды на Марсе: ${err.message}`
    }
}

// ---------------------- 9️⃣ Случайное изображение котика (The Cat API) ----------------------
export const getCatImage = async () => {
    try {
        const res = await fetch('https://api.thecatapi.com/v1/images/search')
        const data = await res.json()
        return data[0].url
    } catch (err) {
        return `Ошибка получения изображения котика: ${err.message}`
    }
}

// ---------------------- 🔟 Случайный совет (Advice Slip API) ----------------------
export const getAdvice = async () => {
    try {
        const res = await fetch('https://api.adviceslip.com/advice')
        const data = await res.json()
        return data.slip.advice
    } catch (err) {
        return `Ошибка получения совета: ${err.message}`
    }
}
