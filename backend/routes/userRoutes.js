import express from "express";
import { lookupUser, getUserById } from "../controllers/userController.js";

const router = express.Router();

// GET /auth/lookup?username=user@example.com
// Finds a VH user by their username (email) via the admin API
router.get("/auth/lookup", lookupUser);

// GET /users/:id
// Returns a specific VH user's full profile by their UserUid
router.get("/users/:id", getUserById);

export default router;
