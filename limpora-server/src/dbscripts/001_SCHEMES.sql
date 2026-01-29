DROP DATABASE IF EXISTS limpora;

CREATE DATABASE limpora CHARACTER SET utf8mb4;

USE limpora;

-- =========================
-- USUARIOS (PERFIL)
-- =========================
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(50),
    role ENUM('admin', 'provider', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INSIGNIAS
-- =========================
CREATE TABLE Badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE UserBadges (
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (badge_id) REFERENCES Badges(id)
);

-- =========================
-- SERVICIOS
-- =========================
CREATE TABLE Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    duration TIME NOT NULL
);

-- =========================
-- CITAS / APPOINTMENTS
-- =========================
CREATE TABLE Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_time DATETIME NOT NULL,
    status ENUM('Completed', 'Pending', 'In Process') NOT NULL DEFAULT 'Pending',
    price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2),
    app_commission DECIMAL(10, 2),
    payment_method ENUM('Bizum', 'Bank Transfer', 'Paypal') NOT NULL,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (provider_id) REFERENCES Users(id),
    FOREIGN KEY (service_id) REFERENCES Services(id)
);

-- =========================
-- RESEÑAS
-- =========================
-- =========================
CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    user_id INT NOT NULL,           -- Quien hace la review (cliente)
    provider_id INT NOT NULL,       -- A quién va dirigida la review
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (provider_id) REFERENCES Users(id)
);
