import { PrismaService } from "../services/prismaService";
export interface QuoteResponse {
    symbol: string;
    currentPrice: number;
    highPrice: number;
    lowPrice: number;
    openPrice: number;
    timestamp: number;
    priceDifference?: number;
}
export declare class FinnhubService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly apiKey;
    private readonly symbols;
    private delay;
    private normalizeToDayTimestamp;
    private getYesterdayTimestamp;
    getQuotesForValidCompanies(): Promise<QuoteResponse[]>;
}
