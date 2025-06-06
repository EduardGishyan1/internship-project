"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const openai_1 = require("openai");
let NewsService = class NewsService {
    finnhubKey = process.env.API_KEY;
    openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    async getTodayNews(symbol) {
        try {
            const today = new Date().toISOString().split("T")[0];
            const response = await axios_1.default.get("https://finnhub.io/api/v1/company-news", {
                params: {
                    symbol,
                    from: today,
                    to: today,
                    token: this.finnhubKey,
                },
            });
            return response.data;
        }
        catch {
            throw new common_1.HttpException("Failed to fetch news from Finnhub", common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async predictStockMovement(symbol) {
        const prompt = `Predict the effect on a company's stock based on the news below.
Your response must have exactly 4 lines.
Do not mention the news or its content in any way. Only give your final conclusion.`.trim();
        const newsItems = await this.getTodayNews(symbol);
        if (!newsItems.length) {
            return "No news found for prediction.";
        }
        const newsText = newsItems
            .map((item, index) => `News ${index + 1}:\nHeadline: ${item.headline}\nSummary: ${item.summary}\n`)
            .join("\n");
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    {
                        role: "system",
                        content: newsText,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.4,
            });
            return (completion.choices[0]?.message?.content?.trim() ||
                "No prediction returned.");
        }
        catch {
            throw new common_1.HttpException("Failed to get prediction from OpenAI", common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)()
], NewsService);
//# sourceMappingURL=getNews.js.map