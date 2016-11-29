var SquaresAnimator = (function () {
    var canvas = d3.select('.fixed-over-squares');

    var canvasWidth = canvas.node().getBoundingClientRect().width;
    var canvasHeight = canvas.node().getBoundingClientRect().height;

    var width = 15, height = 15;

    function initGrid(gridHeight, gridWidth) {
        var data = new Array();
        var xpos = 1, ypos = 1;

        var xOffset = 0,
            yOffset = 0;
        var xTrans = 0,
            yTrans = 0;

        for (var row = 0; row < gridHeight/height; row++) {
            data.push(new Array());
            for (var col = 0; col < gridWidth/width; col++) {
                data[row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    xOffset: xOffset,
                    yOffset: yOffset,
                    xTrans: xTrans,
                    yTrans: yTrans
                })
                xpos += width;
            }
            xOffset = 0;
            xpos = 1;
            ypos += height;
        }
        return data;
    }

    function flyOut(d){
        var xOff = 5/(Math.random() - 0.5);
        var yOff = 5/(Math.random() - 0.5);
        d3.select(this)
            .attr('xTrans', function(d){return xOff;})
            .attr('yTrans', function(d){return yOff;})
            .transition()
            .ease('cubic')
            .duration(200)
                .attr('transform', 'translate(' + xOff + ', ' + yOff + ')')
                .style('fill', 'rgba(0,0,0,1)')
                .style('z-index', '100');
    }

    function flyIn(d){
        d3.select(this)
            .transition()
            .ease('cubic')
            .delay(200)
            .duration(200)
                .attr('transform', function(d){
                    return 'translate(0,0)';
                })
                .attr('xTrans', 0)
                .attr('yTrans', 0)
                .style('fill', 'rgba(0,0,0,0.5)')
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
                    //.attr('id', function(d, i) {return 'rect' + i;})
                    .attr('x', function(d) {return d.x + d.xOffset;})
                    .attr('y', function(d) {return d.y + d.yOffset;})
                    .attr('width', function(d) {return d.width;})
                    .attr('height', function(d) {return d.height;})
                    .style('fill', 'rgba(0,0,0,0.5)')
                    .on('mouseover', flyOut)
                    .on('mouseout', flyIn);
    }

    function flyRight(){
        d3.select(this)
            .transition()
            .duration(1000)
                .attr('transform', 'translate(2000, 0)');
    }

    function changeBack(){
        d3.select(this)
            .transition()
            .duration(500)
            .attr('transform', 'translate(0, 0)')
            .style('fill', 'rgba(0,0,0,0.5)');
    }

    function allChange(change){
        d3.selectAll('.fixed-over-squares rect').each(change);
    }

    var grid = canvas
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .classed('canvas', true);

    return{
        init: initAll
    }
    
})();