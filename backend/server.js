import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { VolunteerHubApiKey } from "./apiKeys.js";

dotenv.config();

const app = express();
app.use(cors());

app.get("/events", async (req, res) => {
  try {
    const response = await fetch("https://api.volunteerhub.com/v1/events", {
      headers: {
        Authorization: `Bearer ${VolunteerHubApiKey}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));