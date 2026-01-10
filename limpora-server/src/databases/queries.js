// USER
export async function q_getUsers(conn) {
    return await conn.query("SELECT * FROM Users;");
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
