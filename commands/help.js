const Discord = require('discord.js');
//const config = require("config.json");
const fs = require("fs");
const jsonString = fs.readFileSync("D:/RushiaBot/config.json");
const config = JSON.parse(jsonString);

module.exports = {
    name: "test",
    description: "testing command",
    execute(message, args) {
        message.channel.send(message.channel.send({embed: {
            color: 0xf476e8,
            author: {
                name: "Rushia Bot Help",
                icon_url: "https://i1.sndcdn.com/artworks-v8WSGW4z4QQ1zbMy-k7gSGg-t500x500.jpg"
            },
            //title: "Hello! I'm RushiaBot",
            // url: "https://osu.ppy.sh/users/" + userid,
            fields: [{
                    name: "General Commands: ",
                    value: config.defaultPrefix + "help - displays this message\n" + config.defaultPrefix + "invite - displays an invite link for RushiaBot"
                    //value: "You can put [masked links](http://google.com) inside of rich embeds."
                    },
                    {
                    name: "osu! commands: ",
                    value: config.defaultPrefix + "link <osu! username> - links your osu! username to discord\n" + config.defaultPrefix + "pp <number> - displays the rank for that pp\n" + config.defaultPrefix + "rank <number> - displays the pp needed for that rank\n" + config.defaultPrefix + "graph - shows some interesting osu! related graphs"
                    },
                    {
                        name: "music commands: ",
                        value: config.defaultPrefix + "play <link or search> - plays audio from youtube\n" + config.defaultPrefix + "pause - pauses the current song\n" + config.defaultPrefix + "resume - resumes a paused song\n" + config.defaultPrefix + "skip - skips the current song\n" + config.defaultPrefix + "queue - displays the music queue\n" + config.defaultPrefix + "loop - loops the current song\n" + config.defaultPrefix + "stop - empties the queue and makes the bot leave"
                    },
            ],
            timestamp: new Date(),
            footer: {
                text: "RushiaBot"
            }
        }})); 
    }
}