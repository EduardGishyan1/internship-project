"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinnhubService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const prismaService_1 = require("./prismaService");
const dotenv = require("dotenv");
const process = require("node:process");
dotenv.config();
let FinnhubService = class FinnhubService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    apiKey = process.env.API_KEY;
    symbols = [
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
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    normalizeToDayTimestamp(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        date.setUTCHours(0, 0, 0, 0);
        return Math.floor(date.getTime() / 1000);
    }
    getYesterdayTimestamp() {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const beforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
        return Math.floor(beforeYesterday.getTime() / 1000);
    }
    async getQuotesForValidCompanies() {
        if (!this.apiKey) {
            throw new common_1.HttpException("API key not set", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const validQuotes = [];
        const yesterdayTimestamp = this.getYesterdayTimestamp();
        const MAX_REQUESTS = process.env.MAX_REQUESTS
            ? parseInt(process.env.MAX_REQUESTS, 10)
            : 60;
        while (validQuotes.length < MAX_REQUESTS) {
            const remainingSymbols = this.symbols.filter((symbol) => !validQuotes.some((q) => q.symbol === symbol));
            const quotePromises = remainingSymbols.map(async (symbol) => {
                try {
                    const response = await axios_1.default.get("https://finnhub.io/api/v1/quote", {
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
                        };
                        return newVar;
                    }
                }
                catch (error) {
                    if (error.status != 429) {
                        throw new common_1.HttpException("Something went wrong", error.status);
                    }
                }
                return null;
            });
            const fetchedQuotes = (await Promise.all(quotePromises)).filter((q) => q !== null);
            for (const q of fetchedQuotes) {
                if (validQuotes.length >= MAX_REQUESTS)
                    break;
                if (!validQuotes.some((existing) => existing.symbol === q.symbol)) {
                    validQuotes.push(q);
                }
            }
            try {
                await Promise.all(fetchedQuotes.map((q) => this.prisma.quote.upsert({
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
                })));
            }
            catch (dbError) {
                throw new common_1.HttpException("Something went wrong", dbError.status);
            }
            if (validQuotes.length < MAX_REQUESTS) {
                console.log(`Collected ${validQuotes.length} quotes, waiting before next batch...`);
                await this.delay(1000);
            }
        }
        return validQuotes;
    }
};
exports.FinnhubService = FinnhubService;
exports.FinnhubService = FinnhubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prismaService_1.PrismaService])
], FinnhubService);
//# sourceMappingURL=getInfo.js.map