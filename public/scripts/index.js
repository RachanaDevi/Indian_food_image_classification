$(document).ready(function() {
    $('a[href*=\\#about-project]').on('click', function(e){
        e.preventDefault();
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});