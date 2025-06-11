import { Controller, Get } from "@nestjs/common";
import { CompanyService } from "../utils/getCompanies";

@Controller("companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get("map")
  async getCompanyMap() {
    function arrayToMap(arr: { symbol: string; fullName: string }[]) {
      return arr.reduce(
        (acc, item) => {
          acc[item.symbol] = item.fullName;
          return acc;
        },
        {} as Record<string, string>);
        }

        const companies = await this.companyService.getAllCompanies();
        return arrayToMap(companies);
    }
}