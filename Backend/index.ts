import express from "express";
import dotenv from "dotenv";
import { testDbConnection } from "./src/config/database";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Helpdesk System API is running");
});

const startServer = async () => {
  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
