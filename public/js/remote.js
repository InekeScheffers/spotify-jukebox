//when on page with #jukebox on body, so it only triggers on jukebox page not others
if($('#remote').length > 0) {
	// run this when button with id add-track is clicked
	$('#add-track').on( "click", () => {
		// store track_id in var, track_id is value in input field with id track_id
		let track_id = $('#track_id').val();

		// ajax post to add-track, so page isn't reloaded, but track is added
		// data is the callback, so what's send back after success from add-track.js on server
		$.post("/add-track", {track_id: track_id}, (data) => {
			// logs if track is added, or it went wrong
			console.log(data);
		});
	});
};