module.exports = {
    teams: {
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        tenantId: process.env.tenantId,
        tokenUrl: `https://login.microsoftonline.com/${process.env.tenantId}/oauth2/v2.0/token`,
        graphApiUrl: 'https://graph.microsoft.com/v1.0'
    },
    jira: {
        baseUrl: 'https://ujjwal27022004.atlassian.net/rest/api/3/issue',
        email: process.env.JIRA_EMAIL,
        apiToken: process.env.JIRA_API_TOKEN,
        projectKey: process.env.JIRA_PROJECT_KEY
    }
};
