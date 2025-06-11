import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "./prismaService";
import * as dotenv from "dotenv";
import * as process from "node:process";
import {
  normalizeToDayTimestamp,
  getYesterdayTimestamp,
} from "../utils/dateUtils";
import { CompanyService } from "../utils/getCompanies";

dotenv.config();

export interface QuoteResponse {
  symbol: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  timestamp: number;
  priceDifference?: number;
  logo?: string;
}

@Injectable()
export class FetchPriceData {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  private readonly apiKey = process.env.API_KEY;
  private readonly logoApiKey = process.env.LOGO_API_KEY;

  async getSymbols(): Promise<string[]> {
    return this.companyService.getAllSymbols();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getCompanyLogo(symbol: string): Promise<string | null> {
    try {
      const response = await axios.get(
        "https://finnhub.io/api/v1/stock/profile2",
        {
          params: {
            symbol,
            token: this.logoApiKey,
          },
        },
      );

      const data = response.data;

      if (data && data.logo) {
        return data.logo;
      }

      return null;
    } catch {
      return null;
    }
  }

  async getQuotesForValidCompanies(): Promise<QuoteResponse[]> {
    if (!this.apiKey) {
      throw new HttpException(
        "API key not set",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const validQuotes: QuoteResponse[] = [];
    const yesterdayTimestamp = getYesterdayTimestamp();

    const MAX_REQUESTS = process.env.MAX_REQUESTS
      ? parseInt(process.env.MAX_REQUESTS, 10)
      : 60;
    const symbols = await this.getSymbols();

    while (validQuotes.length < MAX_REQUESTS) {
      const remainingSymbols = symbols.filter(
        (symbol) => !validQuotes.some((q) => q.symbol === symbol),
      );

      const quotePromises = remainingSymbols.map(async (symbol) => {
        try {
          const response = await axios.get("https://finnhub.io/api/v1/quote", {
            params: {
              symbol,
              token: this.apiKey,
            },
          });

          const data = response.data;

          if (data && data.c != null) {
            const yesterdayQuote = await this.prisma.quote.findUnique({
              where: {
                symbol_timestamp: {
                  symbol,
                  timestamp: yesterdayTimestamp,
                },
              },
            });

            let priceDifference = yesterdayQuote
              ? data.c - yesterdayQuote.currentPrice
              : undefined;

            if (priceDifference != null) {
              priceDifference = Number(priceDifference.toFixed(2));
            }

            const logo = await this.getCompanyLogo(symbol);

            const companyData = {
              symbol,
              currentPrice: data.c,
              highPrice: data.h,
              lowPrice: data.l,
              openPrice: data.o,
              priceDifference: priceDifference,
              timestamp: normalizeToDayTimestamp(data.t),
              sharesOutstanding: data.sharesOutstanding,
              logo: logo,
            } as QuoteResponse;

            return companyData;
          }
        } catch (error) {
          if (error.status != 429) {
            throw new HttpException("Something went wrong", error.status);
          }
        }
        return null;
      });

      const fetchedQuotes = (await Promise.all(quotePromises)).filter(
        (q): q is QuoteResponse => q !== null,
      );

      for (const q of fetchedQuotes) {
        if (validQuotes.length >= MAX_REQUESTS) break;
        if (!validQuotes.some((existing) => existing.symbol === q.symbol)) {
          validQuotes.push(q);
        }
      }

      try {
        await Promise.all(
          fetchedQuotes.map((q) =>
            this.prisma.quote.upsert({
              where: {
                symbol_timestamp: {
                  symbol: q.symbol,
                  timestamp: q.timestamp,
                },
              },
              update: {
                currentPrice: q.currentPrice,
                highPrice: q.highPrice,
                lowPrice: q.lowPrice,
                openPrice: q.openPrice,
              },
              create: {
                symbol: q.symbol,
                currentPrice: q.currentPrice,
                highPrice: q.highPrice,
                lowPrice: q.lowPrice,
                openPrice: q.openPrice,
                timestamp: q.timestamp,
              },
            }),
          ),
        );
      } catch {
        throw new HttpException(
          "Something went wrong",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (validQuotes.length < MAX_REQUESTS) {
        console.log(
          `Collected ${validQuotes.length} quotes, waiting before next batch...`,
        );
        await this.delay(1000);
      }
    }

    return validQuotes;
  }
}
