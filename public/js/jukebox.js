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
	//console.log(window.location.origin);

	// before the user closes /jukebox (by closing tab, browser, reload or back-button)
	$(window).on('beforeunload', () => {
		// end this jukebox so remote can't endlessly add tracks to your spotify playlist
		$.get( "/end-jukebox");
		// chrome doesn't shows this, but their default 'are you sure'-confirm box
		return 'Your jukebox will be ended when you leave this page.';
	});

	// needs to be on, for confirm-box to show
	$(window).on("unload", (event) => {

	});
};