import { Module } from "@nestjs/common";
import { FinnhubService } from "./services/getInfo";
import { FinnhubController } from "./controllers/getInfo";
import { NewsController } from "./controllers/getNews";
import { NewsService } from "./services/getNews";
import { PrismaService } from "./services/prismaService";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  providers: [FinnhubService, PrismaService, NewsService],
  controllers: [FinnhubController, NewsController],
})
export class AppModule {}
