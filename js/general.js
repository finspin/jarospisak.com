$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

/******* CUSTOM STYLE ********/
// $('a[href="' + this.location.pathname + '"]').parents('li,ul').addClass('active');
$('.sidebar-nav a[href="' + this.location.pathname + '"]').addClass('active');
