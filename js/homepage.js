//var canvas = d3.select('#grid');

var startingSequence = true;

//var canvasWidth = canvas.node().getBoundingClientRect().width;
//var canvasHeight = canvas.node().getBoundingClientRect().height;

var sectionWidth = d3.select('#section-1').node().getBoundingClientRect().width;
var sectionHeight = d3.select('#section-1').node().getBoundingClientRect().height;

var winWidth = $(window).width();
var winHeight = $(window).height();

var width = 5, height = 5,
    off = 3, buildingSpacing = 10;
var continueSquaresMovement = true;

var colors = ['#fff', '#000'];
var colorScale = d3.scale.linear()
                .domain([0, 1])
                .range(['#fff', '#222']);

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
            fill: colorScale(rand),          //smaller rand = whiter & more in front
            duration: (rand+0.001) * 2000 + 2000,       //smaller rand = slower
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

initSquaresRandomly(500);

/*
function initSingleBuilding(buildingHeight, buildingWidth) {
    var data = new Array();
    var xpos = 1, ypos = 1;

    var xOffset = 0,
        yOffset = 0;
    var xTrans = 0,
        yTrans = 0;

    for (var row = 0; row < buildingHeight/(height + off); row++) {
        data.push(new Array());
        for (var col = 0; col < buildingWidth/(width + off); col++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width - off,
                height: height - off,
                xOffset: xOffset,
                yOffset: yOffset,
                xTrans: xTrans,
                yTrans: yTrans
            })
            xOffset += off;
            xpos += width;
        }
        xOffset = 0;
        yOffset += off;
        xpos = 1;
        ypos += height;
    }
    return data;
}

function flyOut(d){
    var xOff = 30/(Math.random() - 0.5);
    var yOff = 30/(Math.random() - 0.5);
    d3.select(this)
        .attr('xTrans', function(d){return xOff;})
        .attr('yTrans', function(d){return yOff;})
        .transition()
        .ease('cubic')
        .duration(1000)
            .attr('transform', 'translate(' + xOff + ', ' + yOff + ')')
            .style('fill', 'none')
            //.style('stroke', colors[Math.floor(Math.random() * colors.length)])
            .style('stroke', '#fff')
            .style('stroke-width', '1');
}

function flyInAfterHover(d){
    d3.select(this)
        .transition()
        .ease('cubic')
        .delay(1000)
        .duration(400)
            .attr('transform', function(d){
                return 'translate(' + d.xOffset + ', ' + d.yOffset + ')';
            })
            .style('stroke', '#fff')
            .attr('xTrans', 0)
            .attr('yTrans', 0);
}

function flyIn(d){
    d3.select(this)
        .transition()
        .ease('cubic')
        .delay(1000)
        .duration(2000)
            .attr('transform', function(d){
                return 'translate(' + d.xOffset + ', ' + d.yOffset + ')';
            })
            .attr('xTrans', 0)
            .attr('yTrans', 0)
            .style('fill', '#fff')
            .style('stroke', 'none');
}

function initAllBuildings(arr){
    var left = 0;

    for (building of arr){
        var gridData = initSingleBuilding(building.height, building.width);
        var y = canvasHeight - gridData.length * (width + off);

        var row = grid.append('svg')
                    .classed('building', true)
                    .attr('height', building.height)
                    .attr('width', building.width)
                    .attr('x', left)
                    .attr('y', y)
                    //.attr('data-0', '@y: ' + y)
                    //.attr('data-50', '@y:' + (y-1000*Math.random()))
                .selectAll('.row')
                .data(gridData)
                .enter().append('g')
                    .attr('class', 'row');

        var col = row.selectAll('rect')
                .data(function(d) {return d;})
                .enter().append('rect')
                    .attr('id', function(d, i) {return 'rect' + i;})
                    .attr('x', function(d) {return d.x;})
                    .attr('y', function(d) {return d.y;})
                    .attr('width', function(d) {return d.width + off;})
                    .attr('height', function(d) {return d.height + off;})
                    .attr('transform', function(d) {
                        var xOff = 30/(Math.random() - 0.5);
                        var yOff = 30/(Math.random() - 0.5);
                        d.xTrans = xOff + d.xOffset;
                        d.yTrans = yOff + d.yOffset;
                        return 'translate(' + xOff + ', ' + yOff + ')';
                    })
                    .style('fill', colors[Math.floor(Math.random() * colors.length)])
                    .on('mouseover', flyOut)
                    .on('mouseout', flyInAfterHover);

        left += gridData[0].length * (width + off) + buildingSpacing;
    }

}

function exit(){
    d3.selectAll('rect').each(flyOut);
}

function enter(){
    d3.selectAll('rect').each(flyIn);
    startingSequence = false;
}

var grid = canvas
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .classed('canvas', true);

initAllBuildings([
    {
        'height' : 280,
        'width' : 80
    },
    {
        'height' : 470,
        'width' : 40
    },
    {
        'height' : 420,
        'width' : 120
    },
    {
        'height' : 520,
        'width' : 100
    },
    {
        'height' : 330,
        'width' : 70
    },
    {
        'height' : 220,
        'width' : 60
    },
    {
        'height' : 470,
        'width' : 80
    }
]);*/

$(document).ready(function() {

    var s = skrollr.init({
        forceHeight: false,
        smoothScrolling: false,
        //TODO: trigger mouseclick on scrolling to section
    });

    skrollr.menu.init(s);

    /*POSITIONING START*/

    $('.main-centered').css('width', winWidth);
    $('.title-text-wrapper').css({'width': winWidth});
    $('.mid-top').css({'top' : winHeight * 0.5});
    $('.mid-left').css({'left' : winWidth * 0.5});

    /*POSITIONING END*/

    /*NAVIGATION START*/
    $('.nav-box').click(function() {
        $('.nav-box').removeClass('active');
        $(this).addClass('active');
    });

    var sectionArray = [];
    var activeSessionID = '';

    $(window).scroll(function() {

        var top = $(document).scrollTop();

        /*if(top > 1000 && top < 2500){
            $('a[href=#section-1').trigger('click');
        }*/

        sectionArray = ($('[id^="section"]').toArray());

        sectionArray.forEach(function(section) {
            if ($(section).hasClass('skrollable-between')) {
                activeSessionID = $(section).attr('id');
                $('a[href="#' + activeSessionID + '"').trigger('click');

            }
        });
    });

    /*NAVIGATION END*/

    $('.title-text-wrapper').delay(2000)
                            .animate({
                                'margin-top': '0px',
                                'opacity' : 1
                            }, 1000);
});
