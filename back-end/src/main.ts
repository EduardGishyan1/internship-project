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
  const FRONT_END_URI = process.env.FRONT_END_URI;

  app.enableCors({
    origin: FRONT_END_URI,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  await app.listen(port);
}

bootstrap();
