/*
    Hexmap.js - a wrapper for the D3 hexbin library

    Tesselates an image using hexagons
*/

(function() {

var hexmap = function() {
    /*
        Setting up parameters for the hexagon svg container
    */
    var width = 1260,
        height = 600;

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
        Threshold values for filtering out certain colors (e.g. white from base image)
        Tolerance is used to deal with any sort of artifacting when determining if a
        hexagon belongs to a specific country
    */
    var thresh = 120,
        tolerance = 30;

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
        .x(d => d[0])
        .y(d => d[1])
        .interpolate("basis");

    /*
        svg element to hold all the hexagons.
            - a group is appended to the <svg> to hold the hexagons
            - prepend it to the body
    */
    var svg = d3.select("#hexcontainer").insert("svg", ":first-child")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var worldMap = document.getElementById('worldMap');
    var canvas = document.getElementById('worldCanvas');
    canvas.width =  width;
    canvas.height = height;
    var ctx = canvas.getContext('2d')
    var points = [];
    var airports = {};
    var airportTraffic = {
        "London": 1837000,
        "Seoul": 1083522,
        "Japan": 1102172,
        "Taipei": 946426,
        "Sydney": 934215,
        "Vancouver": 896490,
        "Guadalajara": 746017,
        "MexicoCity": 725575,
        "Toronto": 619227,
        "Paris": 579311
    };
    var avgTraffic = 946996;
    var countries = {
        "Asia": [],
        "Africa": [],
        "Australia": [],
        "NorthAmerica": [],
        "SouthAmerica": [],
        "Europe": []
    };
    var portToCountry = {
        "London": "Europe",
        "LA": "NorthAmerica",
        "Seoul": "Asia",
        "Japan": "Asia",
        "Taipei": "Asia",
        "Sydney": "Australia",
        "Vancouver": "NorthAmerica",
        "Guadalajara": "SouthAmerica",
        "MexicoCity": "SouthAmerica",
        "Toronto": "NorthAmerica",
        "Paris": "Europe"
    };

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

                // Grouping the contries based on their color
                // Asia
                if ((pixR < 102 + tolerance && pixR > 102 - tolerance) &&
                   (pixG < 153 + tolerance && pixG > 153 - tolerance) &&
                   (pixB < 102 + tolerance && pixB > 102 - tolerance)) {
                    countries["Asia"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }
                // Africa
                else if ((pixR < 204 + tolerance && pixR > 204 - tolerance) &&
                   (pixG < 102 + tolerance && pixG > 102 - tolerance) &&
                   (pixB < 153 + tolerance && pixB > 153 - tolerance)) {
                    countries["Africa"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }
                // Australia
                else if ((pixR < 255 + tolerance && pixR > 255 - tolerance) &&
                   (pixG < 51 + tolerance && pixG > 51 - tolerance) &&
                   (pixB < 51 + tolerance && pixB > 51 - tolerance)) {
                    countries["Australia"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }
                // NorthAmerica
                else if ((pixR < 255 + tolerance && pixR > 255 - tolerance) &&
                   (pixG < 153 + tolerance && pixG > 153 - tolerance) &&
                   (pixB < 51 + tolerance && pixB > 51 - tolerance)) {
                    countries["NorthAmerica"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }
                // SouthAmerica
                else if ((pixR < 102 + tolerance && pixR > 102 - tolerance) &&
                   (pixG < 102 + tolerance && pixG > 102 - tolerance) &&
                   (pixB < 153 + tolerance && pixB > 153 - tolerance)) {
                    countries["SouthAmerica"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }
                // Europe
                else if ((pixR < 255 + tolerance && pixR > 255 - tolerance) &&
                   (pixG < 204 + tolerance && pixG > 204 - tolerance) &&
                   (pixB < 102 + tolerance && pixB > 102 - tolerance)) {
                    countries["Europe"].push([Math.floor(x), Math.floor(y), pixR, pixG, pixB, .05])
                }

                // Finding airports and adding them to the points list
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
                    airports["MexicoCity"] = [Math.floor(x), Math.floor(y)];
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
            }
        }
        drawCountry("Asia", .05);
        drawCountry("Africa", .05);
        drawCountry("Australia", .05);
        drawCountry("NorthAmerica", .05);
        drawCountry("SouthAmerica", .05);
        drawCountry("Europe", .05);
        drawHexagons();
        drawFlightPaths();
    }

    /*
        Adds the created hexagons to the SVG element.
    */
    function drawCountry(name, opacity) {
        svg.insert("g", ":first-child")
            .selectAll("."+ name + "hexagons")
            .data(hexbin(countries[name]))
            .enter().append("path")
            .attr("class", name+"hexagon")
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
                        opacity + ")"
                 }
             });
    }

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
        for (let key in airports) {
            if (key != "LA") {
                let svgPath = document.getElementById(key);
                svgPath.addEventListener("mouseover", () => console.log("test"));
            }
        }
    }

    /*
        Creates illusion/representations of planes flying from LAX to other countries
    */
    function animateFlightPath(airport, rate) {
        let curSvg = d3.select("#hexcontainer").select("svg");
        let particleFlightPath = curSvg.select("path#"+airport);
        startPoint = pathStartPoint(particleFlightPath);

        let marker = curSvg.append("circle");
        marker.attr("r", 5)
            .attr("id", airport + "marker")
            .attr("fill", "#FFF")
            .attr("transform", "translate(" + startPoint +")");
        transition(airport, marker, particleFlightPath, airportTraffic[airport]/avgTraffic);
    }
    function pathStartPoint(path) {
        let d = path.attr("d");
        let start = d.split("L")[0].split("M")[1];
        return start;
    }
    function transition(airport, marker, path, rate) {
        let len = path.node().getTotalLength();
        marker.transition()
            .duration(7500/(rate*1.5))
            .attrTween("transform", translateAlong(path.node()))
            .each("end", () => {
                // Remove the previously added 'plane'
                d3.select("#"+airport+"marker").remove();

                // Keep looping more planes
                animateFlightPath(airport, rate);

                // Illuminate the country that it lands on
                let curSvg = d3.select("#hexcontainer");
                // curSvg.selectAll("path."+portToCountry[airport]+"hexagon").remove();
                // drawCountry(portToCountry[airport], 1);
                curSvg.selectAll("path."+portToCountry[airport]+"hexagon").classed("pulse", true);
                curSvg.selectAll("path."+portToCountry[airport]+"hexagon").classed("pulse", true);
            });
    }
    function translateAlong(path) {
        let len = path.getTotalLength();
        return function(i) {
            return function(t) {
                let pt = path.getPointAtLength(t * len);
                return "translate(" + pt.x + "," + pt.y + ")";
            }
        }
    }

    /*
        Draws arcs from LAX to the top 10 international airports in terms of passenger count
    */
    function drawFlightPaths() {
        let laxCoords = airports["LA"];
        console.log(airports);
        for (let key in airports) {
            let midpoint = (laxCoords[0] + airports[key][0]) / 2;
            let liftPath = laxCoords[1] - 100;
            if (laxCoords[0] == airports[key][0]) {
                midpoint -= 60;
                liftPath += 60;
            }
            if (key != "LA") {
                svg.append("path")
                    .attr("d", flightPath([laxCoords, [midpoint, liftPath], airports[key]]))
                    .attr("stroke", "rgba(255,255,255,.2)")
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
                animateFlightPath(key, 1);
            }
        }
        addPathListeners();
    }
};

hexmap();
})();
