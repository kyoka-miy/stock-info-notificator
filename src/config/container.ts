import { container } from "tsyringe";
import { ExtractInfoService } from "../service/extractInfoService";
import { TOKENS } from "./tokens";
import { ExtractFromYoutube } from "../service/impl/extractFromYoutube";

container.register<ExtractInfoService>(TOKENS.ExtractInfoService, {
  useClass: ExtractFromYoutube,
});
