"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBHOOKS = exports.URL_SNIPER_SELF_TOKEN = exports.SNIPER_SELF_TOKEN = exports.SNIPER_GUILD_ID = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.SNIPER_GUILD_ID = "Your Guild id";
exports.SNIPER_SELF_TOKEN = "Token1";
exports.URL_SNIPER_SELF_TOKEN = "Token2";
exports.WEBHOOKS = {
    SUCCESS: async (content) => {
        await (0, node_fetch_1.default)(`Your Webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                username: "SUCCESS",
            }),
        });
    },
    INFO: async (content) => {
        await (0, node_fetch_1.default)(`Your Webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                username: "INFO",
            }),
        });
    },
    FAIL: async (content) => {
        await (0, node_fetch_1.default)(`Your Webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                username: "FAIL",
            }),
        });
    },
};
