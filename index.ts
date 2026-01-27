import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import { container } from "tsyringe";
import { YoutubeSchedulerInteractor } from "./src/interactor/youtubeSchedulerInteractor";
import { WebSchedulerInteractor } from "./src/interactor/webSchedulerInteractor";
import express, { Request, Response } from "express";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.post("/schedule", async (req: Request, res: Response) => {
  console.log("Received /schedule request");
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const youtubeScheduler = container.resolve(YoutubeSchedulerInteractor);
    const webScheduler = container.resolve(WebSchedulerInteractor);
    await youtubeScheduler.execute();
    await webScheduler.execute();
    res.status(200).send("cron executed");
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
