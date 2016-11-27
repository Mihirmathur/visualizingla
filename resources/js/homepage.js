var sectionWidth = d3.select('#section-1').node().getBoundingClientRect().width;
var sectionHeight = d3.select('#section-1').node().getBoundingClientRect().height;

var winWidth = $(window).width();
var winHeight = $(window).height();

var width = 5, height = 5,
    off = 3, buildingSpacing = 10;
var continueSquaresMovement = true;

var colors = ['#F8C81C', '#D0021B'];
var colorScale = d3.scale.linear()
                .domain([0, 1])
                .range(['#fff', '#F8C81C']);

var background = d3.select('#section-1')
        .append('svg')
        .attr('width', sectionWidth)
        .attr('height', sectionHeight);

function initSquaresDataRandomely(number){
    var data = new Array();

    for(var i = 0; i < number; i++){
        var rand = Math.random();

        data.push({
            x: Math.random()*sectionWidth, 
            y: (1+Math.random())*sectionHeight,
            width: width,
            height: height,
            fill: '#F8C81C',          
            //fill: colors[Math.floor(Math.random()*colors.length)],
            //fill: colorScale(Math.random),            //smaller rand = whiter & more in front
            duration: (rand+0.001) * 3000 + 2000,       //smaller rand = slower
            opacity: 1 - rand
        });
    }

    return data;
}

function initSquaresRandomly(number){
    var squaresData = initSquaresDataRandomely(number);

    background.append('g').selectAll('rect')
        .data(squaresData)
        .enter()
        .append('rect')
            .attr('x', function(d) {return d.x;})
            .attr('y', function(d) {return d.y;})
            .attr('width', function(d) {return d.width;})
            .attr('height', function(d) {return d.height;})
            .style('fill', function(d) {return d.fill;})
            .style('opacity', function(d) {return d.opacity;})
            .transition()
                .each('start', function upwardsRepeat(){
                    if(continueSquaresMovement){
                        d3.select(this)
                            .transition()
                                .duration(function(d){return d.duration})
                                .ease('linear')
                                .attr('y', '-200')
                            .transition()
                                .duration(0)
                                .attr('y', sectionHeight + 50)
                            .transition()
                                .each('start', upwardsRepeat);
                    }
                });
}

initSquaresRandomly(300);

$(document).ready(function() {

    $('.pre-over').delay(100).fadeOut();

    var s = skrollr.init({
        forceHeight: false,
        smoothScrolling: true,
    });

    /*NAVIGATION START*/
    
    //smooth scroll
    $(function() {
      $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 1000);
            return false;
          }
        }
      });
    });

    var sectionArray = [];
    var activeSessionID = '';

    $(window).scroll(function() {

        var top = $(document).scrollTop();
        sectionArray = ($('[id^="section"]').toArray());

        sectionArray.forEach(function(section) {
            if ($(section).hasClass('skrollable-between')) {
                activeSessionID = '#' + $(section).attr('id') + '-a';

                $('.nav-box').removeClass('active');
                $('a[href="' + activeSessionID + '"]').addClass('active');

            }
        });
    });

    /*NAVIGATION END*/

    $('.title-text-wrapper').delay(2000)
                            .animate({
                                'margin-top': '-100px',
                                'opacity' : 1
                            }, 1000);  

    $('.info-box').mouseover(function(){
        allChange(flyRight);
    }).mouseout(function(){
        allChange(changeBack);
    });
});
