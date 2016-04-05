//imports twitter keys from keys.js file
var keys = require('./keys.js');
// twitter npm
var Twitter = require('twitter');
// spotify npm
var Spotify = require('spotify');
// request npm
var Request = require('request');
// file system
var fs = require('fs');
// new twitter client with keys.twitterKeys holding information, twitterKeys is object in key.js 
var client = new Twitter(keys.twitterKeys);
// twitter screen name
var params = {screen_name: 'AJVanderhoff'};
// third argument from command line, in this case which aspect of liri to run
var command = process.argv[2];
// fourth argument onward from command line, if argument more than one word makes into 
// string that can be passed to various liri functions
var argument = process.argv.slice(3).toString().replace(/,/g , ' ');

// logic for whole program, checks command and then runs function for that command
// if there is argument as well passes that to relevant function
function run(com , arg){
	if(com =='my-tweets'){ twitter();}
	else if(com =='spotify-this-song'){spotify(arg);}
	else if(com =='movie-this'){omdb(arg);}
	else if(com =='do-what-it-says'){dowhatitsays();}
	else{console.log("unrecognized command");}
}

// function to run twitter command
function twitter(){
	// gets informaton from twitter account 
    client.get('statuses/user_timeline', params, function(error, tweets, response){
  		//will append users tweets to this and use this variable to log to console 
        // and write to log.txt
        var twitterResponse = '\n';
  		//check for error
        if (!error) {
    		// takes tweets and time of tweet and appends to twitterResponse
    		for(var i=0 ; i < 20 ; i++){
  				twitterResponse+= tweets[i].text + '\n' + tweets[i].created_at + '\n';
  			}
            // twitterReponse to console
            console.log(twitterResponse);
			// appends twitterResponse to log.txt
            fs.appendFile("log.txt", twitterResponse , function(err){
				if(err){
					console.log(err);
				}
    		});
        }
	});
}

// spotify function takes song name as argument
function spotify(song){
	// search spotify for song
    Spotify.search({ type: 'track', query: song }, function(err, data) {
    	// if error in search
        if ( err ) {
        	console.log('Error occurred: ' + err);
        	return;
    	}
        // gets to first entry of what is returned by searching spotify, is json
    	var songData = data.tracks.items[0];
    	// to be logged to console and appended to log.txt
        var songResponse = '\n'+ songData.artists[0].name + '\n'+ songData.name + '\n'+ songData.preview_url + '\n'+ songData.album.name + '\n';
    	//checks to make sure what is returned is JSON if not run function again with default song
    	if(isJSON(songData)){
    		// songResponse to console
            console.log(songResponse);
    		// append songResponse to log.txt
            fs.appendFile("log.txt", songResponse , function(err){
					if(err){
					console.log(err);
					}
    			});
		}
    	else{spotify("whats my age again")};
    });
}

//function for omdb
function omdb(movie){
	// using request to access omdb api
    Request('http://www.omdbapi.com/?t=' + movie + '&y=&plot=short&r=json', function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		//  turns body from string to JSON
            var json = JSON.parse(body);
    		// to be logged to console and appended to log.txt
            var movieResponse = '\n' + json.Title + '\n' + json.Year + '\n' + json.imdbRating + '\n' + json.Country +'\n' + json.Plot + '\n' + json.Actors + '\n'  ;
			//checks to see if the search found a movie, if not run function again with default
			if(json.Response =='True'){
   				// movieResponse to console
                console.log(movieResponse);
   				// append movieResponse to log.txt
                fs.appendFile("log.txt", movieResponse , function(err){
					if(err){
					console.log(err);
					}
    			});
    		}
			else{omdb("mr nobody")};
		}
	});
}
// function that reads random.txt and executes whatever is in that file
function dowhatitsays(){
	fs.readFile('./random.txt',"utf8" , function(err,data){
		//makes data into and array
        var output = data.split(',');
		// run function with first and second elements of output array as arguments
        run(output[0],output[1]);
	});
}
// function to check if item is a JSON
function isJSON (x) {
    // if not a string then turn into one
    if (typeof x != 'string')
        x = JSON.stringify(x);
    // parse string as JSON if it can then return true
    try {
        JSON.parse(x);
        return true;
    // if try command fails return false
    } catch (e) {
        return false;
    }
}

// run is run with arguments from command line
run(command,argument);


