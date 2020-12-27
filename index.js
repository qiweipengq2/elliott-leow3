//TODO:
//add env so api key shit doesnt get stolen
//finish check (implement map)
//try to implement other shit using map bc writeFile is too slow
//push to git

//discord related variables
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

//bot related variables
const prefix = 'r!'

//osu! related variables

const isNumber = require('is-number');
var http = require('http');
const https = require('https');
const fetch = require('node-fetch');

var fs = require("fs");
const osu = require('node-osu');
const { createConnection } = require('net');

const osuPlayers = new Map();
//note use this for storing osu player names, dont use the text file system its shit
//
//
//
//
//
//
//
//

require("dotenv").config();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    bot.commands.set(command.name, command);
}

const BPDPC = require('osu-bpdpc');
const {Beatmap, Osu: {DifficultyCalculator, PerformanceCalculator}} = require('osu-bpdpc')

const osuDailyAPI = process.env.OSUDAILYTOKEN;
const osuAPI = process.env.OSUTOKEN;

const osuApi = new osu.Api(osuAPI, {
	// baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
	notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
	completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
	parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});

var osuRecents;

function check() {
    fs.readFile('osulink.txt', {encoding: 'utf-8'}, function(err, data) {
        if (err) throw error;
    
        let dataArray = data.split('\n');
        var serverIDs = bot.guilds.cache.map(g => g.id)
        for(var i = 0; i < dataArray; i++) {
            dataArgs = dataArray[i].split(" ")
            if (serverIDs.includes(dataArgs[0])) {
                if (bot.guilds.cache.get(dataArgs[0]).channels.cache.get(dataArgs[1]) != null) {
                    if (doesPlayerExist(dataArgs[2])) {
                        getPlayerRecent(dataArgs[2], dataArgs[3]);
                    } else {
                        messageOwner("Skipping " + dataArgs[2] + " as it is not an osu! player, might be api issue.")
                        //dont delete
                    }
                } else {
                    messageOwner("channel " + dataArgs[1] + " does not exist, deleting from file");
                    
                    //delete
                }
            } else {
                messageOwner("server " + dataArgs[0] + " does not exist, deleting from file");
                //delete
            }
        }
    });
}

function getPlayerRecent(name, pp) {

}

function messageOwner(msg) {
    bot.users.cache.get("251739380388069376").send(msg);
}

async function doesPlayerExist(osuPlayer) {
    var url = "https://osu.ppy.sh/api/get_user?u=" + osuPlayer + "&k=" + osuAPI;
    const data = await fetch(url).then(response => response.text());
    if (data == "[]") {
        return true;
    }
    return false;
}

function commaify(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


bot.login(process.env.DISCORDTOKEN);

bot.on('ready', () => {
    console.log("\x1b[32mRushia Bot is on! Time is " + new Date() + "\n\x1b[35mThe bot is in " + bot.guilds.cache.size + " servers.\x1b[0m");
    bot.user.setStatus('Online');
    bot.user.setActivity("osu!", {type: 'WATCHING'});

    var timerID = setInterval(function() {
        //messageOwner("Console: polling api for the tracking system")
        check();


        

    }, 60000); 
});



bot.on('message', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const arguments = message.content.slice(prefix.length).split(/ +/);
    const command = arguments.shift().toLowerCase();

    if (command === "test") {
        bot.commands.get('test').execute(message, arguments);
    }

    if(command === 'about') {
        bot.commands.get('about').execute(message, arguments);
    }
    if(command === 'remind') {
        bot.commands.get('remind').execute(message, arguments);
    }
    if (command === 'play' || command === 'skip' || command === 'stop' || command === 'queue' || command === 'loop' || command === 'pause' || command === 'resume') {
        bot.commands.get('play').execute(message, arguments);
    }

    if (command === 'help') {
        bot.commands.get('help').execute(message, arguments);
    }

    if(message.content.toLowerCase().startsWith(prefix + "pp ")) {
        var args = message.content.split(" ");
        args.shift();
        if (args.length == 1) {
            if (isNumber(args[0])) {
                
                var url = "https://osudaily.net/api/pp.php?k=" + osuDailyAPI + "&t=pp&v=" + args[0];

                const data = await fetch(url).then(response => response.text());
                var json = JSON.parse(data);
                message.channel.send({embed: {
                        //title: 'osu! pp to rank',
                        color: 0xf476e8,
                        fields: [{
                            name: 'osu! pp to rank',
                            value: "In osu! standard, **" + commaify(args[0]) + " pp** is about equal to rank **#" + commaify(json.rank) + "**"
                            //value: "You can put [masked links](http://google.com) inside of rich embeds."
                            },
                        ],
                    }});

            } else {
                message.channel.send("Please input a number. Usage: " + prefix + "pp <number>");
            }
        } else {
            message.channel.send("Please input only one argument. Usage: " + prefix + "pp <number>");
        }
    }

    if(message.content.toLowerCase().startsWith(prefix + "invite")) {
        message.channel.send({embed: {
            //title: 'osu! pp to rank',
            color: 0xf476e8,
            fields: [{
                name: 'RushiaBot Invite',
                value: "[Click to invite RushiaBot](https://discord.com/api/oauth2/authorize?client_id=859310546317738014&permissions=8&scope=bot)"
                //value: "You can put [masked links](http://google.com) inside of rich embeds."
                },
            ],
        }})
    }

    if(message.content.toLowerCase().startsWith(prefix + "rank ")) {
        var args = message.content.split(" ");
        args.shift();
        if (args.length == 1) {
            if (isNumber(args[0])) {
                if (args[0] > 0) {
                var url = "https://osudaily.net/api/pp.php?k=" + osuDailyAPI + "&t=rank&v=" + args[0];

                const data = await fetch(url).then(response => response.text());
                var json = JSON.parse(data);
                message.channel.send({embed: {
                        //title: 'osu! pp to rank',
                        color: 0xf476e8,
                        fields: [{
                            name: 'osu! rank to pp',
                            value: "In osu! standard, to reach rank **#" + commaify(args[0]) + "**, you need about **" + commaify(Math.round(parseInt(json.pp))) + " pp**"
                            //value: "You can put [masked links](http://google.com) inside of rich embeds."
                            },
                        ],
                    }});
                } else {
                    message.channel.send("Please enter a positive integer Usage: " + prefix + "rank <number>");
                }
            } else {
                message.channel.send("Please input a number. Usage: " + prefix + "rank <number>");
            }
        } else {
            message.channel.send("Please input only one argument. Usage: " + prefix + "rank <number>");
        }
    }

    if (message.content.toLowerCase().startsWith(prefix + "link ")) {
        var args = message.content.split(" ");
        args.shift();
        if (args.length == 1) {
            var url = "https://osu.ppy.sh/api/get_user?u=" + args[0] + "&k=" + osuAPI;
            const data = await fetch(url).then(response => response.text());
            if (data == "[]") {
                message.channel.send(args[0] + " is not a valid osu! username.");
            } else {
                        var toReplace = false;
                        fs.readFile('osulink.txt', {encoding: 'utf-8'}, function(err, data) {
                            if (err) throw error;
                        
                            let dataArray = data.split('\n'); // convert file data in an array
                            const searchKeyword = message.author.id; // we are looking for a line, contains, key word 'user1' in the file
                            let lastIndex = -1; // let say, we have not found the keyword
                            var oldName = "";
                            
                        
                            for (let index=0; index<dataArray.length; index++) {
                                if (dataArray[index].includes(searchKeyword)) { // check if a line contains the 'user1' keyword
                                    lastIndex = index; // found a line includes a 'user1' keyword

                                    toReplace = true;
                                    break; 
                                }
                            }
                            if (lastIndex != -1) oldName = dataArray[lastIndex].split("=")[1];
                            if(lastIndex != -1) dataArray.splice(lastIndex, 1); // remove the keyword 'user1' from the data Array
                            dataArray.push(message.author.id + "=" + args[0])
                            // UPDATE FILE WITH NEW DATA
                            // IN CASE YOU WANT TO UPDATE THE CONTENT IN YOUR FILE
                            // THIS WILL REMOVE THE LINE CONTAINS 'user1' IN YOUR shuffle.txt FILE
                            const updatedData = dataArray.join('\n');
                            //message.channel.send(updatedData);
                            // fs.writeFile('osulink.txt', updatedData, (err) => {
                            //     if (err) throw err;
                            //     console.log ('Successfully updated the file data');
                            // });
                            fs.writeFile('osulink.txt', updatedData, function(err) {
                                if (err) {
                                    return console.error(err);
                                    
                                }
                                console.log ('Successfully updated the file data');
                            });
                            if (toReplace) message.channel.send("Replaced your osu! name from **" + oldName + "** to **" + args[0] + "**");
                            else message.channel.send("Set your osu! name to **" + args[0] + "**");
                            //return;                        
                        });
                        
                      
                    //console.log('Line from file:', line);
                  

                    
                    
                }
        
            
        } else {
            message.channel.send("Please input only one arguemnt Usage: " + prefix + "link <osu! username>");
        }
    }

    if (message.content.toLowerCase().startsWith(prefix + "pfp")) {
        var args = message.content.split(" ");
        args.shift();
        if (args.length == 1) {
            osuApi.getUser({ u: args[0] }).then(user => {
                console.log(user.name);
                const embed = new Discord.MessageEmbed()
                .setColor('0xf476e8')
                .setTitle("Here is " + user.name + "'s profile picture:")
                .setImage("https://a.ppy.sh/" + user.id + "?.png");
                message.channel.send(embed);
                //message.channel.send("Here is " + user.name + "'s profile picture:", {files: []});
            });
        } else {
            message.channel.send("L");
        }
    }
        
    // if (message.content.toLowerCase().startsWith(prefix + "join")) {
    //     if (message.member.voice.channel) {
    //         const connection = await message.member.voice.channel.join()
                
    //                 message.channel.send("joined vc");
                
    //             connection.on('speaking', (user, speaking) => {
    //                 if (speaking) {
    //                   console.log(`I'm listening to ${user.username}`)
    //                 } else {
    //                   console.log(`I stopped listening to ${user.username}`)
    //                 }
    //               })
    //     } else {
    //         message.channel.send("You must be in a voice channel!");
    //     }
    // }

    // if (message.content.toLowerCase().startsWith(prefix + "leave")) {
    //     if(!message.guild.me.voice.channel) return message.channel.send("I'm not in a voice channel");

    //         message.channel.send("Left the voice channel")
    //         message.guild.me.voice.channel.leave();
            
        
    // }

    if (message.content.toLowerCase().startsWith(prefix + "track")) {
        //r!track <name> <channel> <pp>
        var args = message.content.split(" ");
        args.shift();

    
           
            if (message.guild.channels.cache.get(args[1].replace('<','').replace('>','').replace('#', '')) != null) {
                if (doesPlayerExist(args[0])) {
                    fs.readFile('check.txt', {encoding: 'utf-8'}, function(err, data) {
                        let dataArray = data.split('\n');
                        for (var i = 0; i < dataArray.length; i++) {
                            var lineArgs = dataArray[i].split(" ");
                            if (args[0] == lineArgs[2] && message.guild.id == lineArgs[0] && args[1].replace('<','').replace('>','').replace('#', '') == lineArgs[1]) {
                                message.channel.send("Player is already being tracked in the same channel!");
                                return;
                            }
                        }

                        fs.writeFile('check.txt', data+"\n"+message.guild.id+" "+args[1].replace('<','').replace('>','').replace('#', '')+" "+args[0]+" "+"0", function(err) {
                            if (err) {
                                return console.error(err);
                                
                            }
                            message.channel.send("Now tracking " + args[0] + " in #" + message.guild.channels.cache.get(args[1].replace('<','').replace('>','').replace('#', '')).name + ". To remove this, do " + prefix + "remove " + args[0])
                            console.log ('Successfully updated the file data');
                        });
                    });
                } else {
                    message.channel.send("Please input a valid osu! player.")
                }
            } else {
                message.channel.send("The channel " + args[1].replace('#', '') +" does not exist");
                
                
            
        } 
     
        
    }

    if (message.content.toLowerCase().startsWith(prefix + "suggestion ")) {
        messageOwner("**" + message.author.tag + " suggests: **" + message.content.slice(prefix.length + 11));
    }

    // if(message.content.toLowerCase().startsWith(prefix + "setup")) {
    //     var args = message.content.split(" ");
    //     if (args[1] = "joinmessage") {
    //         message.channel.send("Please state the message that a person that just joined the server should see. If you put (name), it will be replaced with the actual discord user name in the message. For example \"Welcome to the Server (name)!\"")
    //         var joinMessage = "";
    //         var channel = "";
    //         const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
    //         console.log(collector)
    //         collector.on('collect', message => {

                
    //             message.channel.send("Join message set to: " + "\"" + message.content + "\"");
                
    //         })
    //     }







    //     fs.readFile('verification.txt', {encoding: 'utf-8'}, function(err, data) {
    //         if (err) throw error;
        
    //         let dataArray = data.split('\n');
    //         fs.writeFile('verification.txt', data + "\n" + message.guild.id , function(err) {
    //             if (err) {
    //                 return console.error(err);
                    
    //             }
    //             console.log ('Successfully updated the file data');
    //         });
    //     });
    // }

    

});



