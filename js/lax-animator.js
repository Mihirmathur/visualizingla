var NUM_CARS = 10;
var STAGGER_TIME = 1.0;
var LOOP_TIME = 7.0;
var CAR_COLORS = ['#000000', '#024700', '#7a1111', '#1b0144', '#005AC1']

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getChoiceColor() {
  var rand = Math.floor(Math.random() * 6);
  return CAR_COLORS[rand];
}

function createCar() {
  // $("#mainsvg").append(carHTML);
  var car = d3.select("#mainsvg").append('g').attr('class', 'car')
  
  car.append('path')
    .attr('fill', getChoiceColor())
    .attr('d', 'M117.784,128.363c0,6.169-2.904,11.169-6.899,11.169H88.106c-3.995,0-7.178-5-7.178-11.169V90.144l1.298-18.738c0-6.168,1.885-11.168,5.878-11.168h22.779c3.995,0,5.74,5,5.74,11.168l1.159,18.738V128.363z');
  car.append('path')
    .attr('fill', '#D2F8F9')
    .attr('d', 'M116.729,86.573c0.362,1.13-0.813,1.971-2.596,1.971H85.09c-1.781,0-2.958-0.841-2.596-1.971l0.252-0.743c0.336-1.052,1.92-1.815,3.553-1.815h26.622c1.635,0,3.218,0.763,3.555,1.815L116.729,86.573z');
  car.append('path')
    .attr('fill', '#D2F8F9')
    .attr('d', 'M116.729,119.932c0.362-1.766-0.813-3.08-2.596-3.08H85.09c-1.781,0-2.958,1.314-2.596,3.08l0.252,1.302c0.336,1.644,1.92,2.978,3.554,2.978h26.622c1.635,0,3.218-1.333,3.555-2.978L116.729,119.932z');
}

function animateCars() {
  TweenMax.to(".car", 0, {
      rotation: (90),
      transformOrigin: "50% 50%",
      x: -300
    });

    var path = MorphSVGPlugin.pathDataToBezier("#carpath", {
      align: ".car"
    });

    TweenMax.set(".car", {
      xPercent: -50,
      yPercent: -50
    });

    TweenMax.staggerTo(".car", LOOP_TIME, {
      bezier: {
        values: path,
        type: "cubic",
        autoRotate: 90
      },
      ease: Linear.easeNone,
      repeat: -1,
    }, STAGGER_TIME);
}

for (var i = 0; i < NUM_CARS; i++) {
  createCar();
}

animateCars();