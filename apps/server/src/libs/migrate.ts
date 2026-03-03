import Database from "bun:sqlite";

export function migrate(db: Database) {
    // 1. Users (Clients & Providers)
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id                     INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid           TEXT NOT NULL UNIQUE,
            name                   TEXT,
            email                  TEXT UNIQUE,
            role                   TEXT DEFAULT 'client' CHECK (role IN ('admin', 'provider', 'client')),
            
            -- Location
            address                TEXT,
            postal_code            TEXT,
            latitude               REAL,
            longitude              REAL,
            city                   TEXT,
            
            -- Metadata
            total_points           INTEGER DEFAULT 0,
            completed_appointments INTEGER DEFAULT 0,
            cancelled_appointments INTEGER DEFAULT 0,
            member_since           TEXT DEFAULT (datetime('now')),
            created_at             TEXT DEFAULT (datetime('now'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ProviderProfiles (
            user_id           INTEGER PRIMARY KEY,
            bio               TEXT,
            has_vehicle       INTEGER DEFAULT 0,
            transport_type    TEXT CHECK (transport_type IN ('Car', 'Public Transport', 'Bike', 'Walk')),
            service_radius_km INTEGER DEFAULT 10,
            provides_supplies  INTEGER DEFAULT 0,
            avg_rating        REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Badges (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`CREATE TABLE IF NOT EXISTS Badges (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
    db.run(`
        CREATE TABLE IF NOT EXISTS UserBadges (
            user_id INTEGER NOT NULL,
            badge_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, badge_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (badge_id) REFERENCES Badges(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Services (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL UNIQUE,
            category TEXT
        )
    `);

      db.run(`
        CREATE TABLE IF NOT EXISTS UserServices (
            user_id      INTEGER NOT NULL,
            service_id   INTEGER NOT NULL,
            price_per_h  REAL NOT NULL,
            is_active    INTEGER NOT NULL DEFAULT 1,
            PRIMARY KEY (user_id, service_id),
            FOREIGN KEY (user_id)    REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Appointments (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id         INTEGER NOT NULL,
            provider_id       INTEGER NOT NULL,
            service_id        INTEGER NOT NULL,
            
            -- Time
            start_time        TEXT NOT NULL, -- ISO8601
            end_time          TEXT NOT NULL, -- ISO8601 (start_time + duración)
            travel_buffer_min INTEGER DEFAULT 30, -- Tiempo de margen para desplazarse
            
            -- Economy
            status            TEXT DEFAULT 'Pending' CHECK (status IN ('Completed', 'Pending', 'In Process', 'Cancelled')),
            total_price       REAL NOT NULL, -- Precio final que paga el cliente
            provider_net      REAL NOT NULL, -- Lo que recibe el autónomo
            app_commission    REAL NOT NULL, -- El "mordisco" de la app
            payment_method    TEXT CHECK (payment_method IN ('Bizum', 'Bank Transfer', 'Paypal')),
            
            created_at        TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (client_id)   REFERENCES Users(id),
            FOREIGN KEY (provider_id) REFERENCES Users(id),
            FOREIGN KEY (service_id)  REFERENCES Services(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Reviews (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            content     TEXT,
            rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            reviewer_id INTEGER NOT NULL,
            reviewed_id INTEGER NOT NULL,
            appointment_id INTEGER UNIQUE,
            created_at  TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (reviewer_id) REFERENCES Users(id),
            FOREIGN KEY (reviewed_id) REFERENCES Users(id),
            FOREIGN KEY (appointment_id) REFERENCES Appointments(id)
        )
    `);

 
    db.run(`
        CREATE TABLE IF NOT EXISTS EmailVerificationCodes (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            code       TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used       INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE (code),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);

    // Indexes
    db.run(
        `CREATE INDEX IF NOT EXISTS idx_email_verification_code    ON EmailVerificationCodes (code)`,
    );
    db.run(
        `CREATE INDEX IF NOT EXISTS idx_email_verification_user    ON EmailVerificationCodes (user_id)`,
    );
    db.run(
        `CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON EmailVerificationCodes (expires_at)`,
    );

    console.log("✅ Migrations done");

    db.run(`
    CREATE TRIGGER IF NOT EXISTS update_userservices_timestamp
    AFTER UPDATE ON UserServices
    FOR EACH ROW
    BEGIN
        UPDATE UserServices
        SET updated_at = datetime('now')
        WHERE user_id = OLD.user_id AND service_id = OLD.service_id;
    END
`);
}
