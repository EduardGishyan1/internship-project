import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";
import OpenAI from "openai";

@Injectable()
export class NewsService {
  private readonly finnhubKey = process.env.API_KEY;
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async getTodayNews(symbol: string): Promise<any[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        "https://finnhub.io/api/v1/company-news",
        {
          params: {
            symbol,
            from: today,
            to: today,
            token: this.finnhubKey,
          },
        },
      );
      return response.data;
    } catch {
      throw new HttpException(
        "Failed to fetch news from Finnhub",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async predictStockMovement(symbol: string): Promise<string> {
    const prompt =
      `Predict the effect on a company's stock based on the news below.
Your response must have exactly 4 lines.
Do not mention the news or its content in any way. Only give your final conclusion.`.trim();

    const newsItems = await this.getTodayNews(symbol);

    if (!newsItems.length) {
      return "No news found for prediction.";
    }

    const newsText = newsItems
      .map(
        (item, index) =>
          `News ${index + 1}:\nHeadline: ${item.headline}\nSummary: ${item.summary}\n`,
      )
      .join("\n");

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-1106-preview",

        messages: [
          {
            role: "system",
            content: newsText,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      });

      return (
        completion.choices[0]?.message?.content?.trim() ||
        "No prediction returned."
      );
    } catch {
      throw new HttpException(
        "Failed to get prediction from OpenAI",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
