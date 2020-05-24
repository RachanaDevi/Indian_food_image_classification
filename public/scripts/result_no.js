$("#other_option_text").val("");

$(function() {
    $('input[id="other_option"]').on('click', function() {
    	console.log($(this));
        if ($(this).val() == 'other_option') {
            $('#other_option_text').show();
        }
        else {
            $('#other_option_text').hide();
        }
    });
});


