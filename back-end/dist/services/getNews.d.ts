export declare class NewsService {
    private readonly finnhubKey;
    private readonly openai;
    getTodayNews(symbol: string): Promise<any[]>;
    predictStockMovement(symbol: string): Promise<string>;
}
