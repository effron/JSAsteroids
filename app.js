$(function () {
  var canvas = $("<canvas width='" + 800 +
                 "' height='" + 600 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(canvas.get(0)).start();
});
