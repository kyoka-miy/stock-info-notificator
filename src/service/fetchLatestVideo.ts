import { google } from "googleapis";
import { CONSTANTS } from "../constants.ts";
import axios from "axios";

const youtube = google.youtube("v3");

export async function fetchLatestVideo(): Promise<string | null> {
  try {
    let latestVideo: string | null = null;
    let latestDate = new Date(0); // Initialize to the earliest possible date

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
      console.log(`Latest video URL: ${latestVideo}`);
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

export async function extractRecommendationsWithGemini(videoUrl: string): Promise<string> {
  try {
    const geminiResponse = await axios.post(
      "https://api.gemini.com/v1/analyze",
      {
        videoUrl: videoUrl,
        prompt: "この動画に桐谷広人さん本人は登場しますか？その場合、本人が動画内でおすすめしている銘柄を教えてください。登場しない場合は「本人登場なし」と答えてください",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
      }
    );

    return geminiResponse.data.result;
  } catch (error) {
    console.error("Error using Gemini API:", error);
    throw error;
  }
}
