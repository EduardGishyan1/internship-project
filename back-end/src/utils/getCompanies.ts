import { PrismaService } from "../services/prismaService";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getAllCompanies() {
    return this.prisma.companyName.findMany();
  }

  async getAllSymbols() {
    const result = await this.prisma.companyName.findMany({
      select: {
        symbol: true,
      },
    });
    return result.map((company) => company.symbol);
  }
}
