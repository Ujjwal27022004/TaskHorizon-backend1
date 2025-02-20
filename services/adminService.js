const adminModel = require('../model/adminModel');

exports.saveNotificationSchema = async (adminId, fields, templateName) => {
    return adminModel.saveNotificationSchema(adminId, fields, templateName);
};

exports.updateNotificationSchema = async (schemaId, fields, templateName) => {
    return adminModel.updateNotificationSchema(schemaId, fields, templateName);
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
