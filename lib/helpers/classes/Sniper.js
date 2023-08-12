"use strict";
const fetch = require("node-fetch");
const WebSocket = require("ws");
const constants = require("../constants");
const guilds = require("../guilds");

class Sniper {
    constructor() {
        this.opcodes = {
            DISPATCH: 0,
            IDENTIFY: 2,
            RECONNECT: 7,
            HELLO: 10,
            HEARTBEAT_ACK: 11,
        };
        this.socket = new WebSocket("wss://gateway.discord.gg");
        this.socket.on("open", this.onSocketOpen.bind(this));
        this.socket.on("message", this.onSocketMessage.bind(this));
        this.socket.on("close", this.onSocketClose.bind(this));
        this.socket.on("error", this.onSocketError.bind(this));
    }

    createPayload(data) {
        return JSON.stringify(data);
    }

    heartbeat() {
        this.socket.send(this.createPayload({ op: this.opcodes.HEARTBEAT_ACK }));
    }

    async updateVanityURL(find) {
        try {
            const response = await fetch(`https://discord.com/api/guilds/${constants.SNIPER_GUILD_ID}/vanity-url`, {
                method: "PATCH",
                body: this.createPayload({ code: find.vanity_url_code }),
                headers: {
                    Authorization: constants.URL_SNIPER_SELF_TOKEN,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                await constants.WEBHOOKS.SUCCESS(`URL: https://discord.gg/${find.vanity_url_code} successfully received. ||@everyone||.`);
            } else {
                const error = await response.json();
                await constants.WEBHOOKS.FAIL(`Error while sniping url: **\`${find.vanity_url_code}\`**.\n\`\`\`JSON\n${JSON.stringify(error, null, 4)}\`\`\`\n`);
            }

            delete guilds[data.d.guild_id];
        } catch (error) {
            console.log(error);
            delete guilds[data.d.guild_id];
        }
    }

    async onSocketOpen() {
        console.log("Discord WebSocket connection opened.");
    }

    async onSocketMessage(message) {
        const data = JSON.parse(message);
        switch (data.op) {
            case this.opcodes.DISPATCH:
                if (data.t === "GUILD_UPDATE") {
                    const find = guilds[data.d.guild_id];
                    if (find?.vanity_url_code && find.vanity_url_code !== data.d.vanity_url_code) {
                        await this.updateVanityURL(find);
                    }
                } else if (data.t === "READY") {
                    data.d.guilds
                        .filter((e) => typeof e.vanity_url_code === "string")
                        .forEach((e) => (guilds[e.id] = { vanity_url_code: e.vanity_url_code }));
                    await constants.WEBHOOKS.INFO(`Client is ready with: ${Object.keys(guilds).length} urls to be sniped.\n${Object.keys(guilds).map(key => `\`${guilds[key].vanity_url_code}\``).join(", ")}`);
                } else if (data.t === "GUILD_CREATE") {
                    guilds[data.d.id] = { vanity_url_code: data.d.vanity_url_code };
                }
                break;
            case this.opcodes.RECONNECT:
                process.exit();
                break;
            case this.opcodes.HELLO:
                clearInterval(this.interval);
                this.interval = setInterval(() => this.heartbeat(), data.d.heartbeat_interval);
                this.socket.send(this.createPayload({
                    op: this.opcodes.IDENTIFY,
                    d: {
                        token: constants.SNIPER_SELF_TOKEN,
                        intents: 1,
                        properties: {
                            os: "linux",
                            browser: "Firefox",
                            device: "desktop",
                        },
                    },
                }));
                break;
        }
    }

    onSocketClose(reason) {
        console.log('WebSocket connection closed: ', reason);
        process.exit();
    }

    onSocketError(error) {
        console.log(error);
        process.exit();
    }
}

module.exports = Sniper;
