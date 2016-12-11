//when on page with #jukebox on body, so it only triggers on jukebox page not others
if($('#jukebox').length > 0) {
	// recursive function, calls itself
	const reloadIframe = () => {
		setTimeout(() => {
			// resets src so player is reloaded and you see added track, without reloading the page
			$('#spotify_player').attr("src", $('#spotify_player').attr("src"));
			reloadIframe();
			// every 10 secs
		}, 10000);
	};

	// first time call reloadIframe when document is ready
	reloadIframe();

	$('#origin').text(window.location.origin);
	console.log(window.location.origin);
};