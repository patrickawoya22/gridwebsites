$(document).ready(function() {
    var owl = $('#owl-one');
    owl.owlCarousel({
        items: 4,
        loop: true,
        margin: 0,
        center: false,
        autoplay: false,
        autoWidth:true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true
    });

    $('.play').on('click', function() {
      owl.trigger('play.owl.autoplay', [1000])
    })
    $('.stop').on('click', function() {
      owl.trigger('stop.owl.autoplay')
    });

    var owl2 = $('#owl-two');
    owl2.owlCarousel({
        loop: true,
        autoplay: true,
        margin: 20,
        autoplayTimeout: 9000,
        responsiveClass: true,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                nav: true
            },
            600: {
                items: 1,
                nav: true
            },
            1000: {
                items: 2,
                nav: true
            }
        }
    });

    $('.play').on('click', function() {
      owl2.trigger('play.owl.autoplay', [1000])
    })
    $('.stop').on('click', function() {
      owl2.trigger('stop.owl.autoplay')
    });
});
