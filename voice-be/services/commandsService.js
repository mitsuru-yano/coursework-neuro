const db = require('../db.js')
const PY_URL = process.env.PYTHON_HTTP || 'http://localhost:8000'

// 🔄 Синхронизация с Python
async function syncCommandsToPython() {
    const { rows } = await db.query(`SELECT phrase FROM commands ORDER BY id`)
    const commands = rows.map((r) => r.phrase)

    const res = await fetch(`${PY_URL}/sync-commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands }),
    })

    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Python sync failed: ${txt}`)
    }

    return res.json()
}

// -------------------- ACTIONS --------------------

// Создать action
async function createAction(name, description = null) {
    const { rows } = await db.query(
        `INSERT INTO actions (name, description) VALUES ($1, $2) RETURNING *`,
        [name, description]
    )
    return rows[0]
}

// Получить список actions
async function listActions() {
    const { rows } = await db.query(`SELECT * FROM actions ORDER BY id`)
    return rows
}

// Удалить action
async function deleteAction(id) {
    await db.query(`DELETE FROM actions WHERE id = $1`, [id])
    return { status: 'ok' }
}

// -------------------- COMMANDS --------------------

// Создать command
async function createCommand(phrase, actionId) {
    const { rows } = await db.query(
        `INSERT INTO commands (phrase, action_id) VALUES ($1, $2) RETURNING *`,
        [phrase, actionId]
    )

    // сразу запускаем sync
    await syncCommandsToPython()

    return rows[0]
}

// Получить список commands
async function listCommands() {
    const { rows } = await db.query(
        `SELECT c.id, c.phrase, a.name AS action_name, a.id AS action_id
     FROM commands c
     LEFT JOIN actions a ON c.action_id = a.id
     ORDER BY c.id`
    )
    return rows
}

// Удалить command
async function deleteCommand(id) {
    await db.query(`DELETE FROM commands WHERE id = $1`, [id])

    // sync после удаления
    await syncCommandsToPython()

    return { status: 'ok' }
}

module.exports = {
    syncCommandsToPython,
    deleteAction,
    deleteCommand,
    listCommands,
    listActions,
    createAction,
    createCommand,
}
