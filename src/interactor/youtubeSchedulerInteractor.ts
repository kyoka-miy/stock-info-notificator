import { inject, injectable } from "tsyringe";
import { AbstractSchedulerInteractor } from "./abstractSchedulerInteractor";
import { TOKENS } from "../config/tokens";
import { YoutubeSchedulerService } from "../service/youtubeSchedulerService";

@injectable()
export class YoutubeSchedulerInteractor extends AbstractSchedulerInteractor {
  constructor(
    @inject(TOKENS.YoutubeSchedulerService)
    protected youtubeSchedulerService: YoutubeSchedulerService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    const latestVideoUrls = await this.youtubeSchedulerService.getUrls();
    console.log("Latest video URLs fetched:", latestVideoUrls);

    const messages =
      await this.youtubeSchedulerService.extractInfoByGemini(latestVideoUrls);
    console.log("Recommendations extracted:", messages);

    await this.sendLineMessages(messages);
  }
}
