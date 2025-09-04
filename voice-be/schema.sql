CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fname VARCHAR(100),
    lname VARCHAR(100)
);

CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE commands (
    id SERIAL PRIMARY KEY,
    phrase TEXT NOT NULL UNIQUE,
    action_id INT NOT NULL REFERENCES actions(id) ON DELETE CASCADE
);
