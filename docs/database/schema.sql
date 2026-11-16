
-- Нормализованная схема базы данных до 3NF
-- СУБД: SQLite

PRAGMA foreign_keys = ON;

-- Таблица жанров
CREATE TABLE Genre (
    genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Таблица генераций
CREATE TABLE Generation (
    generation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre_id INTEGER,
    content_type TEXT NOT NULL
        CHECK (content_type IN ('plot', 'character_name', 'location_name')),
    seed TEXT,
    absurdity_level INTEGER
        CHECK (absurdity_level BETWEEN 0 AND 100),
    race TEXT,
    character_gender TEXT,
    setting TEXT,
    protagonist TEXT,
    conflict TEXT,
    location_style TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (genre_id)
        REFERENCES Genre(genre_id)
        ON DELETE SET NULL
);

-- Таблица результатов генерации
CREATE TABLE GeneratedIdea (
    idea_id INTEGER PRIMARY KEY AUTOINCREMENT,
    generation_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (generation_id)
        REFERENCES Generation(generation_id)
        ON DELETE CASCADE
);

-- Таблица избранного
CREATE TABLE Favorite (
    favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL UNIQUE,
    saved_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (idea_id)
        REFERENCES GeneratedIdea(idea_id)
        ON DELETE CASCADE
);

-- Таблица последних настроек приложения
CREATE TABLE AppSettings (
    settings_id INTEGER PRIMARY KEY CHECK (settings_id = 1),
    genre_id INTEGER,
    content_type TEXT,
    last_seed TEXT,
    absurdity_level INTEGER
        CHECK (absurdity_level BETWEEN 0 AND 100),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (genre_id)
        REFERENCES Genre(genre_id)
        ON DELETE SET NULL
);

-- Индексы для ускорения поиска
CREATE INDEX idx_generation_created_at
    ON Generation(created_at);

CREATE INDEX idx_generation_genre_id
    ON Generation(genre_id);

CREATE INDEX idx_idea_generation_id
    ON GeneratedIdea(generation_id);

CREATE INDEX idx_favorite_saved_at
    ON Favorite(saved_at);
