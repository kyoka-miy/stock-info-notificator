export interface YoutubeSchedulerService {
  getVideoInfos(): Promise<VideoInfo[]>;
  generateMessageWithGemini(videoInfos: VideoInfo[]): Promise<string[]>;
}

export type VideoInfo = {
  url: string;
  publishedAt: string;
  title: string;
};
