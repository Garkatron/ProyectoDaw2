// USER
export async function q_getUsers(conn) {
    const [rows] = await conn.query("SELECT * FROM Users;");
    return rows;
}

export async function q_getUserById(conn, id) {
    const [rows] = await conn.query(
        `SELECT id, firebase_uid, name, role
         FROM Users
         WHERE id = ?`,
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function q_getUserByName(conn, name) {
    const [rows] = await conn.query(
        `SELECT id, firebase_uid, name, role
         FROM Users
         WHERE name = ?`,
        [name]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function q_getUserByUid(conn, uid) {
    const [rows] = await conn.query(
        `SELECT id, firebase_uid, name, role
         FROM Users
         WHERE firebase_uid = ?`,
        [uid]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function q_addUser(conn, firebase_uid, name, role) {
    return await conn.query(
        "INSERT INTO Users (firebase_uid, name, role) VALUES (?, ?, ?)",
        [firebase_uid, name, role]
    );
}


export async function q_userExists(conn, firebase_uid) {
    const [rows] = await conn.query(
        "SELECT id, name FROM Users WHERE firebase_uid = ?",
        [firebase_uid]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function q_deleteUserById(conn, id) {
    const [result] = await conn.query(
        `DELETE FROM Users WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
}

export async function q_deleteUserByUid(conn, uid) {
    const [result] = await conn.query(
        `DELETE FROM Users WHERE firebase_uid = ?`,
        [uid]
    );
    return result.affectedRows > 0;
}

export async function q_deleteUserByName(conn, name) {
    const [result] = await conn.query(
        `DELETE FROM Users WHERE name = ?`,
        [name]
    );
    return result.affectedRows > 0;
}

export async function q_softDeleteUserById(conn, id) {
    const [result] = await conn.query(
        `UPDATE Users SET deleted_at = NOW() WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
}


// APPOINTMENTS

export async function q_getAppointmentsByUser(conn, userId) {
    const [rows] = await conn.query(
        `SELECT *
         FROM Appointments
         WHERE user_id = ?
         ORDER BY date_time DESC`,
        [userId]
    );
    return rows;
}

export async function q_addAppointmentToUser(
    conn,
    dateTime,
    price,
    appCommission,
    totalAmount,
    paymentMethod,
    userId,
    providerId,
    serviceId,
    status = 'Pending'
) {
    return await conn.query(
        `INSERT INTO Appointments 
        (date_time, status, price, total_amount, app_commission, payment_method, user_id, provider_id, service_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dateTime, status, price, totalAmount, appCommission, paymentMethod, userId, providerId, serviceId]
    );
}

// EARNIGS

export async function q_getEarnings(conn, providerId) {
    const [rows] = await conn.query(
        `SELECT provider_id,
                SUM(total_amount) AS total_received,
                SUM(app_commission) AS total_commission,
                SUM(total_amount - app_commission) AS provider_earning
         FROM Appointments
         WHERE provider_id = ?
           AND status = 'Completed'
         GROUP BY provider_id;`,
        [providerId]
    );
    return rows[0] || { provider_id: providerId, total_received: 0, total_commission: 0, provider_earning: 0 };
}

// SERVICES

export async function q_getServices(conn) {
    const [rows] = await conn.query("SELECT name FROM Services;");
    return rows || [];
}

export async function q_getServiceById(conn, serviceId) {
    const [rows] = await conn.query(
        "SELECT name FROM Services WHERE id = ?;",
        [serviceId]
    );
    return rows[0] || null;
}


export async function q_addService(conn, name) {
    return await conn.query("INSERT INTO Services (name) VALUES (?)", [name]);
}

export async function q_deleteService(conn, id) {
    return await conn.query(
        "DELETE FROM Services WHERE id = ?;",
        [id]
    );
}

// Reviews

export async function q_getReviews(conn) {
    const [rows] = await conn.query(
        `SELECT r.id, r.content, r.rating, r.created_at,
                u.name AS client_name,
                p.name AS provider_name
         FROM Reviews r
         JOIN Users u ON u.id = r.user_id
         JOIN Users p ON p.id = r.provider_id
         ORDER BY r.created_at DESC`
    );
    return rows;
}

export async function q_getReviewsByUser(conn, userId) {
    const [rows] = await conn.query(
        `SELECT r.id, r.content, r.rating, r.created_at,
                p.name AS provider_name
         FROM Reviews r
         JOIN Users p ON p.id = r.provider_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
    );
    return rows;
}

export async function q_getReviewsByProvider(conn, providerId) {
    const [rows] = await conn.query(
        `SELECT r.id, r.content, r.rating, r.created_at,
                u.name AS client_name
         FROM Reviews r
         JOIN Users u ON u.id = r.user_id
         WHERE r.provider_id = ?
         ORDER BY r.created_at DESC`,
        [providerId]
    );
    return rows;
}

export async function q_addReview(conn, content, rating, userId, providerId) {
    return await conn.query(
        `INSERT INTO Reviews (content, rating, user_id, provider_id)
         VALUES (?, ?, ?, ?)`,
        [content, rating, userId, providerId]
    );
}

export async function q_getAverageRating(conn, providerId) {
    const [rows] = await conn.query(
        `SELECT provider_id, 
                AVG(rating) AS average_rating, 
                COUNT(*) AS total_reviews
         FROM Reviews
         WHERE provider_id = ?
         GROUP BY provider_id`,
        [providerId]
    );
    return rows[0] || { provider_id: providerId, average_rating: 0, total_reviews: 0 };
}

export async function q_getUserServices(conn, userId) {
    const [rows] = await conn.query(
        `SELECT 
            us.user_id,
            us.service_id,
            us.price,
            us.is_active,
            us.created_at,
            us.updated_at,
            s.name AS service_name,
            s.duration AS service_duration
         FROM UserServices us
         INNER JOIN Services s ON us.service_id = s.id
         WHERE us.user_id = ?
         ORDER BY us.created_at DESC`,
        [userId]
    );
    return rows;
}


export async function q_getUserServiceById(conn, userId, serviceId) {
    const [rows] = await conn.query(
        `SELECT 
            us.user_id,
            us.service_id,
            us.price,
            us.is_active,
            us.created_at,
            us.updated_at,
            s.name AS service_name,
            s.duration AS service_duration
         FROM UserServices us
         INNER JOIN Services s ON us.service_id = s.id
         WHERE us.user_id = ? AND us.service_id = ?`,
        [userId, serviceId]
    );
    return rows[0] || null;
}


export async function q_addUserService(conn, userId, serviceId, price, isActive = true) {
    const [result] = await conn.query(
        `INSERT INTO UserServices (user_id, service_id, price, is_active)
         VALUES (?, ?, ?, ?)`,
        [userId, serviceId, price, isActive]
    );
    return result;
}


export async function q_updateUserService(conn, userId, serviceId, data) {
    const updates = [];
    const values = [];

    if (data.price !== undefined) {
        updates.push('price = ?');
        values.push(data.price);
    }

    if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(data.is_active);
    }

    if (updates.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(userId, serviceId);

    const [result] = await conn.query(
        `UPDATE UserServices 
         SET ${updates.join(', ')}
         WHERE user_id = ? AND service_id = ?`,
        values
    );

    return result;
}
 
export async function q_deleteUserService(conn, userId, serviceId) {
    const [result] = await conn.query(
        `DELETE FROM UserServices 
         WHERE user_id = ? AND service_id = ?`,
        [userId, serviceId]
    );
    return result;
}


export async function q_userServiceExists(conn, userId, serviceId) {
    const [rows] = await conn.query(
        `SELECT 1 FROM UserServices 
         WHERE user_id = ? AND service_id = ?`,
        [userId, serviceId]
    );
    return rows.length > 0;
}