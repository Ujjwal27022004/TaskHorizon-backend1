const NotificationSchema = require("../model/NotificationSchema");

async function getSchema(req, res) {
    try {
        const schema = await NotificationSchema.find({});
        res.json(schema);
    } catch (error) {
        res.status(500).json({ message: "Error fetching schema" });
    }
}

async function updateSchema(req, res) {
    try {
        const { fieldName, isEnabled } = req.body;

        await NotificationSchema.findOneAndUpdate(
            { fieldName },
            { isEnabled },
            { new: true }
        );

        res.json({ message: "Schema updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating schema" });
    }
}


async function bulkUpdateSchema(req, res) {
    try {
        const updates = req.body.updates; // Array of { id, isEnabled }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        // Process each update
        const updatePromises = updates.map(update =>
            NotificationSchema.findByIdAndUpdate(update.id, { isEnabled: update.isEnabled }, { new: true })
        );

        await Promise.all(updatePromises);

        res.json({ message: "Schema updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating schema" });
    }
}

module.exports = { getSchema, updateSchema, bulkUpdateSchema };


