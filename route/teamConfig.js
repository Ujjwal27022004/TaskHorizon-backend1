const express = require("express");
const router = express.Router();
const TeamConfig = require("../model/TeamConfig");

// POST: Create or update team configuration
router.post("/team/config", async (req, res) => {
  try {
    const { teamId, teamName, predefinedUsers } = req.body;

    if (!teamId || !teamName || !predefinedUsers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if a config already exists
    let teamConfig = await TeamConfig.findOne();
    if (teamConfig) {
      // Update existing config
      teamConfig.teamId = teamId;
      teamConfig.teamName = teamName;
      teamConfig.predefinedUsers = predefinedUsers;
    } else {
      // Create new config
      teamConfig = new TeamConfig({ teamId, teamName, predefinedUsers });
    }

    await teamConfig.save();
    res.status(201).json({ message: "Team configuration saved successfully", teamConfig });
  } catch (error) {
    console.error("Error saving team config:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET: Retrieve the team configuration
router.get("/team/config", async (req, res) => {
  try {
    const teamConfig = await TeamConfig.findOne();
    if (!teamConfig) {
      return res.status(404).json({ message: "No team configuration found" });
    }

    res.status(200).json(teamConfig);
  } catch (error) {
    console.error("Error retrieving team config:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
