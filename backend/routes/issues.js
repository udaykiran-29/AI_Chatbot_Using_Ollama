const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your MySQL connection

// Route to save issue details
router.post("/report-issue", async (req, res) => {
  try {
    const { username, email, issueType, description } = req.body;

    if (!username || !email || !issueType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const query = "INSERT INTO issues (username, email, issue_type, description) VALUES (?, ?, ?, ?)";
    await db.query(query, [username, email, issueType, description]);

    res.json({ success: true, message: "Issue reported successfully" });
  } catch (error) {
    console.error("Error reporting issue:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
