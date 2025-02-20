const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

router.post('/save-notification-schema', adminController.saveNotificationSchema);
router.put('/update-notification-schema', adminController.updateNotificationSchema);
router.get('/notification-schemas', adminController.getNotificationSchemas);
router.get('/latest-notification-schema', adminController.getLatestNotificationSchema); // New Route
router.post('/assign-channel-permission', adminController.assignChannelPermission);
router.get('/user-permissions/:userId', adminController.getUserPermissions);

module.exports = router;
