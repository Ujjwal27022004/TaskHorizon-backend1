const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    fieldName: { type: String, unique: true },
    isEnabled: { type: Boolean, default: false }, // Default false for admin config
});

module.exports = mongoose.model("NotificationSchema", notificationSchema);
