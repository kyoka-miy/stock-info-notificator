import { container } from "tsyringe";
import { YoutubeSchedulerService } from "../service/youtubeSchedulerService";
import { TOKENS } from "./tokens";
import { YoutubeSchedulerServiceImpl } from "../service/impl/youtubeSchedulerServiceImpl";

container.register<YoutubeSchedulerService>(TOKENS.YoutubeSchedulerService, {
  useClass: YoutubeSchedulerServiceImpl,
});
