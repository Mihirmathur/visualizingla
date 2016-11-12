TweenMax.to("#car1", 0, {rotation: (90), transformOrigin: "50% 50%"});

var path = MorphSVGPlugin.pathDataToBezier("#carpath", 
                                           {align: "#car1"});

TweenMax.set("#car1", {xPercent: -50, yPercent: -50});

TweenMax.to("#car1", 5, 
            { bezier:{values:path, type:"cubic", autoRotate: 90}, 
            ease:Linear.easeNone, 
            repeat:-1,
            });