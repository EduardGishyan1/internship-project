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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinnhubController = void 0;
const common_1 = require("@nestjs/common");
const getInfo_1 = require("../services/getInfo");
let FinnhubController = class FinnhubController {
    finnhubService;
    constructor(finnhubService) {
        this.finnhubService = finnhubService;
    }
    async getQuotes() {
        try {
            return await this.finnhubService.getQuotesForValidCompanies();
        }
        catch {
            throw new common_1.HttpException("Failed to fetch quotes", common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.FinnhubController = FinnhubController;
__decorate([
    (0, common_1.Get)("quotes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], FinnhubController.prototype, "getQuotes", null);
exports.FinnhubController = FinnhubController = __decorate([
    (0, common_1.Controller)("finnhub"),
    __metadata("design:paramtypes", [getInfo_1.FinnhubService])
], FinnhubController);
//# sourceMappingURL=getInfo.js.map