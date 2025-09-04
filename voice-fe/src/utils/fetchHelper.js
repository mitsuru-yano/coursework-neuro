const BASE_URL = process.env.API_URL || 'http://localhost:3000'

export const fetchHelper = async (
    path,
    { method = 'GET', body = null, headers = {}, token = null, timeout = 10000 } = {}
) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const isFormData = body instanceof FormData

        const response = await fetch(BASE_URL + path, {
            method,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(!isFormData && { 'Content-Type': 'application/json' }), // только для JSON
                ...headers,
            },
            body: body ? (isFormData ? body : JSON.stringify(body)) : null,
            signal: controller.signal,
        })

        clearTimeout(id)

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`)
        }

        const data = await response.json().catch(() => null)
        return { data, error: null }
    } catch (err) {
        return {
            data: null,
            error: err.name === 'AbortError' ? new Error('Превышено время ожидания') : err,
        }
    }
}
