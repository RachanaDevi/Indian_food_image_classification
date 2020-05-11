var about_project_dropdown= $("#dropdown_menu");
$(document).ready( function() {
    if ( $(window).width() < 992) {
    	
     $('#dropdown_menu').removeClass('dropdown-menu');
    }
    else {
    	$('#dropdown_menu').addClass('dropdown-menu');
    }
 });

 $(window).resize(function() {
    /*If browser resized, check width again */
    if ($(window).width() < 992) {
    	
    $('#dropdown_menu').removeClass('dropdown-menu');
    }
    else {
    	
    		$('#dropdown_menu').addClass('dropdown-menu');
    }
 });