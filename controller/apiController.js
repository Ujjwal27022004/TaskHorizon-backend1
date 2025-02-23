const axios = require('axios');
const { getAccessToken, fetchTeams, fetchChannels, saveChannels, createNewTeam, createNewChannel, removeChannel, sendChannelMessage, createJiraIssueService, fetchJiraIssues } = require('../services/apiService');

const globaltoken = process.env.GLOBALTOKEN;



async function getTeamsList(req, res) {
    try {
        const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImFlV0hoMUVfRV9GNU5DR0F5cEFPRGl1WnMyQmdFZmExMklYZG42QkZPVHciLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEvIiwiaWF0IjoxNzQwMjkzMDM2LCJuYmYiOjE3NDAyOTMwMzYsImV4cCI6MTc0MDM3OTczNiwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVZRQXEvOFpBQUFBdG9XancrcUVqZ3dmLzFzdWp0dUs3TGpxdi9aalJHRlYva0dPMW1ONHFDM2h2blFYNFpNYUpCSC95aU8rWjZmeFZhYlVkQXpCWUVRbEtOS3ZLNkMwTllSSkYwUVlIcWtYTE11OFlWZ0tPR1k9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHcmFwaCBFeHBsb3JlciIsImFwcGlkIjoiZGU4YmM4YjUtZDlmOS00OGIxLWE4YWQtYjc0OGRhNzI1MDY0IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJUZWFtIiwiZ2l2ZW5fbmFtZSI6IkRldmVsb3BtZW50IiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTAzLjMxLjQxLjE5NCIsIm5hbWUiOiJEZXZlbG9wbWVudCBUZWFtIiwib2lkIjoiMTM2MGJjNzktYTBlMi00YjcwLTg5YWYtZGMxYjAzNWEzMDM0IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA0M0Q2RTlFRDgiLCJyaCI6IjEuQVQwQXcyRnNZTDZTMVVtTXh5VWhVUzdiWVFNQUFBQUFBQUFBd0FBQUFBQUFBQUE5QVBZOUFBLiIsInNjcCI6IkNoYW5uZWwuUmVhZEJhc2ljLkFsbCBDaGFubmVsTWVzc2FnZS5TZW5kIENoYXQuQ3JlYXRlIENoYXQuUmVhZFdyaXRlIEZpbGVzLlJlYWQuQWxsIE5vdGlmaWNhdGlvbnMuUmVhZFdyaXRlLkNyZWF0ZWRCeUFwcCBvcGVuaWQgcHJvZmlsZSBUZWFtLkNyZWF0ZSBUZWFtLlJlYWRCYXNpYy5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZEJhc2ljLkFsbCBVc2VyQWN0aXZpdHkuUmVhZFdyaXRlLkNyZWF0ZWRCeUFwcCBlbWFpbCIsInNpZCI6IjAwMWYyOGE5LTMxODctNjAzNi02YTU2LTMyMzQyNDExZTc4NyIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IlE0ZUc5TTBYUlJNMzR1UzhPTjNfdjBKODNtaEF0RFhXYkFpanFtRHZ5Z2siLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI2MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEiLCJ1bmlxdWVfbmFtZSI6ImRldnRlYW1AY29ubmVjdGljdXMuaW4iLCJ1cG4iOiJkZXZ0ZWFtQGNvbm5lY3RpY3VzLmluIiwidXRpIjoiQnhWWVdEcV9yVWFlNXI3SU1mTjNBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX2Z0ZCI6InRrNE1oV2R4aklyX1JVbGNLeWFIQ2FLeE11VEwtUTNualpSS1ZuVzc3R1kiLCJ4bXNfaWRyZWwiOiIxIDI0IiwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoid051UXdST2ZROThuRHBQcHlBVUtMSXVVaHhVUjl5el9mSzF2ejhENHlGcyJ9LCJ4bXNfdGNkdCI6MTU1ODc2MTUyOH0.TnQtwXRApoMQtO0jh86kA0XchhaD13wAfiAOQgEue9VZKa_t395V2WxMcXTy6HBc9PDzIYx5yTNTW78t_pQ93nwuJZTUUQx6QsNIRHuO2UxSyUvqobC0hx64u37ecxbIqzTOMo2cnWNDDUQLnSkhSyZFDA1D5ws73KVxn9fuMu6-Xiyz2R3tIFmwXvnb8t5Q9A06GFIidG3xW17aLHx4jAYZeRfrqzT0jVxA_TjBASfTs_b0SdGrJwTZTIt6MK6GTQyMfrYEF0VefY2wZbCFh3S0f7lg4YNCCENc5QyT1U_cal1hozJKWNSPrnmlOLKW7CzKHFwSlDlRLncuBeYqUw";
        const teams = await fetchTeams(accessToken);
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Teams', error: error.message });
    }
}

async function createTeam(req, res) {
    try {
        const { name } = req.body;
        const accessToken = await getAccessToken();
        const team = await createNewTeam(name, accessToken);
        res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
        res.status(500).json({ message: 'Error creating team' });
    }
}

async function getChannels(req, res) {
    try {
        const { teamId } = req.params;
         const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImFlV0hoMUVfRV9GNU5DR0F5cEFPRGl1WnMyQmdFZmExMklYZG42QkZPVHciLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEvIiwiaWF0IjoxNzQwMjkzMDM2LCJuYmYiOjE3NDAyOTMwMzYsImV4cCI6MTc0MDM3OTczNiwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVZRQXEvOFpBQUFBdG9XancrcUVqZ3dmLzFzdWp0dUs3TGpxdi9aalJHRlYva0dPMW1ONHFDM2h2blFYNFpNYUpCSC95aU8rWjZmeFZhYlVkQXpCWUVRbEtOS3ZLNkMwTllSSkYwUVlIcWtYTE11OFlWZ0tPR1k9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHcmFwaCBFeHBsb3JlciIsImFwcGlkIjoiZGU4YmM4YjUtZDlmOS00OGIxLWE4YWQtYjc0OGRhNzI1MDY0IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJUZWFtIiwiZ2l2ZW5fbmFtZSI6IkRldmVsb3BtZW50IiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTAzLjMxLjQxLjE5NCIsIm5hbWUiOiJEZXZlbG9wbWVudCBUZWFtIiwib2lkIjoiMTM2MGJjNzktYTBlMi00YjcwLTg5YWYtZGMxYjAzNWEzMDM0IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA0M0Q2RTlFRDgiLCJyaCI6IjEuQVQwQXcyRnNZTDZTMVVtTXh5VWhVUzdiWVFNQUFBQUFBQUFBd0FBQUFBQUFBQUE5QVBZOUFBLiIsInNjcCI6IkNoYW5uZWwuUmVhZEJhc2ljLkFsbCBDaGFubmVsTWVzc2FnZS5TZW5kIENoYXQuQ3JlYXRlIENoYXQuUmVhZFdyaXRlIEZpbGVzLlJlYWQuQWxsIE5vdGlmaWNhdGlvbnMuUmVhZFdyaXRlLkNyZWF0ZWRCeUFwcCBvcGVuaWQgcHJvZmlsZSBUZWFtLkNyZWF0ZSBUZWFtLlJlYWRCYXNpYy5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZEJhc2ljLkFsbCBVc2VyQWN0aXZpdHkuUmVhZFdyaXRlLkNyZWF0ZWRCeUFwcCBlbWFpbCIsInNpZCI6IjAwMWYyOGE5LTMxODctNjAzNi02YTU2LTMyMzQyNDExZTc4NyIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IlE0ZUc5TTBYUlJNMzR1UzhPTjNfdjBKODNtaEF0RFhXYkFpanFtRHZ5Z2siLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI2MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEiLCJ1bmlxdWVfbmFtZSI6ImRldnRlYW1AY29ubmVjdGljdXMuaW4iLCJ1cG4iOiJkZXZ0ZWFtQGNvbm5lY3RpY3VzLmluIiwidXRpIjoiQnhWWVdEcV9yVWFlNXI3SU1mTjNBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX2Z0ZCI6InRrNE1oV2R4aklyX1JVbGNLeWFIQ2FLeE11VEwtUTNualpSS1ZuVzc3R1kiLCJ4bXNfaWRyZWwiOiIxIDI0IiwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoid051UXdST2ZROThuRHBQcHlBVUtMSXVVaHhVUjl5el9mSzF2ejhENHlGcyJ9LCJ4bXNfdGNkdCI6MTU1ODc2MTUyOH0.TnQtwXRApoMQtO0jh86kA0XchhaD13wAfiAOQgEue9VZKa_t395V2WxMcXTy6HBc9PDzIYx5yTNTW78t_pQ93nwuJZTUUQx6QsNIRHuO2UxSyUvqobC0hx64u37ecxbIqzTOMo2cnWNDDUQLnSkhSyZFDA1D5ws73KVxn9fuMu6-Xiyz2R3tIFmwXvnb8t5Q9A06GFIidG3xW17aLHx4jAYZeRfrqzT0jVxA_TjBASfTs_b0SdGrJwTZTIt6MK6GTQyMfrYEF0VefY2wZbCFh3S0f7lg4YNCCENc5QyT1U_cal1hozJKWNSPrnmlOLKW7CzKHFwSlDlRLncuBeYqUw";
        const channels = await fetchChannels(teamId, accessToken);
        // await saveChannels(teamId, channels);
        res.json({ message: 'Channels saved successfully', channels });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving channels', error: error.message });
    }
}

async function createChannel(req, res) {
    try {
        const { teamId, displayName, description } = req.body;
        const channel = await createNewChannel(teamId, displayName, description);
        res.status(201).json(channel ? { message: "Channel created successfully", channel } : { message: "Error creating channel" });
    } catch (error) {
        res.status(500).json({ message: "Error creating channel" });
    }
}

async function deleteChannel(req, res) {
    try {
        const { teamId, channelId } = req.body;
        const result = await removeChannel(teamId, channelId);
        res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting channel" });
    }
}

async function sendMessage(req, res) {
    try {
        const { teamId, channelId, message } = req.body;
        const result = await sendChannelMessage(teamId, channelId, message);
        res.status(result ? 200 : 500).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error sending message" });
    }
}


const JIRA_BASE_URL = 'https://ujjwal27022004.atlassian.net/rest/api/3/issue';
const JIRA_EMAIL = process.env.JIRA_EMAIL
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY



async function createJiraIssue(req, res) {
   
        const { description, issueType } = req.body;

        if (!description || !issueType) {
            return res.status(400).json({ message: "Description and issueType are required" });
        }

        // Create issue in Jira
        const issue = await createJiraIssueService(description, issueType);

        if (!issue) {
            return res.status(500).json({ message: "Error creating Jira issue" });
        }

        // **Send message to Teams**
        const obj = {   
            teamId: "b94dc17d-7a42-45b4-bb8a-8ccf51342e88",
            channelId: "19:309d952cce5745c889faa9ecb705b041@thread.tacv2",
        }
        console.log(obj.teamId);
        console.log(obj.channelId)
        
        const msg= `New Jira Issue has been created successfully\n\n Description : ${description} \n\n Issue Type : ${issueType}`
        sendChannelMessage(obj.teamId, obj.channelId, msg)
    
        const issueData={
            id:issue.id,
            description,
            issueType
        }
        console.log("printing issue data for adaptive cards",issueData)
        sendAdaptiveCardToTeams(issueData)
    
}











async function getJiraIssues(req, res) {
    try {
        const issues = await fetchJiraIssues();
        res.status(issues ? 200 : 500).json(issues || { message: "Error fetching Jira issues" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Jira issues" });
    }
}






async function updateJiraIssue(req, res) {
    const { issueKey, description } = req.body;

    if (!issueKey || !description) {
        return res.status(400).json({ message: "issueKey and description are required" });
    }

    try {
        const response = await axios.put(
            `https://ujjwal27022004.atlassian.net/rest/api/2/issue/${issueKey}`,
            {
                fields: {
                    description: description, // directly updating description
                    // Optionally, you can update more fields like summary, etc.
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`, // Basic Auth with encoded email and API token
                    'Content-Type': 'application/json',
                }
            }
        );

        res.status(200).json({ message: "JIRA issue description updated successfully", issue: response.data });
    } catch (error) {
        console.error('Error updating Jira issue:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Error updating Jira issue", error: error.response?.data });
    }
}











const MS_TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL; 

const adminConfig = {
    issueKey: true,
    summary: false,
    status: true,
    priority: true,
    description: false
};
async function handleJiraWebhook(req, res) { 
    try {
        console.log("Received Jira Webhook:", JSON.stringify(req.body, null, 2));

        // Extract relevant data from Jira Webhook payload
        const issueKey = req.body.issue?.key || "No issueKey";
        const summary = req.body.issue?.fields?.summary || "No summary";
        const status = req.body.issue?.fields?.status?.name || "No status";
        const priority = req.body.issue?.fields?.priority?.name || "No Priority";
        const description = req.body.issue?.fields?.description || "No Description";
        const issueUrl = `${process.env.JIRA_BASE_URL}/browse/${issueKey}`;

        console.log(description)

        // **Dynamically build the message based on adminConfig**
        let messageBody = `**Jira Issue Updated: [${issueKey}](${issueUrl})** 🚀\n`;
        if (adminConfig.issueKey && issueKey) messageBody += `🔹 **Issue Key:** ${issueKey} \n`;
        if (adminConfig.summary && summary) messageBody += `📌 **Summary:** ${summary} \n`;
        if (adminConfig.status && status) messageBody += `📊 **Status:** ${status} \n`;
        if (adminConfig.priority && priority) messageBody += `⚡ **Priority:** ${priority} \n`;
        if (adminConfig.description && description) messageBody += `📝 **Description:** ${description} \n`;

        // **DEBUG: Log Message Body**
        console.log("Final Message Body:", messageBody);

        // If no valid fields, return early to prevent empty webhook
        if (!messageBody.trim()) {
            console.warn("No selected fields contain valid data. Webhook not sent.");
            return res.status(400).json({ message: "No valid fields selected for notification." });
        }

        // Prepare the payload for MS Teams Webhook
        const teamsMessage = {
            "text": messageBody
        };

        // **DEBUG: Log Final Message**
        console.log("Final Teams Message:", JSON.stringify(teamsMessage, null, 2));

        // Send formatted message to Microsoft Teams
        const response = await axios.post(MS_TEAMS_WEBHOOK_URL, teamsMessage);
        console.log("Message sent to MS Teams:", response.data);

        res.status(200).json({ message: "Webhook processed and sent to Teams" });
    } catch (error) {
        console.error("Error processing webhook:", error.message);
        res.status(500).json({ error: "Failed to process webhook" });
    }
    
}










const TEAMS_WEBHOOK_URL = "https://connecticustech.webhook.office.com/webhookb2/b94dc17d-7a42-45b4-bb8a-8ccf51342e88@606c61c3-92be-49d5-8cc7-2521512edb61/IncomingWebhook/e33d398c0e7148f780beb57d1f8b0d83/1360bc79-a0e2-4b70-89af-dc1b035a3034/V2m2ScLOWYsjl2k_UxNpTi7lWqvNOC_oZ7HilLwkABWTc1"
const sendAdaptiveCardToTeams = async (issueData,statusMessage="") => {
    const adaptiveCard = {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.4",
                    body: [
                        {
                            type: "TextBlock",
                            size: "Medium",
                            weight: "Bolder",
                            text: `Issue Type : ${issueData.issueType}`
                        },
                        {
                            type: "TextBlock",
                            text: `Description : ${issueData.description}`,
                            wrap: true
                        },
                        {
                            type: "TextBlock",
                            text: `Issue ID: ${issueData.id}`,
                            weight: "Lighter",
                            wrap: true
                        },
                        ...(statusMessage
                            ? [
                                {
                                    type: "TextBlock",
                                    text: statusMessage,
                                    color: "Good",
                                    weight: "Bolder",
                                    wrap: true
                                }
                            ]
                            : [])
                    ],
                    actions: [
                        {
                            type: "Action.ShowCard",
                            title: "Update Issue",
                            card: {
                                type: "AdaptiveCard",
                                body: [
                                    {
                                        type: "Input.ChoiceSet",
                                        id: "updatedIssueType",
                                        label: "Select Issue Type",
                                        style: "compact",
                                        choices: [
                                            { title: "Bug", value: "Bug" },
                                            { title: "Story", value: "Story" },
                                            { title: "Task", value: "Task" }
                                        ],
                                        value: issueData.issueType // Default to current issue type
                                    },
                                    {
                                        type: "Input.Text",
                                        id: "updatedDescription",
                                        label: "Update Description",
                                        isMultiline: true,
                                        placeholder: "Enter new issue description...",
                                        value: issueData.description // Default to current description
                                    }
                                ],
                                actions: [
                                    {
                                        type: "Action.Submit",
                                        title: "Submit",
                                        data: {
                                            action:"updateIssue",
                                            issueKey:issueData.id
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            type: "Action.OpenUrl",
                            title: "View Details",
                            url: `https://ujjwal27022004.atlassian.net/jira/software/projects/WTS/boards/2/backlog?selectedIssue=${issueData.id}`
                        }
                    ]
                }
            }
        ]
    };
    
    
  
    try {
        console.log("try blok executing")
      const response = await axios.post(TEAMS_WEBHOOK_URL, adaptiveCard, {
        headers: { 
            Authorization : `Bearer ${globaltoken}`,
            "Content-Type": "application/json"
         },
      });
      console.log("working after the try block")
      console.log("Adaptive Card sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending Adaptive Card to Teams:", error);
    }
  };



   async function issue(req, res) {
    const { title, description } = req.body;
  
    // Simulate saving to a database and generating an issue ID
    const newIssue = {
      id: `ISSUE-${Date.now()}`,
      title,
      description,
    };
  
    console.log("New issue created:", newIssue);
  
    // Send Adaptive Card notification
    await sendAdaptiveCardToTeams(newIssue);
  
    res.status(201).json({ message: "Issue created and Teams notification sent!", issue: newIssue });
  }



  async function updateissue (req, res) {
    const { action, issueKey, updatedIssueType, updatedDescription } = req.body;

    if (action === "updateIssue") {
        console.log(`Updating issue ${issueKey}`);
        console.log(`New Type: ${updatedIssueType}`);
        console.log(`New Description: ${updatedDescription}`);

        // Simulate database update
        const updatedIssue = {
            key: issueKey,
            issueType: updatedIssueType || "Bug",
            description: updatedDescription || "No description provided."
        };

        // Status message to confirm the update
        const statusMessage = `✅ Issue updated successfully! New Type: ${updatedIssue.issueType}`;

        // Send an updated Adaptive Card with new details
        await sendAdaptiveCardToTeams(updatedIssue, statusMessage);

        return res.json({ message: `Issue ${issueKey} updated successfully.` });
    }

    res.status(400).json({ error: "Invalid action type" });
}

module.exports = { getTeamsList, createTeam, getChannels, createChannel, deleteChannel, sendMessage, createJiraIssue, getJiraIssues,handleJiraWebhook,updateJiraIssue,issue,updateissue };
