const Discord = require('discord.js');
const fs = require("fs");
const jsonString = fs.readFileSync("D:/RushiaBot/config.json");
const config = JSON.parse(jsonString);

module.exports = {
    name: "remind",
    description: "reminds at a certain date and time",
    execute(message, args) {
        if (isValidDate(args[0])) {
            
            //var twelveHour = true;
            //var twelveHourRegEx = new RegExp("(?<Time>^(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d(?:[ap]m))");
            var twentyFourHourRegEx = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            var time = args[1].toLowerCase();
            if (twentyFourHourRegEx.test(time)) {
                //twelveHour = false;
                
            
            // } else if (twelveHourRegEx.test(args[1])) { 
            //     twelveHour = true;
                
            //     var hours = Number(time.match(/^(\d+)/)[1]);
            //     var minutes = Number(time.match(/:(\d+)/)[1]);
            //     var AMPM = time.match(/\s(.*)$/)[1];
            //     if(AMPM == "pm" && hours<12) hours = hours+12;
            //     if(AMPM == "pm" && hours==12) hours = hours-12;
            //     var sHours = hours.toString();
            //     var sMinutes = minutes.toString();
            //     if(hours<10) sHours = "0" + sHours;
            //     if(minutes<10) sMinutes = "0" + sMinutes;
            //     time = sHours + ":" + sMinutes;
            } else {
                message.channel.send("Please input a valid 24 hour time. Examples of valid times are 10:15 and 22:15");
                return;
            }
            args.shift();
            args.shift();
            var msg = args.join(" ");
            fs.appendFile("D:/RushiaBot/reminders.txt", "\n" + message.author.id + " " + args[0] + " " + time + " " + args, (err) => {
                if (err) {
                  console.log(err);
                }
                else {
                  // Get the file contents after the append operation
                  message.channel.send("I will send the reminder in your dms at the date you specified!");
                }
              });

        } else {
            message.channel.send("Please input a date in the correct format for the first arguemnt. Format: mm/dd/yyyy\nExample: January 2 2010 would be 01/02/2010");
        }
    }

    
}
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};