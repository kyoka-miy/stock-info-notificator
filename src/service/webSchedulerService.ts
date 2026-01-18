import { SourceInfo } from "./youtubeSchedulerService";

export interface WebSchedulerService {
  getSourceInfos(): Promise<SourceInfo[]>;
  generateMessageWithGemini(infos: SourceInfo[]): Promise<string[]>;
}
