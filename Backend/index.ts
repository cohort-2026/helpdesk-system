/// <reference path="./src/types/express.d.ts" />
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { testDbConnection } from "./src/config/database";
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/userRoutes";
import ticketRoutes from "./src/routes/ticketRoutes";
import departmentRoutes from "./src/routes/departmentRoutes";
import commentRoutes from "./src/routes/commentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors({origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Helpdesk System API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/departments", departmentRoutes);

const startServer = async () => {
  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// On Vercel the app runs as a serverless function, so it must be exported
// instead of listening on a port.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
