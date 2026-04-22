import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", eventRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));