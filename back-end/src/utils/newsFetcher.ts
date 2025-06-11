import { HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

export async function fetchNews(symbol: string,api_key): Promise<any[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get("https://finnhub.io/api/v1/company-news", {
      params: {
        symbol,
        from: today,
        to: today,
        token: api_key,
      },
    });
    return response.data;
  } catch {
    throw new HttpException(
      "Failed to fetch news from Finnhub",
      HttpStatus.BAD_GATEWAY,
    );
  }
}
