USE Limpora;

INSERT INTO UserTypes (name) VALUES
('Admin'),
('Worker'),
('Client');

INSERT INTO Permissions (name) VALUES
('Create Service'),
('Edit Service'),
('Delete Service'),
('View Reports');

INSERT INTO Badges (name) VALUES
('Gold'),
('Silver'),
('Bronze');

INSERT INTO Services (name, duration) VALUES
('Internal Cleaning', '02:00:00'),
('External Cleaning', '03:00:00'),
('Pools', '01:30:00');

INSERT INTO Users (name, email, user_type_id) VALUES
('John Doe', 'john@limpora.com', 3),
('Jane Worker', 'jane@limpora.com', 2),
('Admin User', 'admin@limpora.com', 1);

INSERT INTO Reviews (content, rating, user_id) VALUES
('Excellent service', '5', 1),
('Good but could improve', '4', 1);

INSERT INTO Verifications (verification_date, email, status, user_id) VALUES
('2025-01-10', 'john@limpora.com', 'Completed', 1),
('2025-01-12', 'jane@limpora.com', 'In Process', 2);

INSERT INTO Appointments (
    date_time,
    status,
    price,
    total_amount,
    app_commission,
    payment_method,
    user_id,
    service_id
) VALUES
('2025-02-01 10:00:00', 'Completed', 100.00, 120.00, 20.00, 'Bizum', 1, 1),
('2025-02-03 15:30:00', 'Pending', 80.00, 96.00, 16.00, 'Paypal', 1, 3);

INSERT INTO UserTypePermissions (user_type_id, permission_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 2);

INSERT INTO UserBadges (user_id, badge_id) VALUES
(1, 1),
(2, 2);
