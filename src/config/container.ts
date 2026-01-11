import { container } from "tsyringe";
import { YoutubeSchedulerService } from "../service/youtubeSchedulerService";
import { TOKENS } from "./tokens";
import { YoutubeSchedulerServiceImpl } from "../service/impl/youtubeSchedulerServiceImpl";
import { WebSchedulerService } from "../service/webSchedulerService";
import { WebSchedulerServiceImpl } from "../service/impl/webSchedulerServiceImpl";

container.register<YoutubeSchedulerService>(TOKENS.YoutubeSchedulerService, {
  useClass: YoutubeSchedulerServiceImpl,
});

container.register<WebSchedulerService>(TOKENS.WebSchedulerService, {
  useClass: WebSchedulerServiceImpl,
});
