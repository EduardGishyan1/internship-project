import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { FetchPriceData, QuoteResponse } from "../services/fetchPriceData";

@Controller("finnhub")
export class PriceDataController {
  constructor(private readonly fetchPriceData: FetchPriceData) {}

  @Get("quotes")
  async getQuotes(): Promise<QuoteResponse[]> {
    try {
      return await this.fetchPriceData.getQuotesForValidCompanies();
    } catch {
      throw new HttpException("Failed to fetch quotes", HttpStatus.BAD_REQUEST);
    }
  }
}
