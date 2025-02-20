const db = require('../config/database');

// Save notification schema
exports.saveNotificationSchema = async (adminId, fields, templateName) => {
    const query = `
        INSERT INTO notification_schemas (admin_id, fields, template_name) 
        VALUES (?, ?, ?)`;
    return db.execute(query, [adminId, JSON.stringify(fields), templateName]);
};

// Update notification schema
exports.updateNotificationSchema = async (schemaId, fields, templateName) => {
    const query = `
        UPDATE notification_schemas 
        SET fields = ?, template_name = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?`;
    return db.execute(query, [JSON.stringify(fields), templateName, schemaId]);
};

// Fetch all notification schemas sorted by latest update
exports.getNotificationSchemas = async () => {
    const query = `
        SELECT * FROM notification_schemas 
        ORDER BY updated_at DESC`;
    const [rows] = await db.promise().execute(query);
    return rows;
};

// Fetch the latest updated schema
exports.getLatestNotificationSchema = async () => {
    const query = `
        SELECT * FROM notification_schemas 
        ORDER BY updated_at DESC 
        LIMIT 1`;
    const [rows] = await db.promise().execute(query);
    return rows.length ? rows[0] : null;
};
