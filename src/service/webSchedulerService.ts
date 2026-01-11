export interface WebSchedulerService {
  getArticleUrls(): Promise<string[]>;
  generateMessageWithGemini(urls: string[]): Promise<string[]>;
}
