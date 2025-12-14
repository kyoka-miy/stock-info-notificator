import { google } from "googleapis";
import { ExtractInfoService } from "../extractInfoService";
import path from "path";
import fs from "fs/promises";
import { CONSTANTS } from "../../constants";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TIMESTAMP_FILE = path.resolve(
  __dirname,
  "../../data/latestYoutubeTimestamp.json",
);

export class ExtractFromYoutube implements ExtractInfoService {
  async getUrls(): Promise<string[]> {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY || "",
    });

    let latestVideos: string[] = [];
    let lastSavedDate = await getSavedTimestamp();
    let latestDate = lastSavedDate;

    for (const channelId of CONSTANTS.YOUTUBE_CHANNEL_IDS) {
      const response = await youtube.search.list({
        part: ["snippet"],
        q: CONSTANTS.YOUTUBE_SEARCH_QUERY,
        channelId: channelId,
        maxResults: 2,
        order: "date",
      });

      const items = response.data?.items;
      if (!items || items.length == 0) continue;
      for (const video of items) {
        const videoDate = new Date(video.snippet?.publishedAt || "");
        if (videoDate <= lastSavedDate) break;
        latestVideos.push(
          `https://www.youtube.com/watch?v=${video.id?.videoId}`,
        );

        if (videoDate.getTime() > latestDate.getTime()) {
          latestDate = new Date(videoDate.getTime());
        }
      }
    }

    if (lastSavedDate < latestDate) {
      await saveTimestamp(latestDate);
    }

    return latestVideos;
  }

  async extractInfoByGemini(urls: string[]): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const results: string[] = [];
    for (const url of urls) {
      const result = await model.generateContent([
        "まずこの動画のタイトルと簡単な内容を教えてください。この動画に桐谷広人さん本人は登場しますか？その場合、本人が動画内でおすすめしている銘柄を、その理由、現在の株価、株主優待、配当利回りとともに全て教えてください。",
        {
          fileData: {
            mimeType: "text/html",
            fileUri: url,
          },
        },
      ]);
      results.push(result.response.text());
    }
    return results;
  }
}

async function getSavedTimestamp(): Promise<Date> {
  const data = await fs.readFile(TIMESTAMP_FILE, "utf-8");
  return new Date(JSON.parse(data).latestTimestamp);
}

async function saveTimestamp(timestamp: Date): Promise<void> {
  const data = { latestTimestamp: timestamp.toISOString() };
  await fs.writeFile(TIMESTAMP_FILE, JSON.stringify(data, null, 2));
}
