import { google } from "googleapis";
import { CONSTANTS } from "../constants.ts";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function fetchLatestVideo(): Promise<string | null> {
  try {
    let latestVideo: string | null = null;
    let latestDate = new Date(0);

    for (const channelId of CONSTANTS.YOUTUBE_CHANNEL_IDS) {
      const response = await youtube.search.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet"],
        q: CONSTANTS.YOUTUBE_SEARCH_QUERY,
        channelId: channelId,
        maxResults: 10,
        order: "date",
      });

      const items = response.data.items;
      if (items && items.length > 0) {
        const video = items[0];
        const videoDate = new Date(video.snippet?.publishedAt || "");

        if (videoDate > latestDate) {
          latestDate = videoDate;
          latestVideo = `https://www.youtube.com/watch?v=${video.id?.videoId}`;
        }
      }
    }

    if (latestVideo) {
      return latestVideo;
    } else {
      console.log("No videos found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
}

const ai = new GoogleGenAI({});

export async function extractRecommendationsWithGemini(
  videoUrl: string | null
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      "まずこの動画のタイトルと簡単な内容を教えてください。この動画に桐谷広人さん本人は登場しますか？その場合、本人が動画内でおすすめしている銘柄を、その理由、株主優待、配当利回りとともに全て教えてください。",
      {
        fileData: {
          mimeType: "text/html",
          fileUri: videoUrl || "",
        },
      },
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Error using Gemini API:", error.response?.data || error);
    throw error;
  }
}
