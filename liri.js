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

// Check if arguments are given. If not, prompt the user
if (process.argv[2]) {
    caseWhich(process.argv[2], process.argv.slice(3).join(" "));
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


// concert-this function to determine where and when a concert will be held
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

// spotify-this-song function to determine what the music might be
function spotifyThisSong(music) {
    spotify.search({ type: 'track', query: music }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        context = '';
        for (var i = 0; i < data.tracks.items.length; i++) {
            var musicData = data.tracks.items[i];
            context += i;
            context += "\nartist(s): " + musicData.artists[0].name;
            context += "\nsong name: " + musicData.name;
            context += "\npreview song: " + musicData.preview_url;
            context += "\nalbum: " + musicData.album.name;
            context += "\n------------------------------";
        }
        console.log(context);
        write2File(context);
    });
}

// movie-this function to find information on a movie
function movieThis(search) {
    var queryUrl = "http://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            context = "Title: " + JSON.parse(body).Title;
            context += "\nYear: " + JSON.parse(body).Year;
            context += "\nRated: " + JSON.parse(body).Rated;
            context += "\nIMDB Rating: " + JSON.parse(body).imdbRating;
            context += "\nRotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value;
            context += "\nCountry: " + JSON.parse(body).Country;
            context += "\nLanguage: " + JSON.parse(body).Language;
            context += "\nPlot: " + JSON.parse(body).Plot;
            context += "\nActors: " + JSON.parse(body).Actors;
            console.log(context);
            write2File(context);
        }
    });
}

// do-what-it-says function to run what is found in a file
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        caseWhich(dataArr[0], dataArr[1]);
    });
}

// Determine which type of information is sought
function caseWhich(option, search) {
    switch (option) {
        case "concert-this":
            concertThis(search);
            break;
        case "spotify-this-song":
            if (search === '') {
                search = "The Sign";
                spotifyThisSong(search);
            } else {
                spotifyThisSong(search);
            }
            break;
        case "movie-this":
            if (search === '') {
                search = "Mr. Nobody";
                spotifyThisSong(search);
            } else {
                movieThis(search);
            }
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
    }
}

// Append data to file
function write2File(context) {
    fs.appendFile("log.txt", context, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("log.txt was updated!");
    });
}
