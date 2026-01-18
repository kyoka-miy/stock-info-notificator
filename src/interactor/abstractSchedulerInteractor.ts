import { messagingApi } from "@line/bot-sdk";
import { SourceInfo } from "../dto/sourceInfo";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});
const MAX_NUMBER_OF_MESSAGES = 5;

export abstract class AbstractSchedulerInteractor {
  abstract getSourceInfos(): Promise<SourceInfo[]>;

  abstract generateMessageWithGemini(infos: SourceInfo[]): Promise<string[]>;

  async execute(): Promise<void> {
    const latestInfos = await this.getSourceInfos();
    console.log("Latest sources fetched:", latestInfos);

    const messages = await this.generateMessageWithGemini(latestInfos);
    console.log("Messages extracted:", messages);

    await this.sendLineMessages(messages);
  }

  async sendLineMessages(messages: string[]): Promise<void> {
    if (messages.length === 0) {
      console.log("No messages to send.");
      return;
    }
    for (let i = 0; i < messages.length; i += MAX_NUMBER_OF_MESSAGES) {
      const chunk: messagingApi.Message[] = messages
        .slice(i, i + MAX_NUMBER_OF_MESSAGES)
        .map((message) => ({
          type: "text",
          text: message,
        }));
      try {
        await lineClient.pushMessage({
          to: process.env.LINE_USER_ID || "",
          messages: chunk,
        });
      } catch (error) {
        console.error("Failed to send notification to LINE:", error);
      }
    }
  }
}
