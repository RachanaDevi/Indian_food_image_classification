$(function() {
    $('input[name="radios"]').on('click', function() {
    	console.log("THIS WAS TRIGGERED");
    	console.log($(this));
        if ($(this).val() == 'other_option') {
            $('#other_option').show();
        }
        else {
            $('#other_option').hide();
        }
    });
});