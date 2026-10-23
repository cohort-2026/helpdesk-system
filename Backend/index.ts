import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { testDbConnection } from "./src/config/database";
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/userRoutes";

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

const startServer = async () => {
  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
