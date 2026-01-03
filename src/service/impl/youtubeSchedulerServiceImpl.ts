import { google } from "googleapis";
import { VideoInfo, YoutubeSchedulerService } from "../youtubeSchedulerService";
import path from "path";
import fs from "fs/promises";
import { CONSTANTS } from "../../constants";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TIMESTAMP_FILE = path.resolve(
  __dirname,
  "../../data/latestYoutubeTimestamp.json",
);

export class YoutubeSchedulerServiceImpl implements YoutubeSchedulerService {
  async getVideoInfos(): Promise<VideoInfo[]> {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY || "",
    });

    let latestVideos: VideoInfo[] = [];
    let lastSavedDate = await getSavedTimestamp();
    let currentLatestDate = lastSavedDate;

    for (const { id } of CONSTANTS.YOUTUBE_CHANNELS) {
      const response = await youtube.search.list({
        part: ["snippet"],
        q: CONSTANTS.YOUTUBE_SEARCH_QUERY,
        channelId: id,
        maxResults: 5,
        order: "date",
        publishedAfter: lastSavedDate.toISOString(),
      });

      const items = response.data?.items;
      if (!items) continue;
      for (const video of items) {
        const videoId = video.id?.videoId || "";
        // exclude shorts
        if (await isShort(videoId)) continue;

        const videoDate = new Date(video.snippet?.publishedAt || "");
        if (videoDate.getTime() > currentLatestDate.getTime()) {
          currentLatestDate = new Date(videoDate.getTime());
        }
        latestVideos.push({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: videoDate.toISOString(),
          title: video.snippet?.title || "",
        });
      }
    }

    if (lastSavedDate < currentLatestDate) {
      await saveTimestamp(currentLatestDate);
    }

    return latestVideos;
  }

  async generateMessageWithGemini(videoInfos: VideoInfo[]): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const results: string[] = [];
    for (const videoInfo of videoInfos) {
      const result = await model.generateContent([
        "この動画の中で桐谷さん本人がおすすめしている銘柄を、お勧めする理由、現在の株価、株主優待、配当利回りとともに教えてください。LINEメッセージとして送信するのでなるべく簡潔に、一目で分かるように教えてください。",
        {
          fileData: {
            mimeType: "text/html",
            fileUri: videoInfo.url,
          },
        },
      ]);

      const publishedAtJST = new Date(videoInfo.publishedAt).toLocaleString(
        "ja-JP",
        {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      results.push(
        `【${videoInfo.title}】\n${videoInfo.url}\n公開日: ${publishedAtJST}\n\n${result.response.text()}`,
      );
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

async function isShort(videoId: string): Promise<boolean> {
  const url = `https://www.youtube.com/shorts/${videoId}`;
  try {
    // follow redirect
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.url.includes("/shorts/")) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Failed to check if video is short:", error.message);
    return false;
  }
}
