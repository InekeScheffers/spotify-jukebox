$( document ).ready(() => {
	$('#add-track').on( "click", () => {
		let track_id = $('#track_id').val();

		$.post("/add-track", {track_id: track_id}, (data) => {
			console.log(data);
		});
	});

	// recursive function, calls itself
	const reloadIframe = () => {
		setTimeout(() => { 
			 $('#spotify_player').attr("src", $('#spotify_player').attr("src"));
			 reloadIframe();
		}, 10000);
	}

	reloadIframe();
});