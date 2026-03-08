import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const VolunteerHubApiKey = process.env.VOLUNTEERHUB_API_KEY;
const app = express(); // think of app as an express object
app.use(cors());

// req --> what the client sent
// res --> what im sending back to the client
// here, we are telling express what to do when it recieves a GET request for "/events"
app.get("/events", async (req, res) => {
  try {
    const response = await fetch("https://rescue-mission.volunteerhub.com/api/v1/events?query=Version&page=1&pageSize=20&earliestVersion=0", 
    {
      headers: {
        Authorization: VolunteerHubApiKey,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));