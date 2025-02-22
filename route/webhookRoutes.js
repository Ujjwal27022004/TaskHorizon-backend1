const express = require("express");
const { processWebhookData } = require("../services/schemaService");

const router = express.Router();

router.post("/webhook", async (req, res) => {
    try {
        const payload = req.body;
        console.log("Received Webhook:", JSON.stringify(payload, null, 2));
        await processWebhookData(payload);
        res.status(200).json({ message: "Webhook received and processed" });
    } catch (error) {
        res.status(500).json({ message: "Error processing webhook" });
    }
});

module.exports = router;
