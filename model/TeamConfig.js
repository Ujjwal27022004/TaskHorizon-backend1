const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true }, // Default Team ID
  teamName: { type: String, required: true },
  predefinedUsers: [
    {
      userId: { type: String, required: true }, // User's Microsoft ID
      userEmail: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model("TeamConfig", teamSchema);
