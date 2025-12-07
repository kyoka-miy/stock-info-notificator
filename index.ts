import * as dotenv from "dotenv";
import {
  extractRecommendationsWithGemini,
  fetchLatestVideo,
} from "./src/service/fetchLatestVideo.ts";

dotenv.config();

const url = await fetchLatestVideo();
console.log(`Fetched URL: ${url}`);
const content = await extractRecommendationsWithGemini(url);
console.log(`Fetched Content: ${content}`);