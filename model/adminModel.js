const db = require('../config/database');



exports.saveNotificationSchema = async (adminId, fields, templateName) => {
    if (!adminId || !fields || !templateName) {
        throw new Error("Missing required parameters: adminId, fields, or templateName");
    }

    // Convert fields object to JSON string
    const fieldsJson = JSON.stringify(fields);

    const query = "INSERT INTO notification_schemas (admin_id, fields, template_name) VALUES (?, ?, ?)";
    return db.execute(query, [adminId, fieldsJson, templateName]);
};


exports.updateNotificationSchema = async (schemaId, fields, templateName, summary, status, priority, description, issueUrl) => {
    if (!schemaId || !fields || !templateName) {
        throw new Error("Missing required parameters: schemaId, fields, or templateName");
    }

    // Convert fields object to JSON string
    const fieldsJson = JSON.stringify(fields);

    const query = `
        UPDATE notification_schemas 
        SET fields = ?, template_name = ?, summary = ?, status = ?, priority = ?, description = ?, issueUrl = ?, updated_at = NOW()
        WHERE id = ?
    `;

    return db.execute(query, [fieldsJson, templateName, summary, status, priority, description, issueUrl, schemaId]);
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
