<<<<<<< HEAD
/*
    Setting up parameters for the hexagon svg container
*/
var width = 1260,
    height = 600;
=======
(function() {
    // TODO:
    // - A Way to access a certain hexagon on the grid (get color, set color)
    // - Function to process 'points' to group them by color, then
    //      have functions to perform operations on that group
    //      possibly by adjusting the 'class' attribute of a specific group
var hexmap = function() {
    /*
        Setting up parameters for the hexagon svg container
    */
    var width = 1260,
        height = 600;
>>>>>>> 982c85f8afb44f174ea052a2428fb8981c2dfb2d

    /*
        Flag which should be set if the result should be monochromatic. Defaults
        to matching the color of the image, or uses a default mono color of black.
            (sample palette:
                fill: rgba(108,191,132,1)
                stroke&background: rgba(50,51,57))
    */
    var mono = false,
        monoColor = "0,0,0,255";

    /*
        Calculating the geometry of the hexagons:
            radius - proportional to the width of the screen
            hexHeight - 2 times the radius
            hexWidth - sqrt(3)/2 * the height (distance to center of flat edge)
            vertDiff - vertical offset between rows of hexagons
            horizDiff - horizontal offset between coluns of hexagons
    */
    var radius = width / 220,
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
        Creating template for the flight paths between airports
    */
    var flightPath = d3.svg.line()
        .x(d => {console.log(d[0]); return d[0];})
        .y(d => d[1])
        .interpolate("basis");

<<<<<<< HEAD
/*
    svg element to hold all the hexagons.
        - a group is appended to the <svg> to hold the hexagons
        - prepend it to the body
*/
var svg = d3.select("body").insert("svg", ":first-child")
    .attr("width", width)
    .attr("height", height)
    .append("g");
=======
    /*
        svg element to hold all the hexagons.
            - a group is appended to the <svg> to hold the hexagons
            - prepend it to the body
    */
    var svg = d3.select("#hexcontainer").insert("svg", ":first-child")
        .attr("width", width)
        .attr("height", height)
        .append("g");
>>>>>>> 982c85f8afb44f174ea052a2428fb8981c2dfb2d

    var worldMap = document.getElementById('worldMap');
    var canvas = document.getElementById('worldCanvas');
    canvas.width =  width;
    canvas.height = height;
    var ctx = canvas.getContext('2d')
    var points = [];
    var airports = {};

    /*
        Load the template image which we will mimic with hexagons
    */
    var logoImg = new Image();
    logoImg.src = "colormap3.gif";
    logoImg.onload = function() {
        ctx.drawImage(logoImg, 0, 0, width, height);
        createHexagons();
    };

    /*
        Function to create a grid of hexagons based on an image.

<<<<<<< HEAD
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
            let pixR = data[0];
            let pixG = data[1];
            let pixB = data[2];
            let pixA = data[3];
=======
        How it works: Then using the 'imageData' properties of the image drawn on the canvas,
            look at the pixel color at each center of a hexagon. If this point is not white,
            place a hexagon there. (This can be changed to look for specific colors to
            distinguish between different continents)
    */
    function createHexagons() {
        for (let x = hexWidth; x < canvas.width; x+=hexWidth) {
            for (let y = vertDiff; y < canvas.height; y+=vertDiff) {
                let data = ctx.getImageData(x, y, 1, 1).data;
                let pixR = data[0];
                let pixG = data[1];
                let pixB = data[2];
                let pixA = data[3];
>>>>>>> 982c85f8afb44f174ea052a2428fb8981c2dfb2d

                // Filtering out pixels of a specific color according to the threshold
                let thresh = 120;
                if (Math.floor(x/hexWidth) == 58 && Math.floor(y/vertDiff) == 15) {
                    // London (Heathrow)
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["London"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 23 && Math.floor(y/vertDiff) == 20) {
                    // LAX
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["LA"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 100 && Math.floor(y/vertDiff) == 20) {
                    // Seoul (Incheon)
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Seoul"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 104 && Math.floor(y/vertDiff) == 21) {
                    // Japan (Nartia)
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Japan"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 98 && Math.floor(y/vertDiff) == 24) {
                    // Taipei (Taoyuan)
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Taipei"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 107 && Math.floor(y/vertDiff) == 42) {
                    // Sydney
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Sydney"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 23 && Math.floor(y/vertDiff) == 17) {
                    // Vancouver
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Vancouver"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 30 && Math.floor(y/vertDiff) == 27) {
                    // Guadalajara
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Guadalajara"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 29 && Math.floor(y/vertDiff) == 26) {
                    // Mexico City
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Mexico City"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 35 && Math.floor(y/vertDiff) == 18) {
                    // Toronto
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Toronto"] = [Math.floor(x), Math.floor(y)];
                }
                else if (Math.floor(x/hexWidth) == 62 && Math.floor(y/vertDiff) == 17) {
                    // Paris
                    points.push([Math.floor(x), Math.floor(y), 255, 255, 255, 255]);
                    airports["Paris"] = [Math.floor(x), Math.floor(y)];
                }
                else if (!(data[0] > thresh && data[1] > thresh && data[2] > thresh)) {
                    if (x < width - hexWidth &&
                        y < height - hexHeight) {
                        points.push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, pixA]);
                    }
                }
            }
        }
        drawHexagons();
        drawFlightPaths();
    }

    /*
        Adds the created hexagons to the SVG element.
    */
    function drawHexagons() {
        svg.append("g")
            .selectAll(".hexagons")
            .data(hexbin(points))
            .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", d => hexbin.hexagon())
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
            .attr("stroke", "#323339")
            .attr("stroke-width", "1.5px")
            .style("fill", d => {
                 if (mono) {
                    return "rgba(" + monoColor + ")";
                 }
                 else {
                     return "rgba(" +
                         d[0][2] + "," +
                         d[0][3] + "," +
                         d[0][4] + "," +
                         d[0][5] + ")"
                 }
             });
    }

    /*
        Adding mouseover listeners to the flight paths to bring up a tooltip that displays
        passenger count
    */
    function addPathListeners() {
        console.log(airports);
        for (let key in airports) {
            if (key != "LA") {
                let svgPath = document.getElementById(key);
                console.log(svgPath);
                svgPath.addEventListener("mouseover", () => console.log("test"));
            }
        }
    }

    /*
        Draws arcs from LAX to the top 10 international airports in terms of passenger count
    */
    function drawFlightPaths() {
        let laxCoords = airports["LA"];
        for (let key in airports) {
            let midpoint = (laxCoords[0] + airports[key][0]) / 2;
            let liftPath = laxCoords[1] - 100;
            if (key != "LA") {
                svg.append("path")
                    .attr("d", flightPath([laxCoords, [midpoint, liftPath], airports[key]]))
                    .attr("stroke", "white")
                    .attr("stroke-width", 2.5)
                    .attr("fill", "none")
                    .attr("id", key)
                    .transition()
                        .duration(3000)
                        .attrTween("stroke-dasharray", function() {
                            let len = this.getTotalLength();
                            return function(t) {
                                return (d3.interpolateString("0," + len, len + ",0")) (t)
                            };
                    });
            }
        }
        addPathListeners();
    }
};

<<<<<<< HEAD
    svg.append("g")
       .selectAll(".hexagons")
       .data(hexbin(points))
       .enter().append("path")
       .attr("class", "hexagon")
       .attr("d", (d) => { return hexbin.hexagon() })
       .attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")" })
       .attr("stroke", "#323339")
       .attr("stroke-width", "1.5px")
       // .style("fill", (d) => { return "#6cbf84" });
       .style("fill", (d) => {
            return "rgba(" +
                    d[0][2] + "," +
                    d[0][3] + "," +
                    d[0][4] + "," +
                    d[0][5] + ")"
        });
}
=======
hexmap();
})();
>>>>>>> 982c85f8afb44f174ea052a2428fb8981c2dfb2d
