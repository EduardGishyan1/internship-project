import { NewsService } from "../services/getNews";
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    getPrediction(symbol: string): unknown;
}
