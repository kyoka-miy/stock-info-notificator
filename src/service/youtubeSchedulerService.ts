export interface YoutubeSchedulerService {
  getVideoInfos(): Promise<SourceInfo[]>;
  generateMessageWithGemini(infos: SourceInfo[]): Promise<string[]>;
}

export type SourceInfo = {
  url: string;
  publishedAt: string;
  title: string;
};
