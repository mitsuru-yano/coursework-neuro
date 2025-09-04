const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const router = express.Router()

require('dotenv').config()

// Регистрация
router.post('/register', async (req, res) => {
    const { email, password, fname, lname } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    try {
        const hashed = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO users (email, password, fname, lname) VALUES ($1, $2, $3, $4) RETURNING id, email, fname, lname',
            [email, hashed, fname || null, lname || null]
        )
        res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: 'User already exists or invalid data' })
    }
})

// Логин
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    try {
        const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        const user = result.rows[0]
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, fname: user.fname, lname: user.lname },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )
        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
