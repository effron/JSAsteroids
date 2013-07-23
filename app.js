$(function () {
  var canvas = $("<canvas width='" + 600 +
                 "' height='" + 400 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(canvas.get(0)).start();
});
