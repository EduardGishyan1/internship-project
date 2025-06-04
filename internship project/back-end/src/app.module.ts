import { Module } from "@nestjs/common";
import { FinnhubService } from "./services/getInfo";
import { FinnhubController } from "./controllers/getInfo";
import { PrismaService } from "./services/prismaService";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  providers: [FinnhubService, PrismaService],
  controllers: [FinnhubController],
})
export class AppModule {}
