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
    email_verified BOOLEAN DEFAULT FALSE,
    role ENUM('admin', 'provider', 'client') DEFAULT 'client', 
    total_points INT DEFAULT 0, 
    completed_appointments INT DEFAULT 0, 
    cancelled_appointments INT DEFAULT 0, 
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
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
    status ENUM('Completed', 'Pending', 'In Process', 'Cancelled') NOT NULL DEFAULT 'Pending',
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2),
    app_commission DECIMAL(10,2),
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
CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (reviewer_id, reviewed_id),

    FOREIGN KEY (reviewer_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS UserServices (
    user_id     INT NOT NULL,
    service_id  INT NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, service_id),
    CONSTRAINT fk_userservices_user    FOREIGN KEY (user_id)    REFERENCES Users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_userservices_service FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- =========================
-- EMAIL VERIFICATION
-- =========================
CREATE TABLE EmailVerificationCodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(60) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_code 
ON EmailVerificationCodes (code); 
 
CREATE INDEX idx_email_verification_user 
ON EmailVerificationCodes (user_id); 

CREATE INDEX idx_email_verification_expires
ON EmailVerificationCodes (expires_at);
