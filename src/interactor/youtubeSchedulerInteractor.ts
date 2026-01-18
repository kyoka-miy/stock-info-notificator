import { injectable } from "tsyringe";
import { AbstractSchedulerInteractor } from "./abstractSchedulerInteractor";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONSTANTS } from "../constants";
import { google } from "googleapis";
import { SourceInfo } from "../dto/sourceInfo";

@injectable()
export class YoutubeSchedulerInteractor extends AbstractSchedulerInteractor {
  constructor() {
    super();
  }

  async getSourceInfos(): Promise<SourceInfo[]> {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY || "",
    });
    let latestVideos: SourceInfo[] = [];

    for (const { id } of CONSTANTS.YOUTUBE_CHANNELS) {
      const response = await youtube.search.list({
        part: ["snippet"],
        q: CONSTANTS.YOUTUBE_SEARCH_QUERY,
        channelId: id,
        maxResults: 5,
        order: "date",
        publishedAfter: new Date(
          new Date().getTime() - 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      const items = response.data?.items;
      if (!items) continue;
      for (const video of items) {
        const videoId = video.id?.videoId || "";
        if (await isShort(videoId)) continue;

        const videoDate = new Date(video.snippet?.publishedAt || "");
        latestVideos.push({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: videoDate.toISOString(),
          title: video.snippet?.title || "",
        });
      }
    }

    return latestVideos;
  }

  async generateMessageWithGemini(infos: SourceInfo[]): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const results: string[] = [];
    for (const info of infos) {
      const result = await model.generateContent([
        "この動画の中で桐谷さん本人がおすすめしている銘柄を、お勧めする理由、現在の株価、株主優待、配当利回りとともに教えてください。LINEメッセージとして送信するのでなるべく簡潔に、絵文字も使って一目で分かるように教えてください。",
        {
          fileData: {
            mimeType: "text/html",
            fileUri: info.url,
          },
        },
      ]);

      const publishedAtJST = new Date(info.publishedAt).toLocaleString(
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
        `【${info.title}】\n${info.url}\n公開日: ${publishedAtJST}\n\n${result.response.text()}`,
      );
    }
    return results;
  }
}

async function isShort(videoId: string): Promise<boolean> {
  const url = `https://www.youtube.com/shorts/${videoId}`;
  try {
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
