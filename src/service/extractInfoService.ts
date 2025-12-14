export interface ExtractInfoService {
  getUrls(): Promise<string[]>;
  extractInfoByGemini(urls: string[]): Promise<string[]>;
}
