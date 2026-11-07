import axios from "axios";
import { decodeEntities } from "../utils/textUtils.js";

const TRIBE_EVENTS_URL = "https://www.trm.org/wp-json/tribe/events/v1/events";

const getVolunteerHubApiKey = () => {
  const key = process.env.VOLUNTEERHUB_API_KEY;
  if (!key) {
    throw new Error("Missing VOLUNTEERHUB_API_KEY");
  }
  return key;
};

function mapTribeEvent(e) {
  const venue = e.venue?.venue || "";
  const address = [e.venue?.address, e.venue?.city, e.venue?.state, e.venue?.zip]
    .filter(Boolean)
    .join(", ");

  return {
    id: e.id,
    title: decodeEntities(e.title),
    description: decodeEntities(e.description),
    url: e.url,
    image: e.image?.url || null,
    startDate: e.start_date,
    endDate: e.end_date,
    allDay: Boolean(e.all_day),
    venue,
    address,
    cost: e.cost || null,
  };
}

const fetchTrmEvents = async (req, res) => {
  try {
    const { page = 1, per_page = 20, start_date, end_date } = req.query;
    const response = await axios.get(TRIBE_EVENTS_URL, {
      params: { page, per_page, start_date, end_date },
    });

    res.json({
      events: (response.data.events || []).map(mapTribeEvent),
      total: response.data.total,
      totalPages: response.data.total_pages,
    });
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
  fetchTrmEvents,
  fetchVolunteerShiftEvents,
  fetchVolunteerShiftEventById,
  fetchVolunteerShiftEventsByTimeRange,
  fetchVolunteerShiftEventsByPageTimeRange,
};
