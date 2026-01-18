import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import "./src/config/container";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";
import { WebSchedulerInteractor } from "./src/interactor/webSchedulerInteractor";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.get("/", (_, res) => {
  res.send("OK");
});

app.post("/schedule", async (_, res) => {
  try {
    const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
    const webScheduler = container.resolve(WebSchedulerInteractor);
    youtubeScheduler.execute();
    webScheduler.execute();
    res.status(200).send("cron executed");
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
