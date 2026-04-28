import axios from "axios";

const VH_BASE = "https://rescue-mission.volunteerhub.com";
const PAGE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let userCache = null;

const getAuthHeader = () => {
  const key = process.env.VOLUNTEERHUB_API_KEY;
  if (!key) throw new Error("Missing VOLUNTEERHUB_API_KEY");
  return key;
};

const fetchAllUsers = async () => {
  if (userCache && Date.now() - userCache.timestamp < CACHE_TTL_MS) {
    return userCache.users;
  }

  let page = 1;
  let allUsers = [];
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(
      `${VH_BASE}/api/v2/users?query=LastUpdate&page=${page}&pageSize=${PAGE_SIZE}`,
      { headers: { Authorization: getAuthHeader() } }
    );
    const batch = response.data;
    allUsers = allUsers.concat(batch);
    hasMore = batch.length === PAGE_SIZE;
    page++;
  }

  userCache = { timestamp: Date.now(), users: allUsers };
  return allUsers;
};

const lookupUser = async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "username query parameter is required" });
  }

  try {
    const users = await fetchAllUsers();
    const normalised = username.toLowerCase().trim();
    const match = users.find(
      (u) => u.Username?.toLowerCase() === normalised
    );

    if (!match) {
      return res.status(404).json({ error: "No VolunteerHub account found for that email" });
    }

    res.json(match);
  } catch (err) {
    console.error("lookupUser error:", err.message);
    res.status(500).json({ error: "Failed to look up user" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const response = await axios.get(`${VH_BASE}/api/v2/users/${id}`, {
      headers: { Authorization: getAuthHeader() },
    });
    res.json(response.data);
  } catch (err) {
    console.error("getUserById error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export { lookupUser, getUserById };
