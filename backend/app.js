import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import wpRoutes from "./routes/wpRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", eventRoutes);
app.use("/", wpRoutes);

export default app;
