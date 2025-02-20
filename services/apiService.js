const axios = require('axios');
const { teams, jira } = require('../config/apiconfig');

// -------------------- Microsoft Teams Functions --------------------

// Get access token for Microsoft Teams API
// async function getAccessToken() {
//     try {
//         const response = await axios.post(teams.tokenUrl, new URLSearchParams({
//             client_id: teams.clientId,
//             client_secret: teams.clientSecret,
//             scope: `${teams.graphApiUrl}/.default`,
//             grant_type: 'client_credentials'
//         }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

//         return response.data.access_token;
//     } catch (error) {
//         console.error('Error getting access token:', error.message);
//     }
// }

// Fetch list of Teams
async function fetchTeams(accessToken) {
    try {
        const response = await axios.get(`${teams.graphApiUrl}/me/joinedTeams`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Teams:', error.response ? error.response.data : error.message);
        return [];
    }
}

// Fetch channels for a team
async function fetchChannels(teamId, accessToken) {
    try {
        const response = await axios.get(`${teams.graphApiUrl}/teams/${teamId}/channels`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return response.data.value;
    } catch (error) {
        console.error('Error fetching channels:', error.response ? error.response.data : error.message);
        return [];
    }
}

// Save channels to database
async function saveChannels(teamId, channels) {
    const db = require('../config/database');
    const query = 'INSERT INTO channels (id, team_id, name, description) VALUES (?, ?, ?, ?)';

    for (const channel of channels) {
        db.query(query, [channel.id, teamId, channel.displayName, channel.description || ''], (err) => {
            if (err) console.error('Error saving channel:', err);
        });
    }
}

// Create a new Team
async function createNewTeam(name, accessToken) {
    try {
        const response = await axios.post(`${teams.graphApiUrl}/teams`, {
            "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
            "displayName": name
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating team:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Create a new Channel
async function createNewChannel(teamId, displayName, description) {
    // const accessToken = await getAccessToken();
    const accessToken = process.env.GLOBALTOKEN
    try {
        const response = await axios.post(`${teams.graphApiUrl}/teams/${teamId}/channels`, {
            displayName,
            description
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating channel:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Delete a channel
async function removeChannel(teamId, channelId) {
    // const accessToken = await getAccessToken();
    const accessToken = process.env.GLOBALTOKEN
    try {
        await axios.delete(`${teams.graphApiUrl}/teams/${teamId}/channels/${channelId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return { success: true, message: "Channel deleted successfully" };
    } catch (error) {
        console.error('Error deleting channel:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response ? error.response.data : error.message };
    }
}

// Send a message to a channel
async function sendChannelMessage(teamId, channelId, message) {
    // const accessToken = await getAccessToken();
    const accessToken = process.env.GLOBALTOKEN
    try {
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
            { body: { content: message } },
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('Error sending message to Teams:', error.response ? error.response.data : error.message);
        return null;
    }
}

// -------------------- Jira Functions --------------------

// Create an issue in Jira
async function createJiraIssueService(description, issueType) {
    try {
        const issueData = {
            fields: {
                project: { key: jira.projectKey },
                summary: "New Issue Created via API",
                description: {
                    type: "doc",
                    version: 1,
                    content: [{ type: "paragraph", content: [{ text: description, type: "text" }] }]
                },
                issuetype: { name: issueType }
            }
        };

        const response = await axios.post(jira.baseUrl, issueData, {
            auth: { username: jira.email, password: jira.apiToken },
            headers: { 'Content-Type': 'application/json' }
        });

        const issue = response.data;

        // **Send a message to Teams channel**
        const teamId = "b94dc17d-7a42-45b4-bb8a-8ccf51342e88";  // Replace with actual Team ID
        const channelId = "19:309d952cce5745c889faa9ecb705b041@thread.tacv2";  // Replace with actual Channel ID
        const message = `🚀 **New Jira Issue Created** 🚀\n\n📌 *Description:* ${description}\n🛠️ *Issue Type:* ${issueType}`;

        await sendChannelMessage(teamId, channelId, message);

        return issue;

    } catch (error) {
        console.error('Error creating Jira issue:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Fetch all Jira issues
async function fetchJiraIssues() {
    try {
        const response = await axios.get(
            `https://ujjwal27022004.atlassian.net/rest/api/2/search?jql=project=${jira.projectKey} ORDER BY Created`,
            {
                auth: { username: jira.email, password: jira.apiToken },
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return response.data.issues.map(issue => ({
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            description: issue.fields.description || "No description provided",
            issueType: issue.fields.issuetype.name
        }));
    } catch (error) {
        console.error('Error fetching Jira issues:', error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = {
    // getAccessToken,
    fetchTeams,
    fetchChannels,
    saveChannels,
    createNewTeam,
    createNewChannel,
    removeChannel,
    sendChannelMessage,
    createJiraIssueService,
    fetchJiraIssues
};
