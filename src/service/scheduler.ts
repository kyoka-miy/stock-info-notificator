import { ExtractInfoService } from "./extractInfoService";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../config/tokens";

@injectable()
export class Scheduler {
  constructor(
    @inject(TOKENS.ExtractInfoService)
    private extractInfoService: ExtractInfoService,
  ) {}

  async scheduleTask() {
    const latestVideoUrls = await this.extractInfoService.getUrls();
    console.log("Latest video URLs fetched:", latestVideoUrls);
    const recommendations =
      await this.extractInfoService.extractInfoByGemini(latestVideoUrls);
    console.log("Recommendations extracted:", recommendations);
  }
}

// cron.schedule("0 9 * * *", async () => {
//   console.log("Scheduled task started at:", new Date().toISOString());
//   const scheduler = container.resolve(Scheduler);
//   await scheduler.scheduleTask();
// });
