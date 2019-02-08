
// Used to maintain the size of the Cards Column viewer that it only goes to the bottom of the screen
$(document).ready(function() { // Do it when the document is ready
  	max = $(document).height() - $('#cardRow').offset().top; // document height - offset from top of 
  	// the card div = the height remaining that should be it's height
	$('#cardRow').css('max-height',max);
});
$(window).resize(function() { // and do it whenever the document has been resized
	max = $(document).height() - $('#cardRow').offset().top; 
	$('#cardRow').css('max-height',max);
});
