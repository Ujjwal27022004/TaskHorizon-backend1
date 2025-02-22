const NotificationSchema = require("../model/notificationModel");

exports.handleJiraWebhook = async (req, res) => {
    try {
        console.log("Received Jira Webhook:", JSON.stringify(req.body, null, 2));
        const payload = req.body; // Webhook payload
        const keys = Object.keys(payload); // Extract keys from payload
        console.log("Keys Mapped:", keys);

        let schema = await NotificationSchema.findOne();
        console.log("Schema:", schema);
        if (!schema) {
            schema = new NotificationSchema({ fields: {} });
        }

        let updated = false;
        keys.forEach(key => {
            if (!schema.fields.has(key)) {
                schema.fields.set(key, false); // New fields default to false
                updated = true;
            }
        });

        if (updated) {
            await schema.save();
        }

        res.status(200).json({ message: "Webhook processed", schema: schema.fields });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getNotificationSchema = async (req, res) => {
    try {
        const schema = await NotificationSchema.findOne();
        if (!schema) return res.status(404).json({ message: "No schema found" });

        res.status(200).json(schema.fields);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.updateNotificationSchema = async (req, res) => {
    try {
        const { field, value } = req.body;

        let schema = await NotificationSchema.findOne();
        if (!schema) return res.status(404).json({ message: "Schema not found" });

        if (!schema.fields.has(field)) {
            return res.status(400).json({ message: "Field not found in schema" });
        }

        schema.fields.set(field, value);
        await schema.save();

        res.status(200).json({ message: "Schema updated successfully", schema: schema.fields });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
