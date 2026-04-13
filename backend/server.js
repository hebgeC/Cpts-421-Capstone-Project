import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const VolunteerHubApiKey = process.env.VOLUNTEERHUB_API_KEY;
const app = express();
app.use(cors());

// req --> what the client sent
// res --> what im sending back to the client
// here, we are telling express what to do when it recieves a GET request for "/events"
app.get("/volunteerShiftEvent", async (req, res) => {
  try 
  {
    const response = await axios.get(
      "https://rescue-mission.volunteerhub.com/api/v1/events?query=Version&page=1&pageSize=20&earliestVersion=0",
      {
        headers: {
          Authorization: VolunteerHubApiKey
        },
      }
    );

    res.json(response.data);
  } 
  catch (err) 
  {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/volunteerShiftEvent/:eventID", async (req, res) => {
  try 
  {
    console.log(req.params.eventID);
    const response = await axios.get(
      "https://rescue-mission.volunteerhub.com/api/v1/events/" + req.params.eventID,
      // f08253b6-9bb8-47be-92b8-1bcac38a3bfa
      {
        headers: {
          Authorization: VolunteerHubApiKey,
        },
      }
    );

    res.json(response.data);
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/volunteerShiftEvent/:earliestTime/:latestTime", async (req, res) => {

  try {
    const earliestTime = req.params.earliestTime.replaceAll(":", "%3A");
    const latestTime = req.params.latestTime.replaceAll(":", "%3A");

    const response = await axios.get(
      `https://rescue-mission.volunteerhub.com/api/v1/events?query=Time&pageSize=50&earliestTime=${earliestTime}&latestTime=${latestTime}`,
      {
        headers: {
          Authorization: VolunteerHubApiKey,
        },
      }
    );

    res.json(response.data);
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }

});

app.get("/volunteerShiftEvent/:page/:earliestTime/:latestTime", async (req, res) => {

  try {
    const earliestTime = req.params.earliestTime.replaceAll(":", "%3A");
    const latestTime = req.params.latestTime.replaceAll(":", "%3A");
    const page = req.params.page;

    const response = await axios.get(
      `https://rescue-mission.volunteerhub.com/api/v1/events?query=Time&page=${page}&pageSize=50&earliestTime=${earliestTime}&latestTime=${latestTime}`,
      {
        headers: {
          Authorization: VolunteerHubApiKey,
        },
      }
    );

    res.json(response.data);
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }

});

app.listen(3000, () => console.log("Server running on port 3000"));