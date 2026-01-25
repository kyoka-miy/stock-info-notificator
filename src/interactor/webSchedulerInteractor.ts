import { injectable } from "tsyringe";
import { AbstractSchedulerInteractor } from "./abstractSchedulerInteractor";
import axios from "axios";
import { CONSTANTS } from "../constants";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SourceInfo } from "../dto/sourceInfo";

const SERP_API_KEY = process.env.SERP_API_KEY;

@injectable()
export class WebSchedulerInteractor extends AbstractSchedulerInteractor {
  constructor() {
    super();
  }

  async getSourceInfos(): Promise<SourceInfo[]> {
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: CONSTANTS.WEB_SEARCH_QUERY,
        hl: "ja",
        gl: "jp",
        tbs: "qdr:d",
        api_key: SERP_API_KEY,
      },
    });

    return (
      res.data.organic_results
        ?.filter(
          (item: any) =>
            !CONSTANTS.EXCLUDE_URL_KEYWORDS.some((keyword) =>
              item.link.includes(keyword),
            ),
        )
        .map((item: any) => {
          return {
            url: item.link,
            publishedAt: item.date,
            title: item.title,
          };
        }) ?? []
    );
  }

  async generateMessageWithGemini(infos: SourceInfo[]): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const results: string[] = [];
    for (const info of infos) {
      const result = await model.generateContent([
        "この記事の中で桐谷さん本人がおすすめしている銘柄を、お勧めする理由、現在の株価、株主優待、配当利回りとともに教えてください。LINEメッセージとして送信するのでなるべく簡潔に、絵文字も使って一目で分かるように教えてください。",
        {
          fileData: {
            mimeType: "text/html",
            fileUri: info.url,
          },
        },
      ]);

      results.push(
        `【${info.title}】\n${info.url}\n公開日: ${info.publishedAt}\n\n${result.response.text()}`,
      );
    }
    return results;
  }
}
