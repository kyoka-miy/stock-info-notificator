import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import cron from "node-cron";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";
import http from "http";
import { WebSchedulerInteractor } from "./src/interactor/webSchedulerInteractor";

const PORT = Number(process.env.PORT || 3000);

// health check server for Render
http
  .createServer((_, res) => {
    res.writeHead(200);
    res.end("OK");
  })
  .listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
  });

cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("Scheduled task started:", new Date().toISOString());
    const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
    await youtubeScheduler.execute();
    console.log("Scheduled task finished:", new Date().toISOString());
  },
  {
    timezone: "Asia/Tokyo",
  }
);

cron.schedule("0 * * * *", () => {
  console.log("cron alive:", new Date().toISOString());
});

// const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
// const webScheduler = container.resolve(WebSchedulerInteractor);
// youtubeScheduler.execute();
// webScheduler.execute();
