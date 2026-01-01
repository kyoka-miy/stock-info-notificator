import { messagingApi } from "@line/bot-sdk";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export abstract class AbstractSchedulerInteractor {
  abstract execute(): Promise<void>;

  async sendLineMessages(messages: string[]): Promise<void> {
    const lineMessages: messagingApi.Message[] = messages.map((message) => ({
      type: "text",
      text: message,
    }));

    try {
      await lineClient.pushMessage({
        to: process.env.LINE_USER_ID || "",
        messages: lineMessages,
      });
    } catch (error) {
      console.error("Failed to send notification to LINE:", error);
    }
  }
}
