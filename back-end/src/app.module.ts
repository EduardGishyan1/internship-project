import { Module } from "@nestjs/common";
import { FetchPriceData } from "./services/fetchPriceData";
import { PriceDataController } from "./controllers/fetchPriceData";
import { AiPredictorController } from "./controllers/aiPredictor";
import { AiPredictorService } from "./services/aiPredictor";
import { PrismaService } from "./services/prismaService";
import { ConfigModule } from "@nestjs/config";
import { CompanyService } from "./utils/getCompanies";
import { CompanyController } from "./controllers/companyList";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  providers: [
    FetchPriceData,
    PrismaService,
    AiPredictorService,
    CompanyService,
  ],
  controllers: [PriceDataController, AiPredictorController, CompanyController],
})
export class AppModule {}
