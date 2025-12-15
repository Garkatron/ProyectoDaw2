DROP DATABASE IF EXISTS Limpora;

CREATE DATABASE Limpora CHARACTER SET utf8mb4;

USE Limpora;

CREATE TABLE UserTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(15) NOT NULL
);

CREATE TABLE Permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(25) NOT NULL
);

CREATE TABLE Badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(15) NOT NULL
);

CREATE TABLE Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM(
        'Internal Cleaning',
        'External Cleaning',
        'Pools'
    ) NOT NULL,
    duration TIME NOT NULL
);

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(25) NOT NULL,
    email VARCHAR(100) NOT NULL,
    user_type_id INT,
    FOREIGN KEY (user_type_id) REFERENCES UserTypes(id)
);

CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    rating ENUM('1','2','3','4','5'),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    verification_date DATE,
    email VARCHAR(100) NOT NULL,
    status ENUM('In Process', 'Completed'),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_time DATETIME NOT NULL,
    status ENUM('Completed', 'Pending', 'In Process'),
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2),
    app_commission DECIMAL(10,2),
    payment_method ENUM('Bizum', 'Bank Transfer', 'Paypal') NOT NULL,
    user_id INT,
    service_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (service_id) REFERENCES Services(id)
);

CREATE TABLE UserTypePermissions (
    user_type_id INT,
    permission_id INT,
    PRIMARY KEY (user_type_id, permission_id),
    FOREIGN KEY (user_type_id) REFERENCES UserTypes(id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(id)
);

CREATE TABLE UserBadges (
    user_id INT,
    badge_id INT,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (badge_id) REFERENCES Badges(id)
);
