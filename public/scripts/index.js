function selectSingleFile(file) {
            const name = file[0].name;
            document.getElementById("file-label").textContent = name;
}

$(document).ready(function() {
    $('a[href*=\\#about-project]').on('click', function(e){
        // e.preventDefault(); //this is to hide the id on the url
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});


$(document).ready(function() {
    $('a[href*=\\#motivation]').on('click', function(e){
        // e.preventDefault();
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});


$(document).ready(function() {
    $('a[href*=\\#timeline_chart]').on('click', function(e){
        // e.preventDefault();
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top
        }, 1500);
    });
});