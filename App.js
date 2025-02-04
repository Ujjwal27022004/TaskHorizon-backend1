const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const axios = require('axios');
const qs = require('qs');
const routes = require('./routes');
const dotenv = require('dotenv')
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const globaltoken = process.env.GLOBALTOKEN;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql#amar#2003',
    database: 'to_do_app'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Pass the db connection to routes
app.use('/api', (req, res, next) => {
    req.db = db;
    next();
});

app.use('/api', routes);

// Azure AD and Microsoft Teams API details
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const tenantId = process.env.tenantId;

// OAuth2 token endpoint
const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

// Get access token
async function getAccessToken() {
    try {
        const response = await axios.post(tokenUrl, qs.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
    }
}

// Get Teams list
async function getTeamsList(accessToken) {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me/joinedTeams', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting Teams list:', error.response ? error.response.data : error.message);
    }
}

let lastKnownTeams = [];



function addTeamToDatabase(team) {
    const query = 'INSERT INTO teams (id, name) VALUES (?, ?)';
    db.query(query, [team.id, team.displayName], (err, result) => {
        if (err) {
            console.error('Error adding team to database:', err);
        } else {
            console.log('Team added to database:', result);
        }
    });
}

// setInterval(checkForTeamChanges, 10000);

app.get('/teams', async (req, res) => {
    try {
        const accessToken = globaltoken;
        const teams = await getTeamsList(accessToken);
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Teams', error: error.message });
    }
});


// Fetch channels for a specific team
async function getChannelsForTeam(teamId, accessToken) {
    try {
        accessToken = globaltoken
        const response = await axios.get(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.value;  // Return channels array
    } catch (error) {
        console.error('Error fetching channels:', error.response ? error.response.data : error.message);
    }
}

// Save channels to the database
async function saveChannelsToDatabase(teamId, channels) {
    const query = 'INSERT INTO channels (id, team_id, name, description) VALUES (?, ?, ?, ?)';
    for (const channel of channels) {
        db.query(query, [channel.id, teamId, channel.displayName, channel.description || ''], (err, result) => {
            if (err) {
                console.error('Error inserting channel into database:', err);
            } else {
                console.log('Inserted channel:', result);
            }
        });
    }
}

app.get('/channels/:teamId', async (req, res) => {
    const { teamId } = req.params;
    console.log(teamId)
    try {
        const accessToken = globaltoken;
        const channels = await getChannelsForTeam(teamId, accessToken);

        // Save channels to the database
        await saveChannelsToDatabase(teamId, channels);

        res.json({ message: 'Channels saved successfully', channels });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving channels', error: error.message });
    }
});


async function createTeam(teamData) {
    const accessToken = globaltoken;
    try {
        const response = await axios.post('https://graph.microsoft.com/v1.0/teams', teamData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const team = response.data;

        // Save the created team to your database
        const query = 'INSERT INTO teams (id, name) VALUES (?, ?)';
        const values = [team.id, team.displayName];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error saving team to database:', err);
            } else {
                console.log('Team saved to database');
            }
        });

        return team;
    } catch (error) {
        console.error('Error creating team:', error.response ? error.response.data : error.message);
    }
}

// API route to handle team creation
app.post('/create-team', async (req, res) => {
    const { name } = req.body;

    // const teamData = {
    //     "template@odata.bind: "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
    //     "displayName": name,
    //     "description": description,
    //     // "visibility": visibility,
    //     // "members": [
    //     //     {
    //     //         "@odata.type": "#microsoft.graph.aadUserConversationMember",
    //     //         "roles": ["owner"],
    //     //         "user@odata.bind": "https://graph.microsoft.com/v1.0/users/{userId}" // Replace with valid userId
    //     //     }
    //     // ]
    // };

    const teamData = {
        "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",  // Template for team creation
        "displayName": name,                           // Team name
    };

    const team = await createTeam(teamData);

    if (team) {
        res.status(201).json({ message: 'Team created successfully', team });
    } else {
        res.status(500).json({ message: 'Error creating team' });
    }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//Create channel
async function createChannel(teamId, channelData) {
    const accessToken = globaltoken;
    try {
        const response = await axios.post(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, channelData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data; // Return created channel data
    } catch (error) {
        console.error('Error creating channel:', error.response ? error.response.data : error.message);
        return null;
    }
}

app.post('/create-channel', async (req, res) => {
    const { teamId, displayName, description } = req.body;

    if (!teamId || !displayName) {
        return res.status(400).json({ message: "teamId and displayName are required" });
    }

    const channelData = {
        displayName,
        description
    };

    const channel = await createChannel(teamId, channelData);

    if (channel) {
        res.status(201).json({ message: "Channel created successfully", channel });
    } else {
        res.status(500).json({ message: "Error creating channel" });
    }
});


async function deleteChannel(teamId, channelId) {
    const accessToken = globaltoken;
    try {
        const response = await axios.delete(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return { success: true, message: "Channel deleted successfully" };
    } catch (error) {
        console.error('Error deleting channel:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response ? error.response.data : error.message };
    }
}

// API Route to Delete a Channel
app.delete('/delete-channel', async (req, res) => {
    const { teamId, channelId } = req.body;

    if (!teamId || !channelId) {
        return res.status(400).json({ message: "teamId and channelId are required" });
    }

    const result = await deleteChannel(teamId, channelId);

    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});


//------------------------------------------------------------------------------------------------------------------------------------
// Send msg
async function sendMessageToChannel(teamId, channelId, message) {
    const accessToken = globaltoken;
    try {
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
            { body: { content: message } },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        // console("Message sent")

        return response.data; // Return sent message data
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        return null;
    }
}

// API Route to Send a Message to a Channel
app.post('/send-message', async (req, res) => {
    const { teamId, channelId, message } = req.body;

    if (!teamId || !channelId || !message) {
        return res.status(400).json({ message: "teamId, channelId, and message are required" });
    }

    const result = await sendMessageToChannel(teamId, channelId, message);

    if (result) {
        res.status(200);
    } else {
        res.status(500).json({ message: "Error sending message" });
    }
});

// async function sendTeamMessage(accessToken) {
//     try {
//         const response = await axios.get('https://graph.microsoft.com/v1.0/me/joinedTeams', {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error getting Teams list:', error.response ? error.response.data : error.message);
//     }
// }


async function createissue(teamId, channelData) {
    try {
        const response = await axios.post(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, channelData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data; // Return created channel data
    } catch (error) {
        console.error('Error creating channel:', error.response ? error.response.data : error.message);
        return null;
    }
}


const JIRA_BASE_URL = 'https://ujjwal27022004.atlassian.net/rest/api/3/issue';
const JIRA_EMAIL = process.env.JIRA_EMAIL
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY

// Function to create an issue in JIRA
async function createJiraIssue(description, issueType) {
    const issueData = {
        fields: {
            project: { key: JIRA_PROJECT_KEY },
            summary: "New Issue Created via API",
            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                text: description,
                                type: "text"
                            }
                        ]
                    }
                ]
            },
            issuetype: { name: issueType }
        }
    };

    try {
        const response = await axios.post(JIRA_BASE_URL, issueData, {
            auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data; 
    } catch (error) {
        console.error('Error creating JIRA issue:', error.response ? error.response.data : error.message);
        return null;
    }
}

// API Route to Create an Issue in JIRA
app.post('/create-jira-issue', async (req, res) => {
    const { description, issueType } = req.body;

    if (!description || !issueType) {
        return res.status(400).json({ message: "description and issueType are required" });
    }

    const issue = await createJiraIssue(description, issueType);

    if (issue) {
        res.status(201).json({ message: "Polarian Backlog created successfully", issue });
    } else {
        res.status(500).json({ message: "Error creating JIRA issue" });
    }
    const obj = {
        teamId: "b94dc17d-7a42-45b4-bb8a-8ccf51342e88",
        channelId: "19:309d952cce5745c889faa9ecb705b041@thread.tacv2",
    }
    console.log(obj.teamId);
    console.log(obj.channelId)
    
    const msg= `New Jira Issue has been created successfully\n\n Description : ${description} \n\n Issue Type : ${issueType}`
    sendMessageToChannel(obj.teamId, obj.channelId, msg)

    const issueData={
        id:issue.key,
        description,
        issueType
    }
    console.log("printing issue data for adaptive cards",issueData)
    sendAdaptiveCardToTeams(issueData)

});


app.get('/get-jira-issues', async (req, res) => {
    try {
        const response = await axios.get(
            "https://ujjwal27022004.atlassian.net/rest/api/2/search?jql=project=WTS%20ORDER%20BY%20Created",
            {
                auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
                headers: { 'Content-Type': 'application/json' }
            }
        );    

        console.log('Response Data:', response.data); // Log full response

        if (response.data.issues && response.data.issues.length > 0) {
            // Extract only required fields
            const issues = response.data.issues.map(issue => ({
                id: issue.id,
                key: issue.key,
                summary: issue.fields.summary, // Issue summary
                description: issue.fields.description || "No description provided", // Issue description
                issueType: issue.fields.issuetype.name // Issue type name
            }));

            res.json(issues); // Return filtered issues
        } else {
            res.status(404).json({ message: "No issues found." });
        }

    } catch (error) {
        console.error('Error fetching Jira issues:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching Jira issues');
    }
});

app.get('/get-jira-issues', async (req, res) => {
    try {
        const response = await axios.get(
            "https://ujjwal27022004.atlassian.net/rest/api/2/search?jql=project=WTS%20ORDER%20BY%20Created",
            {
                auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
                headers: { 'Content-Type': 'application/json' }
            }
        );    

        console.log('Response Data:', response.data); // Log full response

        if (response.data.issues && response.data.issues.length > 0) {
            // Extract only required fields
            const issues = response.data.issues.map(issue => ({
                id: issue.id,
                key: issue.key,
                summary: issue.fields.summary, // Issue summary
                description: issue.fields.description || "No description provided", // Issue description
                issueType: issue.fields.issuetype.name // Issue type name
            }));

            res.json(issues); // Return filtered issues
        } else {
            res.status(404).json({ message: "No issues found." });
        }

    } catch (error) {
        console.error('Error fetching Jira issues:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching Jira issues');
    }
});





app.put('/update-jira-description', async (req, res) => {
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
});


const TEAMS_WEBHOOK_URL = "https://connecticustech.webhook.office.com/webhookb2/cba0dd4e-956d-476a-b8f9-9658f8bee60c@606c61c3-92be-49d5-8cc7-2521512edb61/IncomingWebhook/86a851e37c514995ad94a5b7e930c69d/1360bc79-a0e2-4b70-89af-dc1b035a3034/V2LahgI-_ST83ilZDGVp7W_aLcYv7p1bFcFbNLvCJTOaA1"
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
                            text: issueData.issueType
                        },
                        {
                            type: "TextBlock",
                            text: issueData.description,
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
                                        type: "Action.Execute",
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
                            url: `https://your-frontend.com/issues/${issueData.id}`
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
  

  app.post("/issues", async (req, res) => {
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
  });

// const updateIssue=async(updateIssueObject)=>{
//     console.log("update issue function has been called");
//     try {
//         console.log("tyry block of update issue function has been called");
//         const response = await axios.put(
//             `https://ujjwal27022004.atlassian.net/rest/api/2/issue/${updateIssueObject.issueKey}`,
//             {
//                 fields: {
//                     description: updateIssueObject.description, // directly updating description
//                     issueType:updateIssueObject.issueType
//                 }
//             },
//             {
//                 headers: {
//                     'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`, // Basic Auth with encoded email and API token
//                     'Content-Type': 'application/json',
//                 }
//             }
//         );

//         res.status(200).json({ message: "JIRA issue description updated successfully", issue: response.data });
//     } catch (error) {
//         console.error('Error updating Jira issue:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: "Error updating Jira issue", error: error.response?.data });
//     }
       
    
//         res.status(400).json({ error: "Invalid action" });
    
// }

app.post("/updateIssue", async (req, res) => {
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
});

  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

