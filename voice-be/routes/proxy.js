const express = require('express')
const pool = require('../db.js')
const authMiddleware = require('../middleware/authMiddleware.js')
const router = express.Router()

const PY_URL = process.env.PYTHON_HTTP || 'http://localhost:8000'

router.post('/predict', authMiddleware, async (req, res) => {
    try {
        const pyRes = await fetch(`${PY_URL}/predict`, {
            method: 'POST',
            headers: {
                authorization: req.headers.authorization || '',
                'content-type': req.headers['content-type'],
            },
            body: req, // поток запроса с FE
            duplex: 'half', // обязательно для потоков в Node 20+
        })

        if (!pyRes.ok) {
            const text = await pyRes.text()
            return res.status(pyRes.status).send(text)
        }

        const pyData = await pyRes.json()
        const phrase = pyData.command

        if (phrase === 'unknown' || phrase === 'wake') {
            return res.json({ status: 'ok', phrase, action: phrase })
        }

        const { rows } = await pool.query(
            `
      SELECT a.name AS action, c.phrase
      FROM commands c
      JOIN actions a ON c.action_id = a.id
      WHERE c.phrase = $1
      `,
            [phrase]
        )

        if (rows.length === 0) {
            return res.json({ status: 'unknown', phrase, action: 'unknown' })
        }

        return res.json({ status: 'ok', phrase, action: rows[0].action })
    } catch (err) {
        console.error('❌ predict proxy failed:', err)
        res.status(500).json({ error: 'Predict proxy failed' })
    }
})

module.exports = router
