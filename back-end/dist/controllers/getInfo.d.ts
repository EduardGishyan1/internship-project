import { FinnhubService, QuoteResponse } from "../services/getInfo";
export declare class FinnhubController {
    private readonly finnhubService;
    constructor(finnhubService: FinnhubService);
    getQuotes(): Promise<QuoteResponse[]>;
}
