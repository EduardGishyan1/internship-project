import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "./prismaService";

import * as dotenv from "dotenv";
import * as process from "node:process";

dotenv.config();

export interface QuoteResponse {
  symbol: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  timestamp: number;
  priceDifference?: number;
}

@Injectable()
export class FinnhubService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly apiKey = process.env.API_KEY;

  private readonly symbols: string[] = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "META",
    "TSLA",
    "BRK.B",
    "JNJ",
    "V",
    "WMT",
    "NVDA",
    "JPM",
    "UNH",
    "HD",
    "PG",
    "MA",
    "DIS",
    "BAC",
    "ADBE",
    "CMCSA",
    "NFLX",
    "XOM",
    "INTC",
    "KO",
    "CSCO",
    "PFE",
    "PEP",
    "VZ",
    "T",
    "ABBV",
    "CVX",
    "ABT",
    "CRM",
    "NKE",
    "ORCL",
    "MRK",
    "TMO",
    "ACN",
    "WFC",
    "MCD",
    "DHR",
    "LLY",
    "MDT",
    "COST",
    "NEE",
    "AMGN",
    "TXN",
    "HON",
    "QCOM",
    "BMY",
    "LIN",
    "PM",
    "UPS",
    "RTX",
    "LOW",
    "UNP",
    "GS",
    "CAT",
    "BLK",
    "IBM",
  ];

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeToDayTimestamp(unixTimestamp: number): number {
    const date = new Date(unixTimestamp * 1000);
    date.setUTCHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  }

  private getYesterdayTimestamp(): number {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const beforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    return Math.floor(beforeYesterday.getTime() / 1000);
  }

  async getQuotesForValidCompanies(): Promise<QuoteResponse[]> {
    if (!this.apiKey) {
      throw new HttpException(
        "API key not set",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const validQuotes: QuoteResponse[] = [];
    const yesterdayTimestamp = this.getYesterdayTimestamp();

    const MAX_REQUESTS = process.env.MAX_REQUESTS
      ? parseInt(process.env.MAX_REQUESTS, 10)
      : 60;

    while (validQuotes.length < MAX_REQUESTS) {
      const remainingSymbols = this.symbols.filter(
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

            const newVar = {
              symbol,
              currentPrice: data.c,
              highPrice: data.h,
              lowPrice: data.l,
              openPrice: data.o,
              priceDifference: priceDifference,
              timestamp: this.normalizeToDayTimestamp(data.t),
            } as QuoteResponse;
            return newVar;
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
      } catch (dbError) {
        throw new HttpException("Something went wrong", dbError.status);
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
