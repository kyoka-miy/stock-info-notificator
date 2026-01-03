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
    const latestVideos = await this.youtubeSchedulerService.getVideoInfos();
    console.log("Latest videos fetched:", latestVideos);

    const messages =
      await this.youtubeSchedulerService.generateMessageWithGemini(
        latestVideos,
      );
    console.log("Messages extracted:", messages);

    await this.sendLineMessages(messages);
  }
}
