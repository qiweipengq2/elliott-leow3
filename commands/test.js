const Discord = require('discord.js');
//const config = require("config.json");
const fs = require("fs");
const jsonString = fs.readFileSync("D:/RushiaBot/config.json");
const config = JSON.parse(jsonString);

module.exports = {
    name: "test",
    description: "testing command",
    execute(message, args) {
        message.channel.send("Test message\nMessage: " + message.content + "\nArguments: " + args.toString());
    }
}