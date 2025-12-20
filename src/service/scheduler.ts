import { ExtractInfoService } from "./extractInfoService";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../config/tokens";
import { Client, ClientConfig } from "@line/bot-sdk";

const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const lineClient = new Client(lineConfig);

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

    // Send results to LINE
    const message: { type: "text"; text: string } = {
      type: "text",
      text: `Latest Recommendations:\n${recommendations.join("\n")}`,
    };

    try {
      await lineClient.pushMessage(process.env.LINE_USER_ID || "", message);
    } catch (error) {
      console.error("Failed to send notification to LINE:", error);
    }
  }
}
