export interface YoutubeSchedulerService {
  getUrls(): Promise<string[]>;
  extractInfoByGemini(urls: string[]): Promise<string[]>;
}
