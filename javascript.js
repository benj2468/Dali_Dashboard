$(window).resize(function() {
	max = $(document).height() - $('#cardRow').offset().top;
	$('#cardRow').css('max-height',max-25);
	console.log('hi')
});
$(document).ready(function() {
  	max = $(document).height() - $('#cardRow').offset().top;
  	console.log($(document).height())
	$('#cardRow').css('max-height',max-25);
});
