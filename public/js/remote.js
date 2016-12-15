//when on page with #jukebox on body, so it only triggers on jukebox page not others
if($('#remote').length > 0) {
	
	// function to delay calls to the api
	const delay = (() => {
		let timer = 0;
		return (callback, ms) =>{
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	  };
	})();	

	//autocomplete search user, listening to when there's a keyup in input field
	$( "#search" ).on('keyup', (event) => {
		//test if you can console.log the whole string in the input field
		//console.log(event.target.value)

		// call function delay, with delay of 500 milliseconds.. so checks when user's last keyup was 500 ms ago
		// so only does api call when user pauses/finishes search query
		delay(() => {
			let inputSearch = event.target.value;

			// if field is not empty
			if(inputSearch != '') {
				// the callback gets its data from spotify api
				$.get(`https://api.spotify.com/v1/search?q=${inputSearch}&type=track`, (data) => {
					console.log(data)
					// if there are tracks
					if(data.tracks.items.length > 0){
						// first set datalist with #results to empty again when request is made so it's not just appended and added to last result
						$('#results').empty();
						// loop through result
						for (let i = 0; i < data.tracks.items.length; i++) {
							// store path to artist
							let artist = data.tracks.items[i].artists[0];
							// store path to track		  					
							let track = data.tracks.items[i];
							// store path to album
							let album = data.tracks.items[i].album;
							// append track id + name to list #results
							$('#results').append(`<li><button data-trackId=${track.id} class="btn btn-success"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button> ${artist.name} - ${track.name} - ${album.name}</li>`)
						}
					}
				});
			} else {
				// when input field is empty, empty results
  				$('#results').empty();
			}
		}, 500);
	});

	// in es6 arrow function this refers to the outer scope 
	// so in this case we need the es5 function
	// listen to on click of add button, then add track via ajax post request
	$("#results").on('click', 'button', function() {
		//console.log($(this).attr('data-trackId'));

		// store track_id in var, track_id is value in input field with id track_id
		let track_id = $(this).attr('data-trackId');

		// ajax post to add-track, so page isn't reloaded, but track is added
		// data is the callback, so what's send back after success from add-track.js on server
		$.post(window.location.href, {track_id: track_id}, (data) => {
			// if jukebox doesn't exist anymore in database, gets redirect, then sets window.location.href to / + message
			if(data.redirect) {
				window.location.href = data.redirect; 
			} else {
				// logs if track is added or not
				// console.log(data);
				// shows message if it's added or not
				$('#track-message').append(data.message)
			}			
		});
	});








};