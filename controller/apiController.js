const axios = require('axios');
const { getAccessToken, fetchTeams, fetchChannels, saveChannels, createNewTeam, createNewChannel, removeChannel, sendChannelMessage, createJiraIssueService, fetchJiraIssues } = require('../services/apiService');

const globaltoken = process.env.GLOBALTOKEN;



async function getTeamsList(req, res) {
    try {
        const accessToken = await getAccessToken();
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
        const accessToken = await getAccessToken();
        const channels = await fetchChannels(teamId, accessToken);
        await saveChannels(teamId, channels);
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


async function handleJiraWebhook(req, res) {
    try {
        console.log("Received Jira Webhook:", JSON. stringify(req.body, null, 2));

        // Extract relevant data from Jira Webhook payload
        const issueKey = req.body.issue?.key || "Unknown Issue";
        const summary = req.body.issue?.fields?.summary || "No Summary";
        const status = req.body.issue?.fields?.status?.name || "No Status";
        const priority = req.body.issue?.fields?.priority?.name || "No Priority";
        const description = req.body.issue?.fields?.description || "No Description";
        const issueUrl = `${process.env.JIRA_BASE_URL}/browse/${issueKey}`;

        // Prepare the payload for MS Teams Webhook (Adaptive Card Format)
        const teamsMessage = {
            "text": `**Jira Issue Updated: [${issueKey}](${issueUrl})** 🚀 \n Summary : ${summary} \n Description : ${description} \n IssueKey : ${issueKey}`,
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": {
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "type": "AdaptiveCard",
                        "version": "1.4",
                        "body": [
                            {
                                "type": "TextBlock",
                                "text": "**Jira Issue Update**",
                                "weight": "bolder",
                                "size": "medium"
                            },
                            {
                                "type": "FactSet",
                                "facts": [
                                    { "title": "Issue Key:", "value": issueKey },
                                    { "title": "Summary:", "value": summary },
                                    { "title": "Status:", "value": status },
                                    { "title": "Priority:", "value": priority }
                                ]
                            }
                        ]
                    }
                }
            ]
        };

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
