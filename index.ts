import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import cron from "node-cron";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";

console.log("Application started. Scheduler is running...");

const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
youtubeScheduler.execute();
cron.schedule("0 9 * * *", async () => {
  console.log("Scheduled task started at:", new Date().toISOString());
  await youtubeScheduler.execute();
  console.log("Scheduled task completed at:", new Date().toISOString());
});
