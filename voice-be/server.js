/**
 * Node Auth + Proxy Server
 * - Express for auth + REST proxy
 * - Socket.IO for FE <-> Node WS (clients)
 * - 'ws' WebSocket client for Node <-> Python WS (FastAPI)
 * - fallback: Node will forward WS messages to Python HTTP /ws-proxy
 *
 * Environment variables: PORT, PYTHON_HTTP, PYTHON_WS, JWT_SECRET, PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
 */

const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { createServer } = require('http')
const { Server } = require('socket.io')
const WebSocket = require('ws')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const { Client } = require('pg')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const proxyRoutes = require('./routes/proxy')
const commandsRoutes = require('./routes/commands')
const authMiddleware = require('./middleware/authMiddleware')
const initDB = require('./db/init')

const app = express()
app.use(express.json())

app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
                res.statusCode
            } - ${duration}ms`
        )
    })
    next()
})
// ---------- Unified CORS with multiple origins ----------
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:8000',
    'http://localhost:3000',
]

const corsOptions = {
    origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, Postman) и из списка allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS blocked: ${origin}`))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // Preflight
// ---------------------------------

// ---------- DB Auto Init ----------
initDB()
// ---------------------------------

// Routes
app.use('/auth', authRoutes)
app.use('/commands', commandsRoutes)
app.use('/api', proxyRoutes)

// Simple auto-proxy for other Python endpoints (optional)
app.use(
    '/python',
    authMiddleware,
    createProxyMiddleware({
        target: process.env.PYTHON_HTTP || 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: { '^/python': '' },
    })
)

// HTTP + Socket.IO server
const server = createServer(app)
const io = new Server(server, { cors: corsOptions })

// Python WS
let pySocket = null
let pyConnected = false
const pythonWSUrl = process.env.PYTHON_WS || 'ws://localhost:8001/ws'

// Подключаемся к Python WS
function connectToPythonWS() {
    pySocket = new WebSocket(pythonWSUrl)

    pySocket.on('open', () => {
        pyConnected = true
        console.log('✅ Connected to Python WS')
    })

    pySocket.on('close', () => {
        pyConnected = false
        console.log('❌ Python WS disconnected, reconnecting in 3s...')
        setTimeout(connectToPythonWS, 3000)
    })

    pySocket.on('error', (err) => {
        console.error('Python WS error:', err)
        pySocket.terminate()
    })
}

connectToPythonWS()

// WS прокси для FE
const wss = new WebSocket.Server({ server, path: '/ws' })

wss.on('connection', (clientWS, req) => {
    // Получаем токен из query параметров или заголовка Authorization
    const requestUrl = new URL(req.url, `http://${req.headers.host}`)
    const token = requestUrl.searchParams.get('token') || req.headers['authorization']

    if (!token) {
        clientWS.close(4001, 'Unauthorized')
        return
    }

    console.log('✅ FE WS connected, token:', token)

    // Функция пересылки сообщений от Python к FE
    const pyListener = (data) => {
        try {
            const obj = JSON.parse(data)
            clientWS.send(JSON.stringify(obj))
        } catch {}
    }

    if (pyConnected && pySocket && pySocket.readyState === WebSocket.OPEN) {
        pySocket.on('message', pyListener)
    }

    clientWS.on('message', (msg) => {
        if (!pyConnected || !pySocket || pySocket.readyState !== WebSocket.OPEN) {
            clientWS.send(JSON.stringify({ error: 'Python WS unavailable' }))
            return
        }
        // Форвардим данные в Python
        pySocket.send(msg)
    })

    clientWS.on('close', () => {
        console.log('❌ FE WS disconnected')
        if (pyConnected && pySocket && pySocket.readyState === WebSocket.OPEN) {
            pySocket.off('message', pyListener)
        }
    })

    clientWS.on('error', (err) => console.error('FE WS error:', err))
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log('Server listening on', port))
