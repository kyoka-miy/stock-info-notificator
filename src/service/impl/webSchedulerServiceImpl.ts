import path from "path";
import fs from "fs/promises";
import { CONSTANTS } from "../../constants";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { WebSchedulerService } from "../webSchedulerService";

const TIMESTAMP_FILE = path.resolve(
  __dirname,
  "../../data/latestYoutubeTimestamp.json",
);
const SERP_API_KEY = process.env.SERP_API_KEY;

export class WebSchedulerServiceImpl implements WebSchedulerService {
  async getArticleUrls(): Promise<string[]> {
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: CONSTANTS.WEB_SEARCH_QUERY,
        hl: "ja",
        gl: "jp",
        api_key: SERP_API_KEY,
      },
    });
    console.log("SERP API response:", res.data);
    return res.data.organic_results?.map((item: any) => item.link) ?? [];
  }

  async generateMessageWithGemini(urls: string[]): Promise<string[]> {
    return [];
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // const results: string[] = [];
    // for (const url of urls) {
    //   const result = await model.generateContent([
    //     "この記事の中で桐谷さん本人がおすすめしている銘柄を、お勧めする理由、現在の株価、株主優待、配当利回りとともに教えてください。LINEメッセージとして送信するのでなるべく簡潔に、絵文字も使って一目で分かるように教えてください。",
    //     {
    //       fileData: {
    //         mimeType: "text/html",
    //         fileUri: url,
    //       },
    //     },
    //   ]);

    //   const publishedAtJST = new Date(videoInfo.publishedAt).toLocaleString(
    //     "ja-JP",
    //     {
    //       timeZone: "Asia/Tokyo",
    //       year: "numeric",
    //       month: "2-digit",
    //       day: "2-digit",
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     }
    //   );

    //   results.push(
    //     `【${videoInfo.title}】\n${videoInfo.url}\n公開日: ${publishedAtJST}\n\n${result.response.text()}`
    //   );
    // }
    // return results;
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
