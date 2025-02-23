const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
require('./config/dotenv');
const db = require('./config/database');
const apiRoutes = require('./route/apiRoutes');
const todoRoutes = require('./route/todoRoutes');
const adminRoutes = require('./route/adminRoutes');
const axios = require('axios');
const adminModel = require('./model/adminModel');
const schemaRoutes = require("./route/schemaRoutes");
const webhookRoutes = require("./route/webhookRoutes"); 
const jiraWebhook = require("./route/jiraWebhook");
const { createTeamsChannel, addUsersToChannel } = require("./services/teamsService"); 

const teamConfigRoutes = require("./route/teamConfig");




mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));




const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);// admin routes for notification and channel control

app.use("/api", schemaRoutes);
app.use("/api", webhookRoutes);
app.use("/api", jiraWebhook); //new jira webhook for channel config
app.use("/api", teamConfigRoutes);


//Health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running smoothly',
        timestamp: new Date().toISOString()
    });
});


// Inject database into requests
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Unified API routes
app.use('/', apiRoutes);
app.use('/api/todos', todoRoutes);

const MS_TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL; 



app.post("/jira-webhook", async (req, res) => {
    try {
        console.log("Received Jira Webhook:", JSON.stringify(req.body, null, 2));

        // **Fetch Latest Admin Config from MySQL**
        const adminConfig = await adminModel.getLatestNotificationSchema();
        console.log("Fetched Admin Config:", adminConfig);

        // Extract relevant data from Jira Webhook payload
        const issueKey = req.body.issue?.key || "No issueKey";
        const summary = req.body.issue?.fields?.summary || "No summary";
        const status = req.body.issue?.fields?.status?.name || "No status";
        const priority = req.body.issue?.fields?.priority?.name || "No Priority";
        const description = req.body.issue?.fields?.description || "No Description";
        const issueUrl = `${process.env.JIRA_BASE_URL}/browse/${issueKey}`;

        // **Dynamically build the message based on admin-configured fields**
        let messageBody = `**Jira Issue Updated: [${issueKey}](${issueUrl})** 🚀\n`;
        if (adminConfig.issueKey) messageBody += `🔹 **Issue Key:** ${issueKey} \n`;
        if (adminConfig.summary) messageBody += `📌 **Summary:** ${summary} \n`;
        if (adminConfig.status) messageBody += `📊 **Status:** ${status} \n`;
        if (adminConfig.priority) messageBody += `⚡ **Priority:** ${priority} \n`;
        if (adminConfig.description) messageBody += `📝 **Description:** ${description} \n`;

        console.log("Final Message Body:", messageBody);

        // If no valid fields, return early
        if (!messageBody.trim()) {
            console.warn("No selected fields contain valid data. Webhook not sent.");
            return res.status(400).json({ message: "No valid fields selected for notification." });
        }

        // Prepare the payload for MS Teams Webhook
        const teamsMessage = { "text": messageBody };

        console.log("Final Teams Message:", JSON.stringify(teamsMessage, null, 2));

        // Send formatted message to Microsoft Teams
        const response = await axios.post(MS_TEAMS_WEBHOOK_URL, teamsMessage);
        console.log("Message sent to MS Teams:", response.data);

        res.status(200).json({ message: "Webhook processed and sent to Teams" });
    } catch (error) {
        console.error("Error processing webhook:", error.message);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



















