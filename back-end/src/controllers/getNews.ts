import { Controller, Get, Param } from "@nestjs/common";
import { NewsService } from "../services/getNews";

@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get("predict/:symbol")
  async getPrediction(@Param("symbol") symbol: string) {
    return await this.newsService.predictStockMovement(symbol);
  }
}
