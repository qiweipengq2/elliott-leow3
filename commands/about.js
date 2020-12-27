const Discord = require('discord.js');
//const config = require("config.json");
const fs = require("fs");
const jsonString = fs.readFileSync("D:/RushiaBot/config.json");
const config = JSON.parse(jsonString);

module.exports = {
    name: "about",
    description: "Gives information about Rushia Bot",
    execute(message, args) {
        const attachment = new Discord.MessageAttachment('./rushia.png', 'rushia.png');
        message.channel.send(message.channel.send({embed: {
            color: 0xf476e8,
            files: [
                attachment
            ],
            author: {
                name: "Hello! I'm RushiaBot",
                icon_url: "attachment://rushia.png"
            },
            //title: "Hello! I'm RushiaBot",
            // url: "https://osu.ppy.sh/users/" + userid,
            fields: [{
                    name: "Information: ",
                    value: "I am mainly an osu! bot, but more features will be added in the future! If you want to see all the commands, do " + config.defaultPrefix + "help "
                    //value: "You can put [masked links](http://google.com) inside of rich embeds."
                    },

            ],
            
        
            timestamp: new Date(),
            footer: {
                text: "RushiaBot"
            }
        }})); 
    }
}