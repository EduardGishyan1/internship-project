import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { fetchNews } from "../utils/newsFetcher";
import OpenAI from "openai";
import { encoding_for_model } from "@dqbd/tiktoken";

@Injectable()
export class AiPredictorService {
  private readonly finnhubKey = process.env.API_KEY;
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly enc = encoding_for_model("gpt-4");


  async predictStockMovement(
    symbol: string,
  ): Promise<{ growth: boolean; prediction: string }> {
    const newsItems = await fetchNews(symbol, this.finnhubKey);
    const newsText = newsItems?.length
      ? newsItems.map((item, i) => `Summary: ${item.summary}\n`).join("\n")
      : "No news available. Please generate information.";

    console.log(newsText);

    const systemInstruction = `
    You are a helpful assistant predicting stock movement.
     Please respond with a JSON object with keys:
    - growth: true or false
    - prediction: a 4-line string summary
     Do not mention the news explicitly. Only give your final conclusion.`;

    try {
      console.log("AI is generating");
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: newsText },
        ],
        temperature: 0.4,
      });

      const tokens = this.enc.encode(newsText);

      console.log(tokens)

      const raw = completion.choices[0]?.message?.content ?? "";
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const data = JSON.parse(cleaned);
      return data;
    } catch(error) {
      console.log(error);
      throw new HttpException(
        "Failed to get prediction from OpenAI",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
