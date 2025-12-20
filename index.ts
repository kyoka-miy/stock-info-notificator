import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import cron from "node-cron";
import { Scheduler } from "./src/service/scheduler";
import { container } from "tsyringe";

console.log("Application started. Scheduler is running...");

const scheduler = container.resolve(Scheduler);
// scheduler.scheduleTask();
cron.schedule("0 9 * * *", async () => {
  console.log("Scheduled task started at:", new Date().toISOString());
  await scheduler.scheduleTask();
  console.log("Scheduled task completed at:", new Date().toISOString());
});
