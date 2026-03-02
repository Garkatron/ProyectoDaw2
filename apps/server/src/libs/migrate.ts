import Database from "bun:sqlite";

export function migrate(db: Database) {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id                     INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid           TEXT NOT NULL UNIQUE,
            name                   TEXT,
            email                  TEXT UNIQUE,
            email_verified         INTEGER DEFAULT 0,
            role                   TEXT DEFAULT 'client' CHECK (role IN ('admin', 'provider', 'client')),
            total_points           INTEGER DEFAULT 0,
            completed_appointments INTEGER DEFAULT 0,
            cancelled_appointments INTEGER DEFAULT 0,
            member_since           TEXT DEFAULT (datetime('now')),
            created_at             TEXT DEFAULT (datetime('now'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Badges (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS UserBadges (
            user_id  INTEGER NOT NULL,
            badge_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, badge_id),
            FOREIGN KEY (user_id)  REFERENCES Users(id)  ON DELETE CASCADE,
            FOREIGN KEY (badge_id) REFERENCES Badges(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Services (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL UNIQUE,
            duration INTEGER NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Appointments (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            date_time      TEXT NOT NULL,
            status         TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Completed', 'Pending', 'In Process', 'Cancelled')),
            price          REAL NOT NULL,
            total_amount   REAL,
            app_commission REAL,
            payment_method TEXT NOT NULL CHECK (payment_method IN ('Bizum', 'Bank Transfer', 'Paypal')),
            user_id        INTEGER NOT NULL,
            provider_id    INTEGER NOT NULL,
            service_id     INTEGER NOT NULL,
            created_at     TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id)     REFERENCES Users(id),
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
            created_at  TEXT DEFAULT (datetime('now')),
            UNIQUE (reviewer_id, reviewed_id),
            FOREIGN KEY (reviewer_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewed_id) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS UserServices (
            user_id    INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            price      REAL NOT NULL,
            is_active  INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (user_id, service_id),
            FOREIGN KEY (user_id)    REFERENCES Users(id)    ON DELETE CASCADE,
            FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
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
        `CREATE INDEX IF NOT EXISTS idx_email_verification_code    ON EmailVerificationCodes (code)`
    );
    db.run(
        `CREATE INDEX IF NOT EXISTS idx_email_verification_user    ON EmailVerificationCodes (user_id)`
    );
    db.run(
        `CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON EmailVerificationCodes (expires_at)`
    );

    console.log('✅ Migrations done');

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
