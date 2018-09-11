require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var request = require("request");
var inquirer = require("inquirer");
var moment = require("moment");
var fs = require("fs");
var bandsintown = require('bandsintown')('codingbootcamp');
var context = '';

if (process.argv[2]) {
    caseWhich(process.argv[2], process.argv[3]);
} else {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which information do you want?",
                choices: ["concert-this", "spotify-this-song", "movie-this"],
                name: "option"
            },
            {
                type: "input",
                message: "Enter search item:",
                name: "search"
            }
        ])
        .then(function (inquirerResponse) {
            if (inquirerResponse.option) {
                caseWhich(inquirerResponse.option, inquirerResponse.search);
            }
        });
}

function concertThis(search) {
    bandsintown
        .getArtistEventList(search)
        .then(function (events) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].venue.country === 'United States') {
                    regionCountry = events[i].venue.region;
                } else {
                    regionCountry = events[i].venue.country;
                }
                context += "\n" + events[i].venue.city + "," + regionCountry + " at " + events[i].venue.name + " " + moment(events[i].datetime).format("L");
            }
            console.log(context);
            write2File(context);
        });
}

function spotifyThisSong(music) {
    console.log("We're Here " + music);

    // function checkMusic(music) {
    //     // If no song is given default to song.txt
    //     if (music === 'undefined' || music === '') {
    //         fs.readFile("song.txt", "utf8", function (error, data) {
    //             if (error) {
    //                 return console.log(error);
    //             }
    //             console.log("NOTHING " + data);
    //             var dataArr = data.split(",");
    //             music = dataArr[1];
    //             music = "The Sign";
    //         });

            spotify.search({ type: 'track', query: music }, function (err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                for (var i = 0; i < data.tracks.items.length; i++) {
                    var musicData = data.tracks.items[i];
                    context = i;
                    context += "\nartist(s): " + musicData.artists[0].name;
                    context += "\nsong name: " + musicData.name;
                    context += "\npreview song: " + musicData.preview_url;
                    context += "\nalbum: " + musicData.album.name;
                    context += "\n------------------------------";
                    console.log(context);
                }
                write2File(context);
            });
        }
//     }
// }
function movieThis(search) {
    var queryUrl = "http://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            context = "Title: " + JSON.parse(body).Title;
            context += "\nYear: " + JSON.parse(body).Year;
            context += "\nRated: " + JSON.parse(body).Rated;
            context += "\nIMDB Rating: " + JSON.parse(body).imdbRating;
            context += "\nCountry: " + JSON.parse(body).Country;
            context += "\nLanguage: " + JSON.parse(body).Language;
            context += "\nPlot: " + JSON.parse(body).Plot;
            context += "\nActors: " + JSON.parse(body).Actors;
            context += "\nRotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value;
            console.log(context);
            write2File(context);
        }
    });
}

function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        caseWhich(dataArr[0], dataArr[1]);
    });
}

function caseWhich(option, search) {

    // if (option === 'spotifyThisSong' && search === 'undefined') {
    //     fs.readFile("song.txt", "utf8", function (error, data) {
    //         if (error) {
    //             return console.log(error);
    //         }
    //         console.log("NOTHING " + data);
    //         var dataArr = data.split(",");
    //         music = dataArr[1];
    //         search = "The Sign";
    //     });
    // }

    switch (option) {
        case "concert-this":
            concertThis(search);
            break;
        case "spotify-this-song":
            spotifyThisSong(search);
            break;
        case "movie-this":
            movieThis(search);
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
    }
}

function write2File(context) {
    // appendFile if needed in future
    fs.writeFile("query.txt", context, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("query.txt was updated!");
    });
}
