var canvas = d3.select('.fixed-over-squares');

var canvasWidth = canvas.node().getBoundingClientRect().width;
var canvasHeight = canvas.node().getBoundingClientRect().height;

var width = 20, height = 20,
    off = 0;

function initGrid(gridHeight, gridWidth) {
    var data = new Array();
    var xpos = 1, ypos = 1;

    var xOffset = 0,
        yOffset = 0;
    var xTrans = 0,
        yTrans = 0;

    for (var row = 0; row < gridHeight/(height + off); row++) {
        data.push(new Array());
        for (var col = 0; col < gridWidth/(width + off); col++) {
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
        .duration(600)
            .attr('transform', 'translate(' + xOff + ', ' + yOff + ')')
            .style('fill', rgba(0,0,0,0.1))
            .style('z-index', '100');
}

function flyIn(d){
    d3.select(this)
        .transition()
        .ease('cubic')
        .delay(200)
        .duration(200)
            .attr('transform', function(d){
                return 'translate(' - d.xOffset + ', ' - d.yOffset + ')';
            })
            .attr('xTrans', 0)
            .attr('yTrans', 0)
            .style('z-index', '1');
}
function initAll(){

    var gridData = initGrid(canvasHeight, canvasWidth);

    var row = grid.append('svg')
                .attr('height', canvasHeight)
                .attr('width', canvasWidth)
                .attr('x', 0)
                .attr('y', 0)
            .selectAll('.row')
            .data(gridData)
            .enter().append('g')
                .attr('class', 'row');

    var col = row.selectAll('rect')
            .data(function(d) {return d;})
            .enter().append('rect')
                .attr('id', function(d, i) {return 'rect' + i;})
                .attr('x', function(d) {return d.x + d.xOffset;})
                .attr('y', function(d) {return d.y + d.yOffset;})
                .attr('width', function(d) {return d.width + off;})
                .attr('height', function(d) {return d.height + off;})
                .style('fill', 'rgba(0,0,0,0.4)')
                .on('mouseover', flyOut)
                .on('mouseout', flyIn);

}

var grid = canvas
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .classed('canvas', true);

initAll();