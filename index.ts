import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import cron from "node-cron";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";

console.log("Cron service started:", new Date().toISOString());

cron.schedule("0 9 * * *", async () => {
  console.log("Scheduled task started:", new Date().toISOString());

  const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
  await youtubeScheduler.execute();

  console.log("Scheduled task finished:", new Date().toISOString());
});
