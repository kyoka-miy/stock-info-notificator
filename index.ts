import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import express from "express";
import cron from "node-cron";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";

const app = express();

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
// youtubeScheduler.execute();
cron.schedule("0 9 * * *", async () => {
  console.log("Scheduled task started at:", new Date().toISOString());
  await youtubeScheduler.execute();
  console.log("Scheduled task completed at:", new Date().toISOString());
});
