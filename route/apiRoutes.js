const express = require('express');
const { getTeamsList, createTeam, getChannels, createChannel, deleteChannel, sendMessage, createJiraIssue, getJiraIssues,handleJiraWebhook,updateJiraIssue,issue,updateissue } = require('../controller/apiController');

const router = express.Router();

// Teams & Channels
router.get('/teams', getTeamsList);
router.post('/create-team', createTeam);
router.get('/channels/:teamId', getChannels);
router.post('/create-channel', createChannel);
router.delete('/delete-channel', deleteChannel);
router.post('/send-message', sendMessage);

// Jira
router.post('/create-jira-issue', createJiraIssue);
router.get('/get-jira-issues', getJiraIssues);
router.put('/update-jira-description',updateJiraIssue)

// router.post('/jira/webhook', handleJiraWebhook);


router.post("/issues", issue);

router.post("/updateIssue", updateissue);
  



module.exports = router;
