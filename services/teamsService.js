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
            Authorization: `Bearer YOUR_MICROSOFT_ACCESS_TOKEN`,
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
              Authorization: `Bearer YOUR_MICROSOFT_ACCESS_TOKEN`,
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
  
  