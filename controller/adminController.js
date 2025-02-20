const adminService = require('../services/adminService');

// Save Notification Schema
exports.saveNotificationSchema = async (req, res) => {
    try {
        const { adminId, fields, templateName, summary, status, priority, description, issueUrl } = req.body;
        await adminService.saveNotificationSchema(adminId, fields, templateName, summary, status, priority, description, issueUrl);
        res.status(201).json({ message: "Notification schema saved successfully" });
    } catch (error) {
        console.error("Error saving notification schema:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Notification Schema
exports.updateNotificationSchema = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { schemaId, fields, templateName, summary, status, priority, description, issueUrl } = req.body;

        await adminService.updateNotificationSchema(schemaId, fields, templateName, summary, status, priority, description, issueUrl);
        res.status(200).json({ message: "Notification schema updated successfully" });
    } catch (error) {
        console.error("Error updating notification schema:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch All Notification Schemas
exports.getNotificationSchemas = async (req, res) => {
    try {
        const schemas = await adminService.getNotificationSchemas();
        res.status(200).json(schemas);
    } catch (error) {
        console.error("Error fetching notification schemas:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch the Latest Notification Schema
exports.getLatestNotificationSchema = async (req, res) => {
    try {
        const latestSchema = await adminService.getLatestNotificationSchema();
        res.status(200).json(latestSchema);
    } catch (error) {
        console.error("Error fetching latest notification schema:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Assign Channel Creation Permission (No Changes Needed)
exports.assignChannelPermission = async (req, res) => {
    try {
        const { userId, canCreateChannel, adminId } = req.body;
        await adminService.assignChannelPermission(userId, canCreateChannel, adminId);
        res.status(200).json({ message: "Permission assigned successfully" });
    } catch (error) {
        console.error("Error assigning channel permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get User Permissions (No Changes Needed)
exports.getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const permissions = await adminService.getUserPermissions(userId);
        res.status(200).json(permissions);
    } catch (error) {
        console.error("Error fetching user permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
