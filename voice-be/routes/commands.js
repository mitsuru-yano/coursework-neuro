const express = require('express')
const {
    createAction,
    listActions,
    deleteAction,
    createCommand,
    listCommands,
    deleteCommand,
    syncCommandsToPython,
} = require('../services/commandsService.js')
const authMiddleware = require('../middleware/authMiddleware.js')
const pool = require('../db.js')
const router = express.Router()

// ---------- Actions ----------
router.post('/actions', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const action = await createAction(name, description)
        res.json(action)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/actions', authMiddleware, async (_, res) => {
    const list = await listActions()
    res.json(list)
})

router.delete('/actions/:id', authMiddleware, async (req, res) => {
    await deleteAction(req.params.id)
    res.json({ status: 'ok' })
})

// ---------- Commands ----------
router.post('/commands', authMiddleware, async (req, res) => {
    try {
        const { phrase, actionId } = req.body
        const command = await createCommand(phrase, actionId)
        res.json(command)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PATCH /commands/:id
router.patch('/commands/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    const { actionId } = req.body

    try {
        const result = await pool.query(
            'UPDATE commands SET action_id = $1 WHERE id = $2 RETURNING *',
            [actionId, id]
        )
        if (!result.rows.length) return res.status(404).json({ error: 'Команда не найдена' })

        // Optional: синхронизация с Python
        await syncCommandsToPython(result.rows[0].phrase)

        res.json({ status: 'ok', command: result.rows[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка обновления команды' })
    }
})

router.get('/commands', authMiddleware, async (_, res) => {
    const list = await listCommands()
    res.json(list)
})

router.delete('/commands/:id', authMiddleware, async (req, res) => {
    await deleteCommand(req.params.id)
    res.json({ status: 'ok' })
})

module.exports = router
