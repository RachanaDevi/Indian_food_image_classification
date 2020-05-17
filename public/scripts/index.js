$(document).ready(function() {
    $('a[href*=\\#about-project]').on('click', function(e){
        // e.preventDefault(); //this is to hide the id on the url
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});


$(document).ready(function() {
    $('a[href*=\\#food-categories]').on('click', function(e){
        // e.preventDefault();
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});