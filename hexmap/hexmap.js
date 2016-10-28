/* 
    Setting up parameters for the hexagon svg container
*/
var width = 1260,
    height = 600;

/*
    Calculating the geometry of the hexagons:
        radius - proportional to the width of the screen
        hexHeight - 2 times the radius
        hexWidth - sqrt(3)/2 * the height (distance to center of flat edge)
        vertDiff - vertical offset between rows of hexagons
        horizDiff - horizontal offset between coluns of hexagons
*/
var radius = width / 150,
    hexHeight = 2 * radius,
    hexWidth = Math.sqrt(3)/2 * hexHeight
    vertDiff = hexHeight * 3/4,
    horizDiff = hexWidth;

/*
    Setting up the size of the hexbix container and radius of each hexagon
*/
var hexbin = d3.hexbin()
    .size([width, height])
    .radius(radius);

/*
    Using a mercator projection to visualize the globe on a flat map
*/
var projection = d3.geo.mercator()
    .scale(1000)
    .translate([width / 2, height / 2])
    .precision(.1);

/*
    Setting up the type of path to be used based on the selected projection
*/
var path = d3.geo.path()
    .projection(projection);

/* 
    svg element to hold all the hexagons.
        - a group is appended to the <svg> to hold the hexagons
        - prepend it to the body
*/
var svg = d3.select("body").insert("svg", ":first-child")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var worldMap = document.getElementById('worldMap');
var canvas = document.getElementById('worldCanvas');
canvas.width =  width;
canvas.height = height;
var ctx = canvas.getContext('2d')
var points = [];

/*
    Load the template image which we will mimic with hexagons
*/
var logoImg = new Image();
logoImg.src = "bwmap.jpg";
logoImg.onload = function() {
    ctx.drawImage(logoImg, 0, 0, width, height);
    placeHexagons();
};

/*
    Function to place hexagons on non-white or colored parts of an image.
    
    How it works: Then using the 'imageData' properties of the image drawn on the canvas,
        look at the pixel color at each center of a hexagon. If this point is not white,
        place a hexagon there. (This can be changed to look for specific colors to
        distinguish between different continents)
*/
function placeHexagons() {
    for (let x = hexWidth; x < canvas.width; x+=hexWidth) {
        for (let y = vertDiff; y < canvas.height; y+=vertDiff) {
            let data = ctx.getImageData(x, y, 1, 1).data;
            if (data[0] < 240) {
                if (x < width - hexWidth &&
                    y < height - hexHeight) {
                    points.push([Math.floor(x), Math.floor(y)]);
                }
            }
        }
    }

    svg.append("g")
       .selectAll(".hexagons")
       .data(hexbin(points))
       .enter().append("path")
       .attr("class", "hexagon")
       .attr("d", (d) => { return hexbin.hexagon() }) 
       .attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")" })
       .attr("stroke", "#fff")
       .attr("stroke-width", "2px")
       .style("fill", (d) => { return "#2a5c5c" });
}
