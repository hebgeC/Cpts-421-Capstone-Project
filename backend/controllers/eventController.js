import axios from "axios";

const getVolunteerHubApiKey = () => {
  const key = process.env.VOLUNTEERHUB_API_KEY;
  if (!key) {
    throw new Error("Missing VOLUNTEERHUB_API_KEY");
  }
  return key;
};

const fetchTrmEvent = async (req, res) => {
  try {
    const response = await axios.get("https://www.trm.org/events/list/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      },
    });

    res.json({ html: response.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

const fetchVolunteerShiftEvents = async (req, res) => {
  try {
    const response = await axios.get(
      "https://rescue-mission.volunteerhub.com/api/v1/events?query=Version&page=1&pageSize=20&earliestVersion=0",
      {
        headers: {
          Authorization: getVolunteerHubApiKey(),
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

const fetchVolunteerShiftEventById = async (req, res) => {
  try {
    const response = await axios.get(
      `https://rescue-mission.volunteerhub.com/api/v1/events/${req.params.eventID}`,
      {
        headers: {
          Authorization: getVolunteerHubApiKey(),
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

const fetchVolunteerShiftEventsByTimeRange = async (req, res) => {
  try {
    const earliestTime = req.params.earliestTime.replaceAll(":", "%3A");
    const latestTime = req.params.latestTime.replaceAll(":", "%3A");

    const response = await axios.get(
      `https://rescue-mission.volunteerhub.com/api/v1/events?query=Time&pageSize=50&earliestTime=${earliestTime}&latestTime=${latestTime}`,
      {
        headers: {
          Authorization: getVolunteerHubApiKey(),
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

const fetchVolunteerShiftEventsByPageTimeRange = async (req, res) => {
  try {
    const earliestTime = req.params.earliestTime.replaceAll(":", "%3A");
    const latestTime = req.params.latestTime.replaceAll(":", "%3A");
    const page = req.params.page;

    const response = await axios.get(
      `https://rescue-mission.volunteerhub.com/api/v1/events?query=Time&page=${page}&pageSize=50&earliestTime=${earliestTime}&latestTime=${latestTime}`,
      {
        headers: {
          Authorization: getVolunteerHubApiKey(),
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export {
  fetchTrmEvent,
  fetchVolunteerShiftEvents,
  fetchVolunteerShiftEventById,
  fetchVolunteerShiftEventsByTimeRange,
  fetchVolunteerShiftEventsByPageTimeRange,
};
