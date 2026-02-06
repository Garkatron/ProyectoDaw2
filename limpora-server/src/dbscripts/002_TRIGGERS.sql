
-- =========================
-- TRIGGER
-- =========================

CREATE TRIGGER update_user_points_on_appointment
AFTER UPDATE ON Appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        UPDATE Users
        SET total_points = total_points + 100,
            completed_appointments = completed_appointments + 1
        WHERE id = NEW.provider_id;
    END IF;

    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        UPDATE Users
        SET cancelled_appointments = cancelled_appointments + 1
        WHERE id = NEW.provider_id;
    END IF;
END;
