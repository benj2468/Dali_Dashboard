$(window).resize(function() {
	max = $(document).height() - $('#cardRow').offset().top;
	$('#cardRow').css('max-height',max);
});
$(document).ready(function() {
  	max = $(document).height() - $('#cardRow').offset().top;
	$('#cardRow').css('max-height',max);
});
