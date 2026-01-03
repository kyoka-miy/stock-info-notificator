export interface YoutubeSchedulerService {
  getVideoInfos(): Promise<VideoInfo[]>;
  generateMessageWithGemini(urls: VideoInfo[]): Promise<string[]>;
}

export type VideoInfo = {
  url: string;
  publishedAt: string;
  title: string;
};
