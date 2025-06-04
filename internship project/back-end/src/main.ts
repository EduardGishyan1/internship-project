import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./services/prismaService";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma = app.get(PrismaService);
  await prisma.onModuleInit();

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.enableCors();

  await app.listen(port);
}

bootstrap();
