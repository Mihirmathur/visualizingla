var canvas = d3.select('#grid');

var startingSequence = true;

var canvasWidth = canvas.node().getBoundingClientRect().width;
var canvasHeight = canvas.node().getBoundingClientRect().height;

var width = 10, height = 10,
    off = 3, buildingSpacing = 10;

var colors = ['#dad83a', '#ed494b']; //[yellow, pink]

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
            .style('stroke', colors[Math.floor(Math.random() * colors.length)])
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
            .attr('xTrans', 0)
            .attr('yTrans', 0);
}

function flyIn(d){
    d3.select(this)
        .transition()
        .ease('cubic')
        .delay(1000)
        .duration(600)
            .attr('transform', function(d){
                return 'translate(' + d.xOffset + ', ' + d.yOffset + ')';
            })
            .attr('xTrans', 0)
            .attr('yTrans', 0)
            .style('fill', '#000')
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
                    .attr('data-0', '@y: ' + y)
                    .attr('data-50', '@y:' + (y-1000*Math.random()))
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
        'height' : 180,
        'width' : 60
    }
]);

$(document).ready(function() {

    var winWidth = $(window).width();
    $('.title-container').css('width', winWidth);
    $('.grid-wrapper').css('width', winWidth);

    var gridDone = false;
    enter();

    var s = skrollr.init({
        forceHeight: false,
        smoothScrolling: false,
        render: function() {
            /*if ( $('.building').hasClass('skrollable-after') ) {
                if ( ! gridDone ) {
                    gridDone = true;
                    exit();
                }
            }else if (gridDone){
                gridDone = false;
                enter();
            }*/
        }
    });

    skrollr.menu.init(s);

    $('.nav-box').click(function() {
        $('.nav-box').removeClass('active');
        $(this).toggleClass('active');
    });

    $('.title-container').css('opacity', '1');

    var sectionArray = [];
    var activeSessionID = '';

    $(window).scroll(function() {
        sectionArray = ($('[id^="section"]').toArray());

        sectionArray.forEach(function(section) {
            if ($(section).hasClass('skrollable-between')) {
                activeSessionID = $(section).attr('id');
                $('a[href="#' + activeSessionID + '"').trigger('click');

            }
        });
    });
});
