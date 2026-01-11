import { inject, injectable } from "tsyringe";
import { AbstractSchedulerInteractor } from "./abstractSchedulerInteractor";
import { TOKENS } from "../config/tokens";
import { WebSchedulerService } from "../service/WebSchedulerService";

@injectable()
export class WebSchedulerInteractor extends AbstractSchedulerInteractor {
  constructor(
    @inject(TOKENS.WebSchedulerService)
    protected webSchedulerService: WebSchedulerService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    const latestArticles = await this.webSchedulerService.getArticleUrls();
    console.log("Latest articles fetched:", latestArticles);

    const messages =
      await this.webSchedulerService.generateMessageWithGemini(latestArticles);
    console.log("Messages extracted:", messages);

    await this.sendLineMessages(messages);
  }
}
