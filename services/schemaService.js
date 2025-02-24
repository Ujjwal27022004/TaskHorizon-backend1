const NotificationSchema = require("../model/NotificationSchema");

async function processWebhookData(webhookPayload) {
    try {
        const fields = extractFields(webhookPayload);
        
        for (const field of fields) {
            const existingField = await NotificationSchema.findOne({ fieldName: field });

            if (!existingField) {
                await NotificationSchema.create({ fieldName: field, isEnabled: false });
            }
        }

        console.log("Schema updated with missing fields Saransh.");
    } catch (error) {
        console.error("Error processing webhook data:", error);
    }
}

// Extracts all fields & subfields recursively
function extractFields(obj, prefix = "") {
    let fields = [];

    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
            fields = fields.concat(extractFields(obj[key], newKey));
        } else {
            fields.push(newKey);
        }
    }

    return fields;
}

module.exports = { processWebhookData };
