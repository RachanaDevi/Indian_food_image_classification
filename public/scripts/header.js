var about_project_dropdown= $("#dropdown_menu");
$(document).ready( function() {
    if ( $(window).width() < 992) {
    	alert('WINDOW WIDTH LESS THAN');
     $('#dropdown_menu').removeClass('dropdown-menu');
    }
    else {
    	alert('WINDOW WIDTH GREATER THAN');
    	$('#dropdown_menu').addClass('dropdown-menu');
    }
 });

 $(window).resize(function() {
    /*If browser resized, check width again */
    if ($(window).width() < 992) {
    	alert('WINDOW WIDTH LESS THAN NEW');
    $('#dropdown_menu').removeClass('dropdown-menu');
    }
    else {
    	alert('WINDOW WIDTH GREATER THAN');
    		$('#dropdown_menu').addClass('dropdown-menu');
    }
 });