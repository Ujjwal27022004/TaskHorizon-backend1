const express = require("express");
const router = express.Router();
const axios = require("axios");
const TeamConfig = require("../model/TeamConfig");

router.post("/jira/webhook", async (req, res) => {
  try {
    const { webhookEvent, project } = req.body;

    if (webhookEvent === "project_created") {
      const projectName = project.name;

      // Fetch default team from database
      const teamConfig = await TeamConfig.findOne();
      if (!teamConfig) {
        return res.status(500).json({ message: "No default team configured" });
      }

      const teamId = teamConfig.teamId;
      const users = teamConfig.predefinedUsers;

      // Create a new channel in Microsoft Teams
      const channelCreationResponse = await createTeamsChannel(teamId, projectName);

      if (channelCreationResponse) {
        // Add predefined users to the channel
        await addUsersToChannel(teamId, channelCreationResponse.id, users);
        return res.status(200).json({ message: "Channel created and users added" });
      } else {
        return res.status(500).json({ message: "Failed to create channel" });
      }
    }

    res.status(200).send("Event received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const createTeamsChannel = async (teamId, channelName) => {
    try {
      const response = await axios.post(
        `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
        {
          displayName: channelName,
          description: `Channel for ${channelName}`,
          membershipType: "standard"
        },
        {
          headers: {
            Authorization: `eyJ0eXAiOiJKV1QiLCJub25jZSI6IkJuOGJsWktla2NISy1YT1ozUDFXWWZ2YnJXNFBmTXNVWjBGeDBWQlBqRmMiLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEvIiwiaWF0IjoxNzQwMjkyODYxLCJuYmYiOjE3NDAyOTI4NjEsImV4cCI6MTc0MDM3OTU2MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVZRQXEvOFpBQUFBUjFHbjNldVFwWmhaWWErTzBrZHEwZzlXTVhUaHM3ZlFjb1pKbzNtM0RHSENkeDFVMlYydDR1WU56Z1I4amZwVTU5Q1lYMTBQUS9wbkNpeENiSlQ5eFdyZXZreEozRk03WW9VRUQwSWZzc2c9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHcmFwaCBFeHBsb3JlciIsImFwcGlkIjoiZGU4YmM4YjUtZDlmOS00OGIxLWE4YWQtYjc0OGRhNzI1MDY0IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJEZXNobXVraCIsImdpdmVuX25hbWUiOiJSdXBhbGkiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDMuMTIwLjI1MC4yNDIiLCJuYW1lIjoiUnVwYWxpIERlc2htdWtoIiwib2lkIjoiZDQxOTFkZmUtMzA4ZC00ZDFjLWEwNDktMWJlODgyY2NiMGQxIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDAwNEE3NTZBMzciLCJyaCI6IjEuQVQwQXcyRnNZTDZTMVVtTXh5VWhVUzdiWVFNQUFBQUFBQUFBd0FBQUFBQUFBQUE5QUR3OUFBLiIsInNjcCI6IkNoYW5uZWwuQ3JlYXRlIENoYW5uZWwuUmVhZEJhc2ljLkFsbCBDaGFubmVsTWVtYmVyLlJlYWRXcml0ZS5BbGwgQ2hhbm5lbE1lc3NhZ2UuUmVhZC5BbGwgQ2hhbm5lbE1lc3NhZ2UuU2VuZCBDaGF0LkNyZWF0ZSBDaGF0LlJlYWRXcml0ZSBEaXJlY3RvcnkuUmVhZFdyaXRlLkFsbCBFeHRlcm5hbENvbm5lY3Rpb24uUmVhZC5BbGwgRXh0ZXJuYWxDb25uZWN0aW9uLlJlYWRXcml0ZS5BbGwgRXh0ZXJuYWxDb25uZWN0aW9uLlJlYWRXcml0ZS5Pd25lZEJ5IEV4dGVybmFsVXNlclByb2ZpbGUuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBvcGVuaWQgcHJvZmlsZSBUZWFtTWVtYmVyLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIGVtYWlsIiwic2lkIjoiMDAyMWMwYjktN2RkYi00YjI4LTNlZDQtNzM3ZmMwNGU3ZGUwIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiU3FSUl90MmpheDNScmhQeGFJNkh6dkRwTnlNOUgzR0tDeWppSk1VNjFIUSIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJBUyIsInRpZCI6IjYwNmM2MWMzLTkyYmUtNDlkNS04Y2M3LTI1MjE1MTJlZGI2MSIsInVuaXF1ZV9uYW1lIjoicnVwYWxpLmRlc2htdWtoQGNvbm5lY3RpY3VzLmluIiwidXBuIjoicnVwYWxpLmRlc2htdWtoQGNvbm5lY3RpY3VzLmluIiwidXRpIjoib2VHS2d2RC1oRXVyUElvM29aeDNBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIiwiNjkwOTEyNDYtMjBlOC00YTU2LWFhNGQtMDY2MDc1YjJhN2E4IiwiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX2Z0ZCI6InpKeXp4R3hlZV8xZ2JxY21JOFFaWmtCaC1YcllUTFhZRjlTZ0MwR0NuLTgiLCJ4bXNfaWRyZWwiOiIxIDEyIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoiNHlHYXY0eXBTQWR1OW9kd2JiczljOWYyeFYtMXlSN0cyVWU5eG9zN2Y1TSJ9LCJ4bXNfdGNkdCI6MTU1ODc2MTUyOH0.p_QTiIVvhoO1ZiQOAhkF6a7cxsELJ__ELOJVPWfHvSwZ6mg3qU1Hg93t2MWzoHgIAcO3b8CHdNXwssWE4Dka0xfLqKwAboDVfkC7SLl0z0nPqWS71DWFpDvlphlZ87F16Z3RY-R6TILW69OFfO9g3A_1bTXJUWGHo3M4ORCYmKhMP5JaTMDfUSHaSVeDtEt6RY7ckklSJtOfj5P7hMnSKNbI0Z4LUHVaXBcXmZ4Zb2w4_di2VC5kQixLIfQ41N-WCQlmdhdEahsRJUMf40p6sEOjxreqQ2F2j0icTqOBxcpfmBNe9R1nES7b45OiMFNfSI2lxToPV5ear6cD1J5O9A`,
            "Content-Type": "application/json"
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error creating channel:", error.response?.data);
      return null;
    }
  };

  const addUsersToChannel = async (teamId, channelId, users) => {
    try {
      for (const user of users) {
        await axios.post(
          `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/members`,
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: [],
            user: {
              id: user.userId
            }
          },
          {
            headers: {
              Authorization: `eyJ0eXAiOiJKV1QiLCJub25jZSI6IkJuOGJsWktla2NISy1YT1ozUDFXWWZ2YnJXNFBmTXNVWjBGeDBWQlBqRmMiLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82MDZjNjFjMy05MmJlLTQ5ZDUtOGNjNy0yNTIxNTEyZWRiNjEvIiwiaWF0IjoxNzQwMjkyODYxLCJuYmYiOjE3NDAyOTI4NjEsImV4cCI6MTc0MDM3OTU2MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVZRQXEvOFpBQUFBUjFHbjNldVFwWmhaWWErTzBrZHEwZzlXTVhUaHM3ZlFjb1pKbzNtM0RHSENkeDFVMlYydDR1WU56Z1I4amZwVTU5Q1lYMTBQUS9wbkNpeENiSlQ5eFdyZXZreEozRk03WW9VRUQwSWZzc2c9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHcmFwaCBFeHBsb3JlciIsImFwcGlkIjoiZGU4YmM4YjUtZDlmOS00OGIxLWE4YWQtYjc0OGRhNzI1MDY0IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJEZXNobXVraCIsImdpdmVuX25hbWUiOiJSdXBhbGkiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDMuMTIwLjI1MC4yNDIiLCJuYW1lIjoiUnVwYWxpIERlc2htdWtoIiwib2lkIjoiZDQxOTFkZmUtMzA4ZC00ZDFjLWEwNDktMWJlODgyY2NiMGQxIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDAwNEE3NTZBMzciLCJyaCI6IjEuQVQwQXcyRnNZTDZTMVVtTXh5VWhVUzdiWVFNQUFBQUFBQUFBd0FBQUFBQUFBQUE5QUR3OUFBLiIsInNjcCI6IkNoYW5uZWwuQ3JlYXRlIENoYW5uZWwuUmVhZEJhc2ljLkFsbCBDaGFubmVsTWVtYmVyLlJlYWRXcml0ZS5BbGwgQ2hhbm5lbE1lc3NhZ2UuUmVhZC5BbGwgQ2hhbm5lbE1lc3NhZ2UuU2VuZCBDaGF0LkNyZWF0ZSBDaGF0LlJlYWRXcml0ZSBEaXJlY3RvcnkuUmVhZFdyaXRlLkFsbCBFeHRlcm5hbENvbm5lY3Rpb24uUmVhZC5BbGwgRXh0ZXJuYWxDb25uZWN0aW9uLlJlYWRXcml0ZS5BbGwgRXh0ZXJuYWxDb25uZWN0aW9uLlJlYWRXcml0ZS5Pd25lZEJ5IEV4dGVybmFsVXNlclByb2ZpbGUuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBvcGVuaWQgcHJvZmlsZSBUZWFtTWVtYmVyLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIGVtYWlsIiwic2lkIjoiMDAyMWMwYjktN2RkYi00YjI4LTNlZDQtNzM3ZmMwNGU3ZGUwIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiU3FSUl90MmpheDNScmhQeGFJNkh6dkRwTnlNOUgzR0tDeWppSk1VNjFIUSIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJBUyIsInRpZCI6IjYwNmM2MWMzLTkyYmUtNDlkNS04Y2M3LTI1MjE1MTJlZGI2MSIsInVuaXF1ZV9uYW1lIjoicnVwYWxpLmRlc2htdWtoQGNvbm5lY3RpY3VzLmluIiwidXBuIjoicnVwYWxpLmRlc2htdWtoQGNvbm5lY3RpY3VzLmluIiwidXRpIjoib2VHS2d2RC1oRXVyUElvM29aeDNBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIiwiNjkwOTEyNDYtMjBlOC00YTU2LWFhNGQtMDY2MDc1YjJhN2E4IiwiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX2Z0ZCI6InpKeXp4R3hlZV8xZ2JxY21JOFFaWmtCaC1YcllUTFhZRjlTZ0MwR0NuLTgiLCJ4bXNfaWRyZWwiOiIxIDEyIiwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoiNHlHYXY0eXBTQWR1OW9kd2JiczljOWYyeFYtMXlSN0cyVWU5eG9zN2Y1TSJ9LCJ4bXNfdGNkdCI6MTU1ODc2MTUyOH0.p_QTiIVvhoO1ZiQOAhkF6a7cxsELJ__ELOJVPWfHvSwZ6mg3qU1Hg93t2MWzoHgIAcO3b8CHdNXwssWE4Dka0xfLqKwAboDVfkC7SLl0z0nPqWS71DWFpDvlphlZ87F16Z3RY-R6TILW69OFfO9g3A_1bTXJUWGHo3M4ORCYmKhMP5JaTMDfUSHaSVeDtEt6RY7ckklSJtOfj5P7hMnSKNbI0Z4LUHVaXBcXmZ4Zb2w4_di2VC5kQixLIfQ41N-WCQlmdhdEahsRJUMf40p6sEOjxreqQ2F2j0icTqOBxcpfmBNe9R1nES7b45OiMFNfSI2lxToPV5ear6cD1J5O9A`,
              "Content-Type": "application/json"
            }
          }
        );
      }
  
      console.log("Users added successfully");
    } catch (error) {
      console.error("Error adding users:", error.response?.data);
    }
  };


router.put("/admin/configure-team", async (req, res) => {
    try {
      const { teamId, teamName, predefinedUsers } = req.body;
  
      if (!teamId || !teamName || !Array.isArray(predefinedUsers)) {
        return res.status(400).json({ message: "Invalid data format" });
      }
  
      // Update existing or create new config
      let teamConfig = await TeamConfig.findOne();
      if (!teamConfig) {
        teamConfig = new TeamConfig();
      }
  
      teamConfig.teamId = teamId;
      teamConfig.teamName = teamName;
      teamConfig.predefinedUsers = predefinedUsers;
  
      await teamConfig.save();
  
      res.status(200).json({ message: "Default team configuration updated successfully" });
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  
module.exports = router;
