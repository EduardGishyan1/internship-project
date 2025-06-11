import { Controller, Get, Param } from "@nestjs/common";
import { AiPredictorService } from "../services/aiPredictor";

@Controller("news")
export class AiPredictorController {
  constructor(private readonly aiPredictorService: AiPredictorService) {}

  @Get("predict/:symbol")
  async getPrediction(@Param("symbol") symbol: string) {
    return await this.aiPredictorService.predictStockMovement(symbol);
  }
}
