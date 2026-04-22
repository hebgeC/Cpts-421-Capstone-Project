import express from "express";
import {
  fetchTrmEvent,
  fetchVolunteerShiftEvents,
  fetchVolunteerShiftEventById,
  fetchVolunteerShiftEventsByTimeRange,
  fetchVolunteerShiftEventsByPageTimeRange,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/trmEvent", fetchTrmEvent);
router.get("/volunteerShiftEvent", fetchVolunteerShiftEvents);
router.get("/volunteerShiftEvent/:eventID", fetchVolunteerShiftEventById);
router.get("/volunteerShiftEvent/:earliestTime/:latestTime", fetchVolunteerShiftEventsByTimeRange);
router.get("/volunteerShiftEvent/:page/:earliestTime/:latestTime", fetchVolunteerShiftEventsByPageTimeRange);

export default router;
