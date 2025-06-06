import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { FinnhubService, QuoteResponse } from "../services/getInfo";

@Controller("finnhub")
export class FinnhubController {
  constructor(private readonly finnhubService: FinnhubService) {}

  @Get("quotes")
  async getQuotes(): Promise<QuoteResponse[]> {
    try {
      return await this.finnhubService.getQuotesForValidCompanies();
    } catch {
      throw new HttpException("Failed to fetch quotes", HttpStatus.BAD_REQUEST);
    }
  }
}
