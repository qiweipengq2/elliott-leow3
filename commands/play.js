const Discord = require('discord.js');
//const config = require("config.json");
const fs = require("fs");
const jsonString = fs.readFileSync("D:/RushiaBot/config.json");
const config = JSON.parse(jsonString);
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();

module.exports = {
    name: "play",
    description: "plays something from youtube!",
    async execute(message, args) {
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('be in vc pls');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('I do not have permissions to connect to voice channels.');
        if (!permissions.has('SPEAK')) return message.channel.send('I do not have permissions to speak in voice channels.');

        
        const server_queue = queue.get(message.guild.id);

        

        if(message.content.toLowerCase().startsWith(config.defaultPrefix + "play")) {
            
            if (args.length == 1) {
                if (!server_queue) return message.channel.send("no queue currently");
                var n = parseInt(args[0]);
                console.log(n + (Number.isInteger(n) + n > 0 + n < server_queue.songs.length + 1))
                if (Number.isInteger(n) && n > 0 && (n < server_queue.songs.length + 1)) {
                    console.log("test")
                    var target = server_queue.songs[n-1];
                    for (var i = 0; i < server_queue.songs.length; i++) {
                        if (server_queue.songs[0] == target) {
                            video_player(message.guild, target);
                            return;
                        } else {
                            var tempSong = server_queue.songs.shift();
                            server_queue.songs.push(tempSong);
                        }
                    }
                } else {
                    return message.channel.send("please input valid number to select song from queue")
                }
                return;
            }
            if (!args.length && !server_queue) {
                return message.channel.send('Please input a song to play!');
            } else if (!args.length && server_queue.connection.dispatcher.isPaused()) {
                server_queue.connection.dispatcher.resume();
            }
            let song = {};

            
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                } else {
                     message.channel.send('cant find video');
                }
            }

            
            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    loop: 0, //0 = no loop, 1 = loop song, 2 = loop queue
                    songs: []
                }
                
                
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('error connecting');
                    throw err;
                }
            } else {
                

                
                server_queue.songs.push(song);
                return message.channel.send(`**${song.title}** was added to queue`);
                
            }
        } else if(message.content.toLowerCase().startsWith(config.defaultPrefix + "skip")) {
            skip_song(message, server_queue);
        } else if (message.content.toLowerCase().startsWith(config.defaultPrefix + "stop")) {
            stop_song(message, server_queue);
        } else if (message.content.toLowerCase().startsWith(config.defaultPrefix + "loop")) { 
            if (!server_queue) return message.channel.send("no queue currently")

            if (args.length == 1 && args[0] == "queue") {
                if (queue.get(message.guild.id).loop == 2) {
                    queue.get(message.guild.id).loop = 0;
                    return message.channel.send("Looping disabled");
                }
                else {
                    queue.get(message.guild.id).loop = 2;
                    return message.channel.send("Looping the whole queue")
                }
            } else if (args.length == 1 && args[0] == "status") {
                if (queue.get(message.guild.id).loop == 1) return message.channel.send("Looping song");
                if (queue.get(message.guild.id).loop == 0) return message.channel.send("Not looping");
                if (queue.get(message.guild.id).loop == 2) return message.channel.send("Looping queue");  
            } else if (!args.length) {
                if (!(queue.get(message.guild.id).loop == 0)) {
                    queue.get(message.guild.id).loop = 0;
                    message.channel.send("Looping disabled");
                } else {
                    queue.get(message.guild.id).loop = 1;
                    return message.channel.send("Looping the current song");
                }
            }
        } else if (message.content.toLowerCase().startsWith(config.defaultPrefix + "queue")) { 
            if (!server_queue) return message.channel.send("no queue currently")
            
            var currentsongs = "";
            for (var i = 0; i < server_queue.songs.length; i++) {
                currentsongs = currentsongs + (i+1) + ") "  + server_queue.songs[i].title + "\n";
            }
            var isLoop = "Not looping";
            if (queue.get(message.guild.id).loop == 1) isLoop = "looping song"
            else if (queue.get(message.guild.id).loop == 2) isLoop = "Looping queue"
            return message.channel.send("loop status: " + isLoop + "\ncurrent songs:\n" + currentsongs);
        } else if (message.content.toLowerCase().startsWith(config.defaultPrefix + "pause")) {
            if (!server_queue) return message.channel.send("no queue currently")
            server_queue.connection.dispatcher.pause();
            message.channel.send("Paused song!");
        } else if (message.content.toLowerCase().startsWith(config.defaultPrefix + "resume")) {
            if (!server_queue) return message.channel.send("no queue currently")
            server_queue.connection.dispatcher.resume();
            return message.channel.send("Resumed song!");
        }
        
    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    
    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        if (song_queue.loop == 1) {
            video_player(guild, song_queue.songs[0]);
        } else if (song_queue.loop == 2) {
            var firstSong = song_queue.songs.shift();
            song_queue.songs.push(firstSong);
            video_player(guild, song_queue.songs[0]);
        } else {
            song_queue.songs.shift();
            video_player(guild, song_queue.songs[0]);
        }
    });
    await song_queue.text_channel.send(`now playing **${song.title}**`)
}

const skip_song = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send('be in vs pls');
    if(!serverQueue){
        return message.channel.send(`no songs in queue`);
    }
    
    if (serverQueue.loop == 2) {
        if (serverQueue.songs.length == 1) {
            video_player(message.guild, serverQueue.songs[0]);
        } else {
            var firstSong = serverQueue.songs.shift();
            serverQueue.songs.push(firstSong);
            video_player(message.guild, serverQueue.songs[0]);
        }
    } else {
        serverQueue.songs.shift();
        video_player(message.guild, serverQueue.songs[0]);
    }
}

const stop_song = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send('be in vs pls');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}