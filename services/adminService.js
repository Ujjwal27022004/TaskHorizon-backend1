const adminModel = require('../model/adminModel');

exports.saveNotificationSchema = async (adminId, fields, templateName, summary, status, priority, description, issueUrl) => {
    return adminModel.saveNotificationSchema(adminId, fields, templateName, summary, status, priority, description, issueUrl);
};

exports.updateNotificationSchema = async (schemaId, fields, templateName, summary, status, priority, description, issueUrl) => {
    return adminModel.updateNotificationSchema(schemaId, fields, templateName, summary, status, priority, description, issueUrl);
};

exports.getNotificationSchemas = async () => {
    return adminModel.getNotificationSchemas();
};

exports.getLatestNotificationSchema = async () => {
    return adminModel.getLatestNotificationSchema();
};

exports.assignChannelPermission = async (userId, canCreateChannel, adminId) => {
    return adminModel.assignChannelPermission(userId, canCreateChannel, adminId);
};

exports.getUserPermissions = async (userId) => {
    return adminModel.getUserPermissions(userId);
};
