const pool = require('../db')

// SQL схема
const schema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fname VARCHAR(100),
    lname VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- имя действия, например "weather"
    description TEXT
);

CREATE TABLE IF NOT EXISTS commands (
    id SERIAL PRIMARY KEY,
    phrase VARCHAR(255) UNIQUE NOT NULL, -- фраза, которую вернёт Python
    action_id INT REFERENCES actions(id) ON DELETE CASCADE
);
`

async function initDB() {
    try {
        await pool.query(schema)

        // Добавляем actions
        const actions = [
            { name: 'greet', description: 'Поздороваться' },
            { name: 'weather', description: 'Узнать погоду' },
            { name: 'time', description: 'Узнать текущее время' },
            { name: 'bye', description: 'Попрощаться' },
            { name: 'wake', description: 'Активация ассистента' },
            { name: 'unknown', description: 'Неизвестная команда' }
        ]

        for (const action of actions) {
            await pool.query(
                `INSERT INTO actions (name, description)
                 VALUES ($1, $2)
                 ON CONFLICT (name) DO NOTHING`,
                [action.name, action.description]
            )
        }

        // Маппинг команд → action
        const commands = [
            { phrase: 'привет', action: 'greet' },
            { phrase: 'погода', action: 'weather' },
            { phrase: 'время', action: 'time' },
            { phrase: 'time', action: 'time' },
            { phrase: 'пока', action: 'bye' },
            { phrase: 'wake', action: 'wake' },
            { phrase: 'unknown', action: 'unknown' }
        ]

        for (const cmd of commands) {
            const res = await pool.query(
                `SELECT id FROM actions WHERE name = $1`,
                [cmd.action]
            )
            if (res.rows.length > 0) {
                const actionId = res.rows[0].id
                await pool.query(
                    `INSERT INTO commands (phrase, action_id)
                     VALUES ($1, $2)
                     ON CONFLICT (phrase) DO NOTHING`,
                    [cmd.phrase, actionId]
                )
            }
        }

        console.log('✅ Database initialized and seeded')
    } catch (err) {
        console.error('❌ Database initialization failed:', err)
        process.exit(1)
    }
}

module.exports = initDB
