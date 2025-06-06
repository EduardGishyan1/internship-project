"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prismaService_1 = require("./services/prismaService");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const prisma = app.get(prismaService_1.PrismaService);
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
//# sourceMappingURL=main.js.map