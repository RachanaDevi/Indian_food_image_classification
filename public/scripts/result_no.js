$(function() {
    $('input[id="other_option"]').on('click', function() {
    	console.log("THIS WAS TRIGGERED");
    	console.log($(this));
        if ($(this).val() == 'other_option') {
            $('#other_option_text').show();
        }
        else {
            $('#other_option_text').hide();
        }
    });
});


