$(function() {

	$("#ms-temp-menu").load("./templates/menu.html #mfx-menu", function () {
		var template = document.getElementById('mfx-menu').innerHTML;
		var output = Mustache.render(template);
		$("#ms-temp-menu").html(output);
	});


});
