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

    // const latestVideos = [
    //   {
    //     url: "https://www.youtube.com/watch?v=5lpIqvgfT1U",
    //     publishedAt: "2025-12-31T23:59:59.000Z",
    //     title:
    //       "株主優待名人・桐谷さんが厳選「2026年に注目の10銘柄」（桐谷 広人）【楽天証券 トウシル】",
    //   },
    // ];
    const messages =
      await this.youtubeSchedulerService.generateMessageWithGemini(
        latestVideos,
      );
    console.log("Messages extracted:", messages);

    await this.sendLineMessages(messages);
  }
}
