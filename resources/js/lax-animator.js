var Animator = (function() {
    
    var STAGGER_TIME = 5.0;
    var CAR_TIME = 45.0;
    var FLIGHT_TIME = 45.0;

    var colors = {
        outgoingCar: "#F8C81C",
        incomingCar: "#D0021B",
        planes: "#061F38"
    }
    
    function spawnCar(parent, cls, color) {
        
        var car = d3.select(parent)
                    .append("g")
                    .attr("class", cls)
        
        car.append('path')
            .attr('fill', color)
            .attr('d', 'M117.784,128.363c0,6.169-2.904,11.169-6.899,11.169H88.106c-3.995,0-7.178-5-7.178-11.169V90.144l1.298-18.738c0-6.168,1.885-11.168,5.878-11.168h22.779c3.995,0,5.74,5,5.74,11.168l1.159,18.738V128.363z');
        car.append('path')
            .attr('fill', '#D2F8F9')
            .attr('d', 'M116.729,86.573c0.362,1.13-0.813,1.971-2.596,1.971H85.09c-1.781,0-2.958-0.841-2.596-1.971l0.252-0.743c0.336-1.052,1.92-1.815,3.553-1.815h26.622c1.635,0,3.218,0.763,3.555,1.815L116.729,86.573z');
        car.append('path')
            .attr('fill', '#D2F8F9')
            .attr('d', 'M116.729,119.932c0.362-1.766-0.813-3.08-2.596-3.08H85.09c-1.781,0-2.958,1.314-2.596,3.08l0.252,1.302c0.336,1.644,1.92,2.978,3.554,2.978h26.622c1.635,0,3.218-1.333,3.555-2.978L116.729,119.932z');
    }
    
    function spawnPlane(parent, cls, color) {
        var plane = d3.select(parent)
            .append('g')
            .attr('class', cls)
            
            plane.append('path')
            .attr('fill', colors.planes)
            .attr('d', 'M16.985,66.584V64l7.992,2.997L32.971,64c0,0,0,3.17,0,2.584l-4.996,6.407 c0,0,0.409,22.077,1.409,22.077c1.056,0,20.571-10.549,20.571-10.549s0,1.238,0,3.165l-20.571,22.155 c0,0-0.411,28.096-1.409,29.094c-0.998,2-4.977,2-5.977,0c-0.998-0.998-1.637-28.096-2.637-29.094L0,87.684v-3.165 c0,0,18.363,10.549,19.362,10.549c1,0,1.62-22.077,1.62-22.077L16.985,66.584z');
    }
    
    function spawnIncomingCars(num, selector) {
        for (var i = 0; i < num; i++) {
            spawnCar(selector, "car-in", colors.incomingCar);
        }
    }
    
    function spawnOutgoingCars(num, selector) {
        for (var i = 0; i < num; i++) {
            spawnCar(selector, "car-out", colors.outgoingCar);
        }
    }
    
    function spawnPlanesIn(num, selector) {
        for (var i = 0; i < num; i++) {
            spawnPlane(selector, "plane-in", colors.planes);
        }
    }
    
    function spawnPlanesOut(num, selector) {
        for (var i = 0; i < num; i++) {
            spawnPlane(selector, "plane-out", colors.planes);
        }
    }
    
    function animateIncomingCars() {
        TweenMax.to(".car-in", 0, {
            rotation: (90),
            transformOrigin: "50% 50%",
            x: -300,
            scaleX: (0.3),
            scaleY: (0.3)
        });
        
        var path = MorphSVGPlugin.pathDataToBezier("#vinPath", { align: ".car-in" });
        
        TweenMax.set(".car-in", {
            xPercent: -50,
            yPercent: -50
        });
        
        TweenMax.staggerTo(".car-in", CAR_TIME, {
            bezier: {
                values: path,
                type: "cubic",
                autoRotate: 90
            },
            ease: Linear.easeNone,
            repeat: -1,
        }, STAGGER_TIME);
    }
    
    function animateOutgoingCars() {
        TweenMax.to(".car-out", 0, {
            rotation: (90),
            transformOrigin: "50% 50%",
            scaleX: (0.3),
            scaleY: (0.3),
            x: 99999
        });
        
        var path = MorphSVGPlugin.pathDataToBezier("#voutPath", { align: ".car-out" });
        
        TweenMax.set(".car-out", {
            xPercent: -50,
            yPercent: -50
        });
        
        TweenMax.staggerFrom(".car-out", CAR_TIME, {
            bezier: {
                values: path,
                type: "cubic",
                autoRotate: 90
            },
            ease: Linear.easeNone,
            repeat: -1,
        }, STAGGER_TIME);
    }
    
    function animatePlanesIn() {
        TweenMax.to(".plane-in", 0, {
            rotation: (180),
            transformOrigin: "50% 50%",
            scaleX: (0.7),
            scaleY: (0.7),
            x: (-99999),
        });
        
        var path = MorphSVGPlugin.pathDataToBezier("#flightPath", {align: ".plane-in"});
        
        TweenMax.set(".plane-in", {
            xPercent: -50,
            yPercent: -50,
        });
        
        TweenMax.staggerTo(".plane-in", FLIGHT_TIME, {
            bezier: {
                values: path,
                type: "cubic",
                autoRotate: 270
            },
            ease: Linear.easeNone,
            repeat: -1,
        }, STAGGER_TIME);
    }
    
    function animatePlanesOut() {
        TweenMax.to(".plane-out", 0, {
            rotation: (180),
            transformOrigin: "50% 50%",
            scaleX: (0.7),
            scaleY: (0.7),
            x: (-1000)
        });
        
        var path = MorphSVGPlugin.pathDataToBezier("#flightPath", {align: ".plane-out"});
        
        TweenMax.set(".plane-out", {
            xPercent: -50,
            yPercent: -50,
        });
        
        // TODO: Offset planes in opposite directions by small margin.
        
        TweenMax.staggerFrom(".plane-out", FLIGHT_TIME, {
            bezier: {
                values: path,
                type: "cubic",
                autoRotate: 90
            },
            ease: Linear.easeNone,
            repeat: -1,
        }, STAGGER_TIME);
    }
    
    function animate() {
        animateIncomingCars();
        animateOutgoingCars();
        animatePlanesIn();
        animatePlanesOut();
    }
    
    return {
        spawnIncomingCars: spawnIncomingCars,
        spawnOutgoingCars: spawnOutgoingCars,
        spawnPlanesIn: spawnPlanesIn,
        spawnPlanesOut: spawnPlanesOut,
        animate: animate
    }
    
})();